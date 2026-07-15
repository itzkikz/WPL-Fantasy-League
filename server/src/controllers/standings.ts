
// Create sheets client


import { convertToJSON, resolvePosition } from "../utils";
import { NextFunction, Request, Response } from "express";
import { StandingsResponse, TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";

import { FantasyTeam } from "../models/FantasyTeam";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { Gameweek } from "../models/Gameweek";
import { PlayerStats } from "../models/PlayerStats";

export const getStandingsData = async () => {
    const teams = await FantasyTeam.find({})
        .select('name history currentSquad updatedAt')
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

        return {
            team: team.name,
            team_id: team._id.toString(),
            gw: globalCurrentGw,
            current_gw: currentGwPoints,
            total: totalPoints,
            total_point_before_this_gw: previousPoints,
            last_update_date: (team as any).updatedAt?.toISOString() || new Date().toISOString(),
            pos_change: 0
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
            .select('playerId gameweeks.id gameweeks.points gameweeks.stats.minutesPlayed')
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

        // Fetch Teams for Club Name lookup
        const teams = (await Team.find({}).lean()) as any[];
        const teamMap = new Map(teams.map((t: any) => [t.id, t]));

        const playerStatsList = await PlayerStats.find({ playerId: { $in: playerIds } })
            .select('playerId gameweeks.id gameweeks.points gameweeks.stats.minutesPlayed')
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

            let gwStats: any = null;
            let gwPoints = 0;
            const ps = playerStatsMap.get(pick.playerId);
            if (ps && ps.gameweeks) {
                const gData = ps.gameweeks.find((g: any) => g.id === targetGw);
                if (gData) {
                    gwStats = gData.stats;
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
                shirtNumber: player.number || 0,
                photo: player.photo || "",
                isStarting: pick.isStarting,
                subNumber: pick.subNumber || 0
            } as unknown as TeamDetails;
        }).filter((d): d is TeamDetails => d !== null);

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
}