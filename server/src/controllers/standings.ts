
// Create sheets client


import { convertToJSON, resolvePosition } from "../utils";
import { NextFunction, Request, Response } from "express";
import { StandingsResponse, TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";
import { aggregateMatchStats, getGameweekPoints, getGameweekMinutes, getGameweekStats, getGameweekForm, getGameweekEntries, getGameweekBreakdown, buildCurrentWeek } from "./players";
import { getSeasonPointsBreakdown } from "../lib/points";
import { computeTeamGwScore } from "../lib/fantasyScore";

import { FantasyTeam } from "../models/FantasyTeam";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { Gameweek } from "../models/Gameweek";
import { PlayerStats } from "../models/PlayerStats";
import { Transfer } from "../models/Transfer";
import { Fixture } from "../models/Fixture";

let cachedStandingsData: StandingsResponse[] | null = null;
let lastStandingsFetchTime = 0;
const STANDINGS_CACHE_TTL_MS = 30000; // 30 seconds

export const invalidateStandingsCache = () => {
    cachedStandingsData = null;
    lastStandingsFetchTime = 0;
};

export const getStandingsData = async () => {
    const now = Date.now();
    if (cachedStandingsData && (now - lastStandingsFetchTime < STANDINGS_CACHE_TTL_MS)) {
        return cachedStandingsData.map(item => ({ ...item }));
    }

    const teams = await FantasyTeam.find({})
        .select('name history currentSquad updatedAt managers managerDisplayNames logo')
        .populate('managers', 'username displayName')
        .lean();

    const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
    const globalCurrentGw = currentGwDoc ? currentGwDoc.number : 1;

    const playerStats = await PlayerStats.find({})
        .select('playerId gameweeks.id gameweeks.points gameweeks.stats.minutesPlayed')
        .lean();
    const playerStatsMap = new Map();
    playerStats.forEach(ps => playerStatsMap.set(ps.playerId, ps));

    const standingsData: StandingsResponse[] = teams.map(team => {
        const history = team.history || [];

        let totalPoints = 0;
        let previousPoints = 0;
        let currentGwPoints = 0;

        if (history.length > 0) {
            history.forEach((h: any) => {
                const gwScore = computeTeamGwScore(h.picks, h.gameweek, playerStatsMap);
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
            const gwScore = computeTeamGwScore(team.currentSquad.picks, globalCurrentGw, playerStatsMap);
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
            logo: team.logo || "",
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

    cachedStandingsData = standingsData;
    lastStandingsFetchTime = now;

    return standingsData.map(item => ({ ...item }));
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
                    if (getGameweekMinutes(cStats.gameweeks, gwId) > 0) {
                        captainPlayed = true;
                    }
                }
            }

            picks.forEach(pick => {
                if (!pick.isStarting) return;

                const statsDoc = psMap.get(pick.playerId);
                if (statsDoc && statsDoc.gameweeks) {
                    const pts = getGameweekPoints(statsDoc.gameweeks, gwId);
                    if (pts > 0) {
                        score += pick.isCaptain && captainPlayed
                            ? pts * 2
                            : (pick.isViceCaptain && !captainPlayed ? pts * 2 : pts);
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
        let preAutoSubPicks: any[] | null = null;

        if (targetGw === currentGw && team.currentSquad && team.currentSquad.picks && team.currentSquad.picks.length > 0) {
            picks = team.currentSquad.picks;
        } else {
            const historyEntry = (team.history || []).find(h => h.gameweek === targetGw);
            if (historyEntry) {
                picks = historyEntry.picks;
                if (historyEntry.preAutoSubPicks && historyEntry.preAutoSubPicks.length > 0) {
                    preAutoSubPicks = historyEntry.preAutoSubPicks;
                }
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
                if (getGameweekMinutes(cPs.gameweeks, targetGw) > 0) {
                    captainPlayed = true;
                }
            }
        }

        // 4. Transform to TeamDetails format
        // Build pre-auto-sub lookup for substitution indicators
        const preAutoSubMap = new Map<number, any>();
        if (preAutoSubPicks) {
            for (const p of preAutoSubPicks) {
                preAutoSubMap.set(p.playerId, p);
            }
        }

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
                gwPoints = getGameweekPoints(ps.gameweeks, targetGw);
            }

            if (pick.isCaptain && captainPlayed) {
                gwPoints *= 2;
            } else if (pick.isViceCaptain && !captainPlayed) {
                gwPoints *= 2;
            }

            // Determine auto-sub in/out by comparing preAutoSubPicks with picks
            let subIn = false;
            let subOut = false;
            if (preAutoSubMap.size > 0) {
                const prePick = preAutoSubMap.get(pick.playerId);
                if (prePick) {
                    // Player existed in pre-auto-sub lineup
                    if (!prePick.isStarting && pick.isStarting) {
                        subIn = true; // Was on bench, now starting → subbed IN
                    } else if (prePick.isStarting && !pick.isStarting) {
                        subOut = true; // Was starting, now on bench → subbed OUT
                    }
                } else {
                    // Player not in preAutoSubPicks at all → subbed IN from free agent or new pick
                    if (pick.isStarting) {
                        subIn = true;
                    }
                }
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
                auctionPrice: player.auctionPrice,
                subIn,
                subOut
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
                    if (picks.some((p: any) => Number(p.playerId) === Number(pid))) {
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

            // Upcoming fixtures come from two overlapping sources so rescheduled /
            // double-gameweek fixtures are never dropped:
            //   1. fixtures ASSIGNED to upcoming app gameweeks (by fixtureId);
            //   2. fixtures whose roundInfo.round matches an upcoming gameweek
            //      number (gameweek fixture lists can be empty/unseeded).
            const upcomingGwDocs = (await Gameweek.find({ isCompleted: { $ne: true }, number: { $gte: targetGw } }).select('number fixtures').lean()) as any[];
            const upcomingRounds = upcomingGwDocs.map((g) => g.number);
            const upcomingFixtureIds = [...new Set(upcomingGwDocs.flatMap((g: any) => (g.fixtures || []).map(Number)))];
            const fixtureGwMap = new Map<number, number>();
            for (const g of upcomingGwDocs) {
                for (const fid of (g.fixtures || [])) fixtureGwMap.set(Number(fid), g.number);
            }

            const teamFilter = [
                { 'homeTeam.id': { $in: allTeamIds } },
                { 'awayTeam.id': { $in: allTeamIds } }
            ];
            const roundMatch = { 'roundInfo.round': { $in: upcomingRounds } };
            const assignedMatch = upcomingFixtureIds.length > 0
                ? { fixtureId: { $in: upcomingFixtureIds } }
                : null;

            const upcomingDocs = await Fixture.find({
                $and: [
                    { $or: teamFilter },
                    assignedMatch ? { $or: [roundMatch, assignedMatch] } : roundMatch
                ]
            }).sort({ startTimestamp: 1 }).lean() as any[];

            // Fetch the target gameweek's fixtures for per-match labels.
            // Use the gameweek's assigned fixture list (fixture `roundInfo.round`
            // can differ from the app gameweek number) and attach full team docs
            // (fixtures only store team ids) so opponent names resolve.
            const tgwDoc = (await Gameweek.findOne({ number: targetGw }).select('fixtures').lean()) as any;
            const tgwFixtureIds = (tgwDoc?.fixtures || []) as number[];
            const currentGwDocs = tgwFixtureIds.length > 0
                ? (await Fixture.find({ fixtureId: { $in: tgwFixtureIds } }).sort({ startTimestamp: 1 }).lean() as any[])
                : [];
            const currentGwFixtureMap = new Map(currentGwDocs.map((f: any) => {
                const home = f.homeTeam?.id != null ? teamMap.get(f.homeTeam.id) : null;
                const away = f.awayTeam?.id != null ? teamMap.get(f.awayTeam.id) : null;
                return [f.fixtureId ?? f.id, { home: home || f.homeTeam, away: away || f.awayTeam, kickoff: f.startTimestamp }];
            }));

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
                const sumGwPoints = (fullPs && (fullPs as any).gameweeks)
                    ? (fullPs as any).gameweeks.reduce((acc: number, gw: any) => acc + (Number(gw.points) || 0), 0)
                    : 0;
                (overallStats as any).total_point = ((fullPs as any)?.totalPoints && (fullPs as any).totalPoints > 0)
                    ? (fullPs as any).totalPoints
                    : sumGwPoints;

                // Current week stats
                let currentWeekStats = undefined;
                if (fullPs && (fullPs as any).gameweeks) {
                    const gwEntries = getGameweekEntries((fullPs as any).gameweeks, targetGw);
                    if (gwEntries.length > 0) {
                        currentWeekStats = buildCurrentWeek(fullPs, targetGw, playerDoc.position, playerDoc.teamId, currentGwFixtureMap);
                    }
                }

                // Upcoming fixtures
                const teamFixtures = fixturesByTeam.get(playerDoc.teamId) || [];
                const upcomingFixtures = teamFixtures.slice(0, 3).map(({ fixture: f, isHome, opponentId }, idx) => {
                    const opponentTeam = teamMap.get(opponentId);
                    const myTeam = clubData;
                    return {
                        // Label by the app gameweek the fixture is assigned to when
                        // one exists; otherwise by the fixture's chronological
                        // position (next match = current gameweek). Round numbers
                        // are unreliable here: rescheduled leagues can kick off
                        // rounds out of order (e.g. a postponed round 1 after
                        // round 2), which made one gameweek mix two match weeks.
                        gw: fixtureGwMap.get(Number(f.fixtureId ?? f.id)) || (targetGw + idx) || 0,
                        fixture_id: f.fixtureId ?? f.id,
                        kickoff: f.startTimestamp || 0,
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
                        fixture_id: 0,
                        kickoff: 0,
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
                const recentForm: any[] = (fullPs && (fullPs as any).gameweeks)
                    ? getGameweekForm((fullPs as any).gameweeks, targetGw).slice(-5)
                    : [];
                if (recentForm.length === 0) {
                    for (let i = Math.max(1, targetGw - 4); i <= targetGw; i++) {
                        recentForm.push({ gw: i, points: 0 });
                    }
                }

                // Points breakdown (per-match, summed across a multi-match gameweek)
                const pointsBreakdown: any[] = (fullPs && (fullPs as any).gameweeks)
                    ? getGameweekBreakdown((fullPs as any).gameweeks, targetGw, playerDoc.position)
                    : [];

                // Season points breakdown (per-match flooring applied and summed across all gameweeks)
                const seasonPointsBreakdown = (fullPs && (fullPs as any).gameweeks)
                    ? getSeasonPointsBreakdown((fullPs as any).gameweeks, playerDoc.position)
                    : [];

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
                    season_points_breakdown: seasonPointsBreakdown,
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

        const reqGw = req.query.gameweek ? parseInt(req.query.gameweek as string, 10) : (req.query.gw ? parseInt(req.query.gw as string, 10) : NaN);
        const targetGw = !isNaN(reqGw) && reqGw > 0 ? reqGw : currentGw;

        const targetGwDoc = (targetGw === currentGw) ? currentGwDoc : (await Gameweek.findOne({ number: targetGw }).lean() as any);
        const fixtureIds = targetGwDoc ? (targetGwDoc.fixtures || []) : [];

        const Fixture = (await import("../models/Fixture")).Fixture;

        let fixtures: any[] = [];
        if (fixtureIds.length > 0) {
            fixtures = await Fixture.find({ fixtureId: { $in: fixtureIds } }).sort({ startTimestamp: 1 }).lean() as any[];
        } else {
            fixtures = await Fixture.find({ 'roundInfo.round': targetGw }).sort({ startTimestamp: 1 }).lean() as any[];
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
                round: f.roundInfo?.round || targetGw,
            };
        });

        res.json({
            success: true,
            data: {
                gameweek: targetGw,
                fixtures: mappedFixtures
            }
        });
    } catch (error: any) {
        console.error("Error fetching gameweek fixtures:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export const getFixturePlayers = async (req: Request, res: Response) => {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        if (isNaN(fixtureId)) {
            return res.status(400).json({ success: false, error: "Invalid fixture ID" });
        }

        const Fixture = (await import("../models/Fixture")).Fixture;
        const fixture = (await Fixture.findOne({ fixtureId }).lean()) as any;
        if (!fixture) {
            return res.status(404).json({ success: false, error: "Fixture not found" });
        }

        const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean() as any;
        const currentGw = currentGwDoc ? currentGwDoc.number : null;
        // The app's gameweek number may differ from the fixture's source round
        // (roundInfo.round). Resolve the gameweek this fixture is assigned to so
        // picks and player stats are looked up under the correct gameweek id.
        const assignedGwDoc = await Gameweek.findOne({ fixtures: fixtureId }).lean() as any;
        const fixtureGw = assignedGwDoc ? assignedGwDoc.number : (fixture.roundInfo?.round ?? currentGw);

        const teams = await Team.find({}, 'id name nameCode photo logo teamColors').lean() as any[];
        const teamMap = new Map(teams.map((t: any) => [t.id, t]));
        const homeInfo = teamMap.get(fixture.homeTeam?.id);
        const awayInfo = teamMap.get(fixture.awayTeam?.id);

        // Build owned players (playerId -> fantasy team names[]) for the fixture's gameweek
        const allFantasyTeams = await FantasyTeam.find({}, 'name history currentSquad.picks.playerId').lean() as any[];
        const playerToFantasyTeams = new Map<number, string[]>();
        for (const ft of allFantasyTeams) {
            let picks: any[] = [];
            if (fixtureGw === currentGw && ft.currentSquad?.picks?.length > 0) {
                picks = ft.currentSquad.picks;
            } else {
                const h = (ft.history || []).find((x: any) => x.gameweek === fixtureGw);
                if (h) picks = h.picks;
            }
            for (const pick of picks) {
                const pId = pick?.playerId;
                if (pId == null) continue;
                const list = playerToFantasyTeams.get(pId) || [];
                if (!list.includes(ft.name)) list.push(ft.name);
                playerToFantasyTeams.set(pId, list);
            }
        }

        const ownedIds = [...playerToFantasyTeams.keys()];
        if (ownedIds.length === 0) {
            return res.json({
                success: true,
                data: { fixture: null, homePlayers: [], awayPlayers: [] },
            });
        }

        const playerDocs = (await Player.find({ id: { $in: ownedIds } }, 'id name webName photo teamId position').lean()) as any[];
        const playerMap = new Map(playerDocs.map((p: any) => [p.id, p]));

        const psDocs = (await PlayerStats.find({ playerId: { $in: ownedIds } }).lean()) as any[];
        const psMap = new Map(psDocs.map((ps: any) => [ps.playerId, ps]));

        const statsForGw = (pid: number) => {
            const ps = psMap.get(pid);
            if (!ps?.gameweeks) return null;

            // 1. Try finding exact entry for this specific fixtureId
            const fixtureEntry = ps.gameweeks.find((e: any) => e && e.fixtureId === fixtureId);
            if (fixtureEntry) {
                const s = fixtureEntry.stats || {};
                return {
                    points: fixtureEntry.points || 0,
                    minutes: s.minutesPlayed || 0,
                    goals: s.goals || 0,
                    assists: s.goalAssist || 0,
                    cleanSheet: s.cleanSheet || 0,
                    yellowCards: s.yellowCards || 0,
                    redCards: s.redCards || 0,
                    penaltyMissed: s.penaltyMissed || 0,
                    penaltySaved: s.penaltySaved || 0,
                    saves: s.saves || 0,
                    defensive: (s.totalTackle || 0) + (s.totalClearance || 0) + (s.outfielderBlock || 0) + (s.ballRecovery || 0) + (s.interceptionWon || 0),
                };
            }

            // 2. Fallback to gameweek entries if fixtureId is not present (e.g. legacy data)
            const entries = getGameweekEntries(ps.gameweeks, fixtureGw);
            if (entries.length === 0) return null;

            if (entries.length === 1) {
                const e = entries[0];
                const s = e.stats || {};
                return {
                    points: e.points || 0,
                    minutes: s.minutesPlayed || 0,
                    goals: s.goals || 0,
                    assists: s.goalAssist || 0,
                    cleanSheet: s.cleanSheet || 0,
                    yellowCards: s.yellowCards || 0,
                    redCards: s.redCards || 0,
                    penaltyMissed: s.penaltyMissed || 0,
                    penaltySaved: s.penaltySaved || 0,
                    saves: s.saves || 0,
                    defensive: (s.totalTackle || 0) + (s.totalClearance || 0) + (s.outfielderBlock || 0) + (s.ballRecovery || 0) + (s.interceptionWon || 0),
                };
            }

            // If multiple entries exist in this GW but none matched fixtureId, player had no stats in this specific fixture
            return {
                points: 0,
                minutes: 0,
                goals: 0,
                assists: 0,
                cleanSheet: 0,
            };
        };

        const buildPlayer = (teamId: number): any[] => {
            const out: any[] = [];
            for (const pId of ownedIds) {
                const pd = playerMap.get(pId);
                if (!pd || pd.teamId !== teamId) continue;
                out.push({
                    playerId: pId,
                    name: pd.webName || pd.name || "",
                    photo: pd.photo || "",
                    position: resolvePosition(pd.position || ''),
                    teamId: pd.teamId,
                    fantasyTeams: playerToFantasyTeams.get(pId) || [],
                    ...(statsForGw(pId) || { points: 0 }),
                });
            }
            return out;
        };

        res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
        res.json({
            success: true,
            data: {
                fixture: {
                    fixtureId: fixture.fixtureId,
                    startTimestamp: fixture.startTimestamp,
                    status: fixture.status,
                    homeScore: fixture.homeScore,
                    awayScore: fixture.awayScore,
                    homeTeam: {
                        id: fixture.homeTeam?.id,
                        name: homeInfo?.name || "Unknown",
                        shortName: homeInfo?.nameCode || homeInfo?.shortName || "UNK",
                        photo: homeInfo?.photo || "",
                        logo: homeInfo?.logo || "",
                        color: homeInfo?.teamColors?.primary || "#003399",
                    },
                    awayTeam: {
                        id: fixture.awayTeam?.id,
                        name: awayInfo?.name || "Unknown",
                        shortName: awayInfo?.nameCode || awayInfo?.shortName || "UNK",
                        photo: awayInfo?.photo || "",
                        logo: awayInfo?.logo || "",
                        color: awayInfo?.teamColors?.primary || "#003399",
                    },
                    gameweek: fixtureGw,
                },
                homePlayers: buildPlayer(fixture.homeTeam?.id),
                awayPlayers: buildPlayer(fixture.awayTeam?.id),
            },
        });
    } catch (error: any) {
        console.error("Error fetching fixture players:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getManagerOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { teamId } = req.params;

        // 1. Find the FantasyTeam
        const fantasyTeam = await FantasyTeam.findById(teamId)
            .populate('managers', 'username displayName')
            .lean();

        if (!fantasyTeam) {
            return res.status(404).json({ error: "Fantasy Team not found" });
        }

        const { currentSquad, name: teamName, managerDisplayNames } = fantasyTeam;
        const history = fantasyTeam.history || [];

        // Extract manager names list
        const managersList = (fantasyTeam.managers as any[]).map(m => m.displayName || m.username || "");
        const managersString = managersList.length > 0 ? managersList.join(", ") : managerDisplayNames || "Unknown";

        // 2. Fetch current standing (Rank, Total Points, GW Points)
        const standingsData = await getStandingsData();
        const myStanding = standingsData.find(s => s.team_id === teamId);
        
        const rank = (myStanding as any)?.rank || (standingsData.findIndex(s => s.team_id === teamId) + 1) || 1;
        const totalPoints = myStanding?.total || 0;
        const gwPoints = myStanding?.current_gw || 0;

        // 3. Resolve Current Squad to FormationResult
        const playerIds = currentSquad.picks.map(p => p.playerId);
        const playersMap = (await Player.find({ id: { $in: playerIds } }).lean()) as any[];
        const pMap = new Map(playersMap.map(p => [p.id, p]));

        const teamIds = [...new Set(playersMap.map(p => p.teamId))];
        const teams = (await Team.find({ id: { $in: teamIds } }).lean()) as any[];
        const teamMap = new Map(teams.map(t => [t.id, t]));

        // Fetch current Gameweek
        let currentGwDoc = await Gameweek.findOne({ isCurrent: true });
        if (!currentGwDoc) {
            currentGwDoc = await Gameweek.findOne({ isNext: true });
        }
        const targetGw = currentGwDoc ? currentGwDoc.number : 1;

        // Upcoming fixtures for the squad's clubs (next non-completed gameweeks)
        const squadTeamIds = [...new Set(playersMap.map(p => p.teamId).filter(Boolean))];
        const upcomingGwDocs = (await Gameweek.find({ isCompleted: { $ne: true }, number: { $gte: targetGw } }).select('number fixtures').lean()) as any[];
        const upcomingRounds = upcomingGwDocs.map((g) => g.number);
        const upcomingFixtureIds = [...new Set(upcomingGwDocs.flatMap((g: any) => (g.fixtures || []).map(Number)))];
        const fixtureGwMap = new Map<number, number>();
        for (const g of upcomingGwDocs) {
            for (const fid of (g.fixtures || [])) fixtureGwMap.set(Number(fid), g.number);
        }
        const upcomingDocs = (await Fixture.find({
            $and: [
                { $or: [
                    { 'homeTeam.id': { $in: squadTeamIds } },
                    { 'awayTeam.id': { $in: squadTeamIds } }
                ] },
                upcomingFixtureIds.length > 0
                    ? { $or: [
                        { 'roundInfo.round': { $in: upcomingRounds } },
                        { fixtureId: { $in: upcomingFixtureIds } }
                    ] }
                    : { 'roundInfo.round': { $in: upcomingRounds } }
            ]
        }).sort({ startTimestamp: 1 }).lean()) as any[];

        const upcomingTeamIds = [...new Set(upcomingDocs.flatMap((f: any) => [f.homeTeam?.id, f.awayTeam?.id]).filter(Boolean))];
        const upcomingTeamDocs = (await Team.find({ id: { $in: upcomingTeamIds } }).lean()) as any[];
        const upcomingTeamMap = new Map(upcomingTeamDocs.map((t: any) => [t.id, t]));

        const fixturesByTeam = new Map<number, any[]>();
        for (const f of upcomingDocs) {
            const homeId = f.homeTeam?.id;
            const awayId = f.awayTeam?.id;
            if (homeId && !fixturesByTeam.has(homeId)) fixturesByTeam.set(homeId, []);
            if (awayId && !fixturesByTeam.has(awayId)) fixturesByTeam.set(awayId, []);
            if (homeId) fixturesByTeam.get(homeId)!.push({ fixture: f, isHome: true, opponentId: awayId });
            if (awayId) fixturesByTeam.get(awayId)!.push({ fixture: f, isHome: false, opponentId: homeId });
        }

        // Fetch PlayerStats for points
        const playerStatsList = await PlayerStats.find({
            playerId: { $in: [...playerIds, ...playerIds.map(id => Number(id)).filter(n => !isNaN(n))] }
        }).select('playerId totalPoints gameweeks').lean();

        const playerStatsMap = new Map();
        playerStatsList.forEach(ps => {
            playerStatsMap.set(ps.playerId, ps);
            playerStatsMap.set(String(ps.playerId), ps);
            playerStatsMap.set(Number(ps.playerId), ps);
        });

        let captainPlayed = false;
        const captainPick = currentSquad.picks.find(p => p.isCaptain);
        if (captainPick) {
            const cPs = playerStatsMap.get(captainPick.playerId) || playerStatsMap.get(Number(captainPick.playerId));
            if (cPs && cPs.gameweeks) {
                if (getGameweekMinutes(cPs.gameweeks, targetGw) > 0) {
                    captainPlayed = true;
                }
            }
        }

        const squadAsTeamDetails: TeamDetails[] = currentSquad.picks.map((pick) => {
            const playerDoc = pMap.get(pick.playerId);
            const teamDoc = playerDoc ? teamMap.get(playerDoc.teamId) : null;

            // Next 3 fixtures for this player's club
            const teamFixtures = playerDoc ? (fixturesByTeam.get(playerDoc.teamId) || []) : [];
            const upcomingFixtures = teamFixtures.slice(0, 3).map(({ fixture: f, isHome, opponentId }, idx) => {
                const opponentTeam = upcomingTeamMap.get(opponentId);
                return {
                    // Label by the app gameweek the fixture is assigned to when one
                    // exists; otherwise by chronological position (next match =
                    // current gameweek). Round numbers are not chronological for
                    // rescheduled leagues (a postponed round 1 can kick off after
                    // round 2), which previously mixed two match weeks into one
                    // label and showed gameweeks out of kickoff order.
                    gw: fixtureGwMap.get(Number(f.fixtureId ?? f.id)) || (targetGw + idx) || 0,
                    fixture_id: f.fixtureId ?? f.id,
                    kickoff: f.startTimestamp || 0,
                    opponent_short_name: opponentTeam?.nameCode || opponentTeam?.shortName || "UNK",
                    opponent_logo: opponentTeam?.logo || "",
                    opponent_color: opponentTeam?.teamColors?.primary || "#003399",
                    opponent_text_color: opponentTeam?.teamColors?.text || "#ffffff",
                    my_team_short_name: teamDoc?.nameCode || "UNK",
                    my_team_logo: teamDoc?.logo || "",
                    is_home: isHome
                };
            });
            while (upcomingFixtures.length < 3) {
                const nextGw = targetGw + upcomingFixtures.length;
                upcomingFixtures.push({
                    gw: nextGw,
                    fixture_id: 0,
                    kickoff: 0,
                    opponent_short_name: "TBD",
                    opponent_logo: "",
                    opponent_color: "#1b1035",
                    opponent_text_color: "#ffffff",
                    my_team_short_name: teamDoc?.nameCode || "UNK",
                    my_team_logo: teamDoc?.logo || "",
                    is_home: true
                });
            }

            const ps = playerStatsMap.get(pick.playerId) || playerStatsMap.get(Number(pick.playerId));
            // Recent form (last 5 gameweeks)
            const recentForm = (ps && Array.isArray(ps.gameweeks))
                ? getGameweekForm(ps.gameweeks, targetGw).slice(-5)
                : [];
            const sumGwPts = (ps && Array.isArray(ps.gameweeks))
                ? ps.gameweeks.reduce((acc: number, gw: any) => acc + (Number(gw.points) || 0), 0)
                : 0;
            const totalSeasonPoints = (ps && typeof ps.totalPoints === "number" && ps.totalPoints > 0)
                ? ps.totalPoints
                : sumGwPts;

            // Full season aggregates + canonical season breakdown so the player
            // stats modal shows real "This Season" values (same data manager/details provides).
            let overallStats: any = aggregateMatchStats([]);
            if (ps && Array.isArray(ps.gameweeks)) {
                overallStats = aggregateMatchStats(ps.gameweeks);
            }
            (overallStats as any).total_point = totalSeasonPoints;
            const seasonPointsBreakdown = (ps && Array.isArray(ps.gameweeks))
                ? getSeasonPointsBreakdown(ps.gameweeks, playerDoc?.position)
                : [];

            let gwPoints = 0;
            if (ps && ps.gameweeks) {
                gwPoints = getGameweekPoints(ps.gameweeks, targetGw);
            }

            if (pick.isCaptain && captainPlayed) {
                gwPoints *= 2;
            } else if (pick.isViceCaptain && !captainPlayed) {
                gwPoints *= 2;
            }

            return {
                player_id: pick.playerId,
                player_name: playerDoc?.webName || playerDoc?.name || "Unknown",
                team_name: teamName,
                gw: targetGw,
                point: totalSeasonPoints,
                gwPoint: gwPoints,
                playerStats: {
                    player_name: playerDoc?.webName || playerDoc?.name || "Unknown",
                    club: teamDoc?.team?.name || teamDoc?.name || "Unknown",
                    fantasy_team_name: teamName,
                    position: resolvePosition(playerDoc?.position || ''),
                    auctionPrice: playerDoc?.auctionPrice,
                    overall: overallStats,
                    recent_form: recentForm,
                    upcoming_fixtures: upcomingFixtures,
                    season_points_breakdown: seasonPointsBreakdown
                },
                position: resolvePosition(playerDoc?.position || ''),
                price: playerDoc?.price?.nowCost || 0,
                club: teamDoc?.team?.name || teamDoc?.name || "Unknown",
                lineup: pick.isStarting ? "Starting XI" : `Sub ${pick.subNumber || 0}`,
                role: pick.isCaptain ? "CAPTAIN" : pick.isViceCaptain ? "VICE CAPTAIN" : null,
                team_short_name: teamDoc?.nameCode || teamDoc?.shortName || "UNK",
                team_color: teamDoc?.teamColors?.primary || "#003399",
                team_text_color: teamDoc?.teamColors?.text || "#ffffff",
                team_logo: teamDoc?.logo || "",
                shirtNumber: playerDoc?.shirtNumber || 0,
                photo: playerDoc?.photo || "",
                auctionPrice: playerDoc?.auctionPrice
            } as any;
        });

        const currentSquadFormation = convertToFormation(squadAsTeamDetails);

        // 4. Calculate Historical Points
        const allHistoryPicks = history.flatMap(h => h.picks);
        const allHistoryPlayerIds = [...new Set(allHistoryPicks.map(p => p.playerId))];
        const historyPlayerStats = await PlayerStats.find({ playerId: { $in: allHistoryPlayerIds } }).lean();
        const historyPsMap = new Map(historyPlayerStats.map(ps => [ps.playerId, ps]));

        const computeHistoryScore = (picks: any[], gwId: number) => {
            let score = 0;
            let capPlayed = false;

            const capPick = picks.find(p => p.isCaptain);
            if (capPick) {
                const cStats = historyPsMap.get(capPick.playerId);
                if (cStats && cStats.gameweeks) {
                    if (getGameweekMinutes(cStats.gameweeks, gwId) > 0) {
                        capPlayed = true;
                    }
                }
            }

            picks.forEach(pick => {
                if (!pick.isStarting) return;

                const statsDoc = historyPsMap.get(pick.playerId);
                if (statsDoc && statsDoc.gameweeks) {
                    const pts = getGameweekPoints(statsDoc.gameweeks, gwId);
                    if (pts > 0) {
                        score += pick.isCaptain && capPlayed
                            ? pts * 2
                            : (pick.isViceCaptain && !capPlayed ? pts * 2 : pts);
                    }
                }
            });
            return score;
        };

        const historyList = history.map(h => ({
            gameweek: h.gameweek,
            points: computeHistoryScore(h.picks, h.gameweek),
        })).sort((a, b) => a.gameweek - b.gameweek);

        // Add current gameweek to history if it has picks and is not already in history list
        if (!history.some(h => h.gameweek === targetGw)) {
            const currentGwPointsCalculated = squadAsTeamDetails
                .filter(p => p.lineup === "Starting XI")
                .reduce((acc, p) => acc + (p.gwPoint || 0), 0);
            
            historyList.push({
                gameweek: targetGw,
                points: currentGwPointsCalculated,
            });
        }

        // 5. Fetch the team's transfer history
        const transfers = await Transfer.find({ fantasyTeam: fantasyTeam._id })
            .sort({ date: -1, createdAt: -1 })
            .lean();

        return res.json({
            data: {
                teamId,
                teamName,
                logo: fantasyTeam.logo || "",
                managers: managersString,
                rank,
                totalPoints,
                gwPoints,
                finance: fantasyTeam.finance || null,
                currentSquad: currentSquadFormation,
                history: historyList,
                transfers
            }
        });

    } catch (error) {
        console.error("Error in getManagerOverview:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};