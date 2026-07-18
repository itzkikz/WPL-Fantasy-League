
// Create sheets client


import { convertToJSON, resolvePosition } from "../utils";
import { NextFunction, Request, Response } from "express";
import { StandingsResponse, TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";
import { aggregateMatchStats } from "./players";

import { FantasyTeam } from "../models/FantasyTeam";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { Gameweek } from "../models/Gameweek";
import { PlayerStats } from "../models/PlayerStats";

export const getStandingsData = async () => {
    const teams = await FantasyTeam.find({})
        .select('name history currentSquad updatedAt managers managerDisplayNames')
        .populate('managers', 'username displayName')
        .lean();

    const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
    const globalCurrentGw = currentGwDoc ? currentGwDoc.number : 1;

    const playerStats = await PlayerStats.find({}).lean();
    const playerStatsMap = new Map();
    playerStats.forEach(ps => playerStatsMap.set(ps.playerId, ps));

    const computeScore = (picks: any[], gwId: number) => {
        let score = 0;
        let captainPlayed = false;

        const captainPick = picks.find(p => p.isCaptain);
        if (captainPick) {
            const cStats = playerStatsMap.get(captainPick.playerId);
            if (cStats && cStats.gameweeks) {
                const cGw = cStats.gameweeks.find((g: any) => g.id === gwId);
                if (cGw && cGw.stats && cGw.stats.minutesPlayed > 0) {
                    captainPlayed = true;
                }
            }
        }

        picks.forEach(pick => {
            if (!pick.isStarting) return;

            const statsDoc = playerStatsMap.get(pick.playerId);
            if (statsDoc && statsDoc.gameweeks) {
                const gwData = statsDoc.gameweeks.find((g: any) => g.id === gwId);
                if (gwData) {
                    let pts = gwData.points || 0;

                    if (pick.isCaptain && captainPlayed) {
                        pts *= 2;
                    } else if (pick.isViceCaptain && !captainPlayed) {
                        pts *= 2;
                    }
                    score += pts;
                }
            }
        });
        return score;
    };

    const standingsData: StandingsResponse[] = teams.map(team => {
        const history = team.history || [];

        let totalPoints = 0;
        let previousPoints = 0;
        let currentGwPoints = 0;

        if (history.length > 0) {
            history.forEach((h: any) => {
                const gwScore = computeScore(h.picks, h.gameweek);
                totalPoints += gwScore;
                if (h.gameweek === globalCurrentGw) {
                    currentGwPoints = gwScore;
                } else if (h.gameweek < globalCurrentGw) {
                    previousPoints += gwScore;
                }
            });
        }

        const hasCurrentGwHistory = history.some((h: any) => h.gameweek === globalCurrentGw);
        if (!hasCurrentGwHistory && team.currentSquad && team.currentSquad.picks) {
            const gwScore = computeScore(team.currentSquad.picks, globalCurrentGw);
            currentGwPoints = gwScore;
            totalPoints += gwScore;
        }

        const managers = (team.managers as any[] || []).map(m => m.displayName || m.username).filter(Boolean);
        const managerString = managers.length > 0 
            ? managers.slice(0, 3).join(', ') 
            : (team.managerDisplayNames || '');

        return {
            team: team.name,
            team_id: team._id.toString(),
            gw: globalCurrentGw,
            current_gw: currentGwPoints,
            total: totalPoints,
            total_point_before_this_gw: previousPoints,
            last_update_date: (team as any).updatedAt?.toISOString() || new Date().toISOString(),
            pos_change: 0,
            manager: managerString
        };
    });

    // Calculate Previous Ranks (based on total_point_before_this_gw)
    const prevStandings = [...standingsData].sort((a, b) => b.total_point_before_this_gw - a.total_point_before_this_gw);
    const prevRankMap = new Map<string, number>();
    prevStandings.forEach((team, index) => {
        prevRankMap.set(team.team, index + 1);
    });

    // Sort by total points descending to determine current rank
    standingsData.sort((a, b) => b.total - a.total);

    // Update pos_change
    standingsData.forEach((teamData, index) => {
        const currentRank = index + 1;
        const prevRank = prevRankMap.get(teamData.team) || 0;

        if (prevRank > 0) {
            teamData.pos_change = prevRank - currentRank;
        } else {
            teamData.pos_change = 0; // New team or GW 1
        }
        (teamData as any).rank = currentRank;

        delete (teamData as any)._prevRank; // Cleanup
    });

    return standingsData;
};

export const getStandings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const standingsData = await getStandingsData();
        res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
        res.json({
            success: true,
            data: standingsData,
        });
    } catch (error: unknown) {
        console.error("Error reading data:", error);
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        } else {
            res.status(500).json({
                success: false,
                error: error,
            });
        }
    }
}

export const getTeamDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { teamId, gameWeek } = req.params;
        let requestedGw = parseInt(gameWeek);

        // 1. Fetch Fantasy Team by ID
        const team = await FantasyTeam.findById(teamId);

        if (!team) {
            return res.status(404).json({ success: false, error: 'Team not found' });
        }

        const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
        const currentGw = currentGwDoc ? currentGwDoc.number : 1;
        const targetGw = requestedGw === 0 ? currentGw : requestedGw;

        // Calculate global average and highest points for targetGw dynamically
        const allTeams = await FantasyTeam.find({}).select('history currentSquad').lean();

        const allPicks: any[] = [];
        const teamPicksList: any[][] = [];

        for (const t of allTeams) {
            let tPicks: any[] = [];
            if (targetGw === currentGw && t.currentSquad && t.currentSquad.picks && t.currentSquad.picks.length > 0) {
                tPicks = t.currentSquad.picks;
            } else {
                const h = t.history?.find((x: any) => x.gameweek === targetGw);
                if (h) tPicks = h.picks;
            }
            teamPicksList.push(tPicks);
            allPicks.push(...tPicks);
        }

        const allPlayerIds = [...new Set(allPicks.map(p => p.playerId))];
        const allPlayerStats = await PlayerStats.find({ playerId: { $in: allPlayerIds } })
            .select('playerId gameweeks.id gameweeks.points gameweeks.stats')
            .lean();

        const allPsMap = new Map();
        allPlayerStats.forEach(ps => allPsMap.set(ps.playerId, ps));

        const computeScore = (picks: any[], gwId: number, psMap: Map<any, any>) => {
            let score = 0;
            let captainPlayed = false;

            const captainPick = picks.find(p => p.isCaptain);
            if (captainPick) {
                const cStats = psMap.get(captainPick.playerId);
                if (cStats && cStats.gameweeks) {
                    const cGw = cStats.gameweeks.find((g: any) => g.id === gwId);
                    if (cGw && cGw.stats && cGw.stats.minutesPlayed > 0) {
                        captainPlayed = true;
                    }
                }
            }

            picks.forEach(pick => {
                if (!pick.isStarting) return;

                const statsDoc = psMap.get(pick.playerId);
                if (statsDoc && statsDoc.gameweeks) {
                    const gwData = statsDoc.gameweeks.find((g: any) => g.id === gwId);
                    if (gwData) {
                        let pts = gwData.points || 0;
                        if (pick.isCaptain && captainPlayed) {
                            pts *= 2;
                        } else if (pick.isViceCaptain && !captainPlayed) {
                            pts *= 2;
                        }
                        score += pts;
                    }
                }
            });
            return score;
        };

        const allGwScores = teamPicksList.map(picks => computeScore(picks, targetGw, allPsMap));
        let avg = "0.00";
        let highest = 0;
        if (allGwScores.length > 0) {
            avg = (allGwScores.reduce((a, b) => a + b, 0) / allGwScores.length).toFixed(2);
            highest = Math.max(...allGwScores);
        }

        // 2. Identify the source of picks (History or Current Squad)
        let picks: any[] = [];

        if (targetGw === currentGw && team.currentSquad && team.currentSquad.picks && team.currentSquad.picks.length > 0) {
            picks = team.currentSquad.picks;
        } else {
            const historyEntry = team.history.find(h => h.gameweek === targetGw);
            if (historyEntry) {
                picks = historyEntry.picks;
            }
        }

        if (!picks || picks.length === 0) {
            return res.json({
                success: true,
                data: {
                    avg,
                    highest,
                    starting: { GK: [], DEF: [], MID: [], FWD: [] },
                    bench: [],
                    gw: targetGw,
                    currentGw,
                    totalGWScore: 0
                }
            });
        }

        // 3. Fetch Players Details
        const playerIds = picks.map(p => p.playerId);
        const players = (await Player.find({ id: { $in: playerIds } }).lean()) as any[];
        const playerMap = new Map(players.map(p => [p.id, p]));

        // Fetch Teams for Club Name lookup (populate league for full player stats)
        const teams = (await Team.find({}).populate({ path: 'league', strictPopulate: false }).lean()) as any[];
        const teamMap = new Map(teams.map((t: any) => [t.id, t]));

        const playerStatsList = await PlayerStats.find({ playerId: { $in: playerIds } })
            .lean();
        const playerStatsMap = new Map(playerStatsList.map(ps => [ps.playerId, ps]));

        let captainPlayed = false;
        const captainPick = picks.find(p => p.isCaptain);
        if (captainPick) {
            const cPs = playerStatsMap.get(captainPick.playerId);
            if (cPs && cPs.gameweeks) {
                const cGw = cPs.gameweeks.find((g: any) => g.id === targetGw);
                if (cGw && cGw.stats && cGw.stats.minutesPlayed > 0) {
                    captainPlayed = true;
                }
            }
        }

        // 4. Transform to TeamDetails format
        const detailsData = picks.map((pick, index) => {
            const player = playerMap.get(pick.playerId);
            if (!player) return null; // Should not happen if data is synced

            // Player position is stored as a string (e.g., 'GK', 'DEF', 'MID', 'FWD')
            const posString = player.position ? player.position.toUpperCase() : 'UNK';

            // Determine lineup based on new schema fields
            let lineupType: 'Starting XI' | 'SUB 1' | 'SUB 2' | 'SUB 3' | 'SUB 4' = pick.isStarting
                ? 'Starting XI'
                : `SUB ${pick.subNumber || 0}` as any;

            const clubData = teamMap.get(player.teamId);
            const clubName = clubData ? clubData.name : "Unknown";
            const teamShortName = clubData ? clubData.nameCode : "UNK";
            const teamColor = clubData && clubData.teamColors ? clubData.teamColors.primary : "#003399";
            const teamTextColor = clubData && clubData.teamColors ? clubData.teamColors.text : "#ffffff";
            const teamLogo = clubData ? clubData.logo || "" : "";

            let gwPoints = 0;
            const ps = playerStatsMap.get(pick.playerId);
            if (ps && ps.gameweeks) {
                const gData = ps.gameweeks.find((g: any) => g.id === targetGw);
                if (gData) {
                    gwPoints = gData.points || 0;
                }
            }

            if (pick.isCaptain && captainPlayed) {
                gwPoints *= 2;
            } else if (pick.isViceCaptain && !captainPlayed) {
                gwPoints *= 2;
            }

            return {
                gw: targetGw,
                team_name: team.name, // The user's team name
                player_id: Number(pick.playerId),
                player_name: player.name || player.webName,
                position: resolvePosition(posString),
                lineup: lineupType,
                role: pick.isCaptain ? 'CAPTAIN' : (pick.isViceCaptain ? 'VICE CAPTAIN' : null),
                club: clubName,
                point: gwPoints,
                team_short_name: teamShortName,
                team_color: teamColor,
                team_text_color: teamTextColor,
                team_logo: teamLogo,
                shirtNumber: player.number || 0,
                photo: player.photo || "",
                isStarting: pick.isStarting,
                subNumber: pick.subNumber || 0,
                auctionPrice: player.auctionPrice
            } as unknown as TeamDetails;
        }).filter((d): d is TeamDetails => d !== null);

        // 5. Build full PlayerStats for each player (so modal doesn't need extra API calls)
        try {
            const Fixture = (await import("../models/Fixture")).Fixture;

            // Fetch all FantasyTeams for ownership calculation
            const allFantasyTeams = await FantasyTeam.find({}).select('currentSquad.picks.playerId name').lean();
            const totalTeamsCount = allFantasyTeams.length;

            const ownershipMap = new Map<number, { pct: number; teamName: string | null }>();
            for (const pid of playerIds) {
                let count = 0;
                let teamName: string | null = null;
                for (const ft of allFantasyTeams) {
                    const picks = (ft as any).currentSquad?.picks || [];
                    if (picks.some((p: any) => p.playerId === pid)) {
                        count++;
                        if (!teamName) teamName = (ft as any).name;
                    }
                }
                const pct = totalTeamsCount > 0 ? Number(((count / totalTeamsCount) * 100).toFixed(1)) : 0;
                ownershipMap.set(pid, { pct, teamName });
            }

            // Fetch upcoming fixtures for all players' teams
            const allTeamIds = [...new Set(detailsData.map(d => {
                const p = playerMap.get(d.player_id!);
                return p?.teamId;
            }).filter(Boolean))] as number[];

            const upcomingDocs = await Fixture.find({
                $and: [
                    { 'roundInfo.round': { $gte: targetGw } },
                    { 'status.type': { $ne: 'finished' } },
                    {
                        $or: [
                            { 'homeTeam.id': { $in: allTeamIds } },
                            { 'awayTeam.id': { $in: allTeamIds } }
                        ]
                    }
                ]
            }).sort({ 'roundInfo.round': 1, startTimestamp: 1 }).lean() as any[];

            // Group fixtures by team ID
            const fixturesByTeam = new Map<number, any[]>();
            for (const f of upcomingDocs) {
                const homeId = f.homeTeam?.id;
                const awayId = f.awayTeam?.id;
                if (homeId && !fixturesByTeam.has(homeId)) fixturesByTeam.set(homeId, []);
                if (awayId && !fixturesByTeam.has(awayId)) fixturesByTeam.set(awayId, []);
                if (homeId) fixturesByTeam.get(homeId)!.push({ fixture: f, isHome: true, opponentId: awayId });
                if (awayId) fixturesByTeam.get(awayId)!.push({ fixture: f, isHome: false, opponentId: homeId });
            }

            // Build full PlayerStats for each player
            for (const detail of detailsData) {
                const pid = detail.player_id;
                const playerDoc = playerMap.get(pid!);
                if (!playerDoc) continue;

                const clubData = teamMap.get(playerDoc.teamId);
                const fullPs = playerStatsMap.get(pid!);
                const ownership = ownershipMap.get(pid!) || { pct: 0, teamName: null };

                const teamColor = clubData?.teamColors?.primary || detail.team_color || "#003399";
                const teamTextColor = clubData?.teamColors?.text || detail.team_text_color || "#ffffff";
                const teamLogo = clubData?.logo || detail.team_logo || "";
                const teamShortName = clubData?.nameCode || detail.team_short_name || "UNK";
                const teamNameStr = clubData?.name || detail.club || "Unknown";
                const leagueName = clubData?.league ? (clubData.league as any).name : "Unknown League";

                // Overall stats
                let overallStats: any = aggregateMatchStats([]);
                if (fullPs && (fullPs as any).gameweeks) {
                    overallStats = aggregateMatchStats((fullPs as any).gameweeks);
                }
                (overallStats as any).total_point = (fullPs as any)?.totalPoints || 0;

                // Current week stats
                let currentWeekStats = undefined;
                if (fullPs && (fullPs as any).gameweeks) {
                    const gwData = (fullPs as any).gameweeks.find((g: any) => g.id === targetGw);
                    if (gwData && gwData.stats) {
                        currentWeekStats = { ...gwData.stats, point: gwData.points || 0 };
                    }
                }

                // Upcoming fixtures
                const teamFixtures = fixturesByTeam.get(playerDoc.teamId) || [];
                const upcomingFixtures = teamFixtures.slice(0, 3).map(({ fixture: f, isHome, opponentId }) => {
                    const opponentTeam = teamMap.get(opponentId);
                    const myTeam = clubData;
                    return {
                        gw: f.roundInfo?.round || 0,
                        opponent_short_name: opponentTeam?.nameCode || "UNK",
                        opponent_logo: opponentTeam?.logo || "",
                        opponent_color: opponentTeam?.teamColors?.primary || "#003399",
                        opponent_text_color: opponentTeam?.teamColors?.text || "#ffffff",
                        my_team_short_name: myTeam?.nameCode || "UNK",
                        my_team_logo: myTeam?.logo || "",
                        is_home: isHome
                    };
                });

                // Pad to 3
                while (upcomingFixtures.length < 3) {
                    const nextGw = targetGw + upcomingFixtures.length;
                    upcomingFixtures.push({
                        gw: nextGw,
                        opponent_short_name: "TBD",
                        opponent_logo: "",
                        opponent_color: "#1b1035",
                        opponent_text_color: "#ffffff",
                        my_team_short_name: teamShortName,
                        my_team_logo: "",
                        is_home: true
                    });
                }

                // Recent form
                const recentForm: any[] = [];
                if (fullPs && (fullPs as any).gameweeks) {
                    const sortedGws = [...(fullPs as any).gameweeks].sort((a: any, b: any) => a.id - b.id);
                    const filteredGws = sortedGws.filter((g: any) => g.id <= targetGw);
                    const last5 = filteredGws.slice(-5);
                    last5.forEach((g: any) => {
                        recentForm.push({ gw: g.id, points: g.points || 0 });
                    });
                }
                if (recentForm.length === 0) {
                    for (let i = Math.max(1, targetGw - 4); i <= targetGw; i++) {
                        recentForm.push({ gw: i, points: 0 });
                    }
                }

                // Points breakdown
                const pointsBreakdown: any[] = [];
                if (fullPs && (fullPs as any).gameweeks) {
                    const gwData = (fullPs as any).gameweeks.find((g: any) => g.id === targetGw);
                    if (gwData && gwData.stats) {
                        const s = gwData.stats;
                        const position = resolvePosition(playerDoc.position || '');
                        const minutes = s.minutesPlayed || 0;

                        if (minutes > 0) {
                            pointsBreakdown.push({ label: "Minutes Played", value: `${minutes} mins`, points: minutes >= 60 ? 2 : 1 });

                            const goals = s.goals || 0;
                            if (goals > 0) {
                                let goalPoints = 0;
                                if (position === 'GK') goalPoints = goals * 10;
                                else if (position === 'DEF') goalPoints = goals * 6;
                                else if (position === 'MID') goalPoints = goals * 5;
                                else if (position === 'FWD') goalPoints = goals * 4;
                                pointsBreakdown.push({ label: `Goals (${goals})`, value: `${goals}`, points: goalPoints });
                            }

                            const assists = s.goalAssist || 0;
                            if (assists > 0) {
                                pointsBreakdown.push({ label: `Assists (${assists})`, value: `${assists}`, points: assists * 3 });
                            }

                            if (s.cleanSheet === 1 && (position === 'GK' || position === 'DEF')) {
                                pointsBreakdown.push({ label: "Clean Sheet", value: "Yes", points: 4 });
                            } else if (s.cleanSheet === 1 && position === 'MID') {
                                pointsBreakdown.push({ label: "Clean Sheet", value: "Yes", points: 1 });
                            }

                            const yellow = s.yellowCards || 0;
                            if (yellow > 0) pointsBreakdown.push({ label: "Yellow Cards", value: `${yellow}`, points: yellow * -1 });

                            const red = s.redCards || 0;
                            if (red > 0) pointsBreakdown.push({ label: "Red Card", value: "Yes", points: -3 });

                            const penMiss = s.penaltyMissed || 0;
                            if (penMiss > 0) pointsBreakdown.push({ label: "Penalty Missed", value: `${penMiss}`, points: penMiss * -2 });

                            if (position === 'GK') {
                                const penSave = s.penaltySaved || 0;
                                if (penSave > 0) pointsBreakdown.push({ label: "Penalty Saved", value: `${penSave}`, points: penSave * 5 });
                                const gkSaves = s.saves || 0;
                                if (gkSaves >= 3) pointsBreakdown.push({ label: `Saves (${gkSaves})`, value: `${gkSaves}`, points: Math.floor(gkSaves / 3) });
                            }

                            const tackles = s.totalTackle || 0;
                            const clearances = s.totalClearance || 0;
                            const blocks = s.outfielderBlock || 0;
                            const ballRecovery = s.ballRecovery || 0;
                            const defCont = tackles + clearances + blocks + ballRecovery;
                            if (defCont > 0) {
                                let defPoints = 0;
                                if (position === 'DEF') defPoints = Math.floor(defCont / 10) * 2;
                                else defPoints = Math.floor(defCont / 12) * 2;
                                if (defPoints > 0) {
                                    pointsBreakdown.push({ label: `Defensive Actions (${defCont})`, value: `${defCont}`, points: defPoints });
                                }
                            }
                        }
                    }
                }

                // Attach full PlayerStats to the detail
                (detail as any).playerStats = {
                    player_name: playerDoc.name || playerDoc.webName || "",
                    team_name: teamNameStr,
                    position: resolvePosition(playerDoc.position || ''),
                    overall: overallStats,
                    price: playerDoc.price?.nowCost || 0,
                    release_value: playerDoc.price?.nowCost || 0,
                    club: teamNameStr,
                    league: leagueName,
                    team_short_name: teamShortName,
                    team_color: teamColor,
                    team_text_color: teamTextColor,
                    team_logo: teamLogo,
                    player_id: pid,
                    current_week: currentWeekStats,
                    photo: playerDoc.photo || "",
                    ownership: ownership.pct,
                    fantasy_team_name: ownership.teamName,
                    upcoming_fixtures: upcomingFixtures,
                    recent_form: recentForm,
                    points_breakdown: pointsBreakdown,
                    auctionPrice: playerDoc.auctionPrice
                };
            }
        } catch (statsErr) {
            console.error("Error building full player stats:", statsErr);
        }

        // 5. Calculate Aggregates

        const totalGWScore = detailsData.reduce((acc, curr) => {
            if (curr.isStarting) {
                return acc + Number(curr.point || 0);
            }
            return acc;
        }, 0);

        const { starting, bench } = convertToFormation(detailsData);

        res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
        res.json({
            success: true,
            data: {
                avg,
                highest,
                starting,
                bench,
                gw: targetGw,
                currentGw,
                totalGWScore,
                team_name: team.name, // Add team name for UI display
                team_id: team._id.toString() // Add team ID for consistency
            }
        });

    } catch (error: unknown) {
        console.error("Error reading data:", error);
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        } else {
            res.status(500).json({
                success: false,
                error: error,
            });
        }
    }
};

export const getFixturesForCurrentGameweek = async (req: Request, res: Response) => {
    try {
        const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean() as any;
        const currentGw = currentGwDoc ? currentGwDoc.number : 15;
        const fixtureIds = currentGwDoc ? (currentGwDoc.fixtures || []) : [];

        const Fixture = (await import("../models/Fixture")).Fixture;

        let fixtures: any[] = [];
        if (fixtureIds.length > 0) {
            fixtures = await Fixture.find({ fixtureId: { $in: fixtureIds } }).sort({ startTimestamp: 1 }).lean() as any[];
        } else {
            fixtures = await Fixture.find({ 'roundInfo.round': currentGw }).sort({ startTimestamp: 1 }).lean() as any[];
        }

        const teams = await Team.find({}, 'id name nameCode photo logo teamColors').lean() as any[];
        const teamMap = new Map(teams.map((t: any) => [t.id, t]));

        const mappedFixtures = fixtures.map((f: any) => {
            const home = teamMap.get(f.homeTeam?.id);
            const away = teamMap.get(f.awayTeam?.id);
            return {
                fixtureId: f.fixtureId,
                startTimestamp: f.startTimestamp,
                status: f.status,
                homeTeam: {
                    id: f.homeTeam?.id,
                    name: home?.name || "Unknown",
                    shortName: home?.nameCode || "UNK",
                    photo: home?.photo || "",
                    logo: home?.logo || "",
                    color: home?.teamColors?.primary || "#003399",
                },
                awayTeam: {
                    id: f.awayTeam?.id,
                    name: away?.name || "Unknown",
                    shortName: away?.nameCode || "UNK",
                    photo: away?.photo || "",
                    logo: away?.logo || "",
                    color: away?.teamColors?.primary || "#003399",
                },
                homeScore: f.homeScore,
                awayScore: f.awayScore,
                round: f.roundInfo?.round || currentGw,
            };
        });

        res.json({
            success: true,
            data: {
                gameweek: currentGw,
                fixtures: mappedFixtures
            }
        });
    } catch (error: any) {
        console.error("Error fetching gameweek fixtures:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}