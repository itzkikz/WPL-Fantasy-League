
// Create sheets client


import { convertToJSON } from "../utils";
import { NextFunction, Request, Response } from "express";
import { StandingsResponse, TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";

import { FantasyTeam } from "../models/FantasyTeam";
import { Player } from "../models/Player";
import { Team } from "../models/Team";

export const getStandings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teams = await FantasyTeam.find({}).lean();

        // Calculate global current gameweek (max of all teams)
        const globalCurrentGw = teams.reduce((max, team) => Math.max(max, team.currentGw), 0);

        const standingsData: StandingsResponse[] = teams.map(team => {
            const history = team.history || [];
            // Determine previous rank from history (for pos_change)
            // Assuming history is sorted by gameweek, or we find the last one < globalCurrentGw
            const lastHistory = history.find(h => h.gameweek === globalCurrentGw - 1);
            const _previousRank = lastHistory?.rank || 0;

            // 1. Calculate History Points
            const historyPoints = (team.history || []).reduce((sum, h) => sum + (h.points || 0), 0);

            // 2. Calculate Current Squad Points
            // Only add if this gameweek is NOT already in history (to avoid double counting)
            let squadPoints = 0;
            if (team.currentSquad && team.currentSquad.picks && team.currentSquad.picks.length > 0) {
                const alreadyInHistory = (team.history || []).some(h => h.gameweek === team.currentSquad.gameweek);
                if (!alreadyInHistory) {
                    squadPoints = team.currentSquad.points || 0;
                }
            }

            const totalPoints = historyPoints + squadPoints;

            // For "current_gw" display, we try to use the squad points if it looks like the active/latest one
            // or fetch the filtered history matching globalCurrentGw.
            // But usually the frontend wants to know "How many points did I get THIS week?".
            // If globalCurrentGw matches filtered history, use that.

            // Re-using simplified previousPoints logic:
            // "total_point_before_this_gw" usually means Points BEFORE the current active GW.
            const previousPoints = (team.history || [])
                .filter(h => h.gameweek < globalCurrentGw)
                .reduce((sum, h) => sum + h.points, 0);

            // Determine if we have a specific entry for Global Current GW
            let currentGwPoints = 0;
            const currentGwHistory = (team.history || []).find(h => h.gameweek === globalCurrentGw);
            if (currentGwHistory) {
                currentGwPoints = currentGwHistory.points;
            } else if (team.currentSquad && team.currentSquad.gameweek === globalCurrentGw) {
                currentGwPoints = team.currentSquad.points;
            }

            return {
                team: team.name,
                team_id: team._id.toString(),
                gw: team.currentGw,
                current_gw: currentGwPoints,
                total: totalPoints, // The requested sum
                total_point_before_this_gw: previousPoints,
                last_update_date: (team as any).updatedAt?.toISOString() || new Date().toISOString(),
                pos_change: 0,
                _prevRank: _previousRank
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

            // Calculate change if prevRank is valid (non-zero implies existing history)
            // Example: Prev 5, Curr 3 -> 5 - 3 = +2 (Up 2 spots)
            // Example: Prev 2, Curr 5 -> 2 - 5 = -3 (Down 3 spots)
            if (prevRank > 0) {
                teamData.pos_change = prevRank - currentRank;
            } else {
                teamData.pos_change = 0; // New team or GW 1
            }

            delete (teamData as any)._prevRank; // Cleanup
        });

        res.set('Cache-Control', 'public, max-age=60, s-maxage=60'); // Reduce cache for live db data
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

        const currentGw = team.currentGw;
        const targetGw = requestedGw === 0 ? currentGw : requestedGw;

        // 2. Identify the source of picks (History or Current Squad)
        let picks: any[] = [];

        // Check history first
        const historyEntry = team.history.find(h => h.gameweek === targetGw);

        if (historyEntry) {
            picks = historyEntry.picks;
        } else if (targetGw === currentGw) {
            // If strictly current GW and not yet in history (maybe live?), use currentSquad
            picks = team.currentSquad.picks;
        }

        if (!picks || picks.length === 0) {
            return res.json({
                success: true,
                data: {
                    avg: 0,
                    highest: 0,
                    starting: { GK: [], DEF: [], MID: [], FWD: [] },
                    bench: { GK: [], DEF: [], MID: [], FWD: [] },
                    gw: targetGw,
                    currentGw,
                    totalGWScore: 0
                }
            });
        }

        // 3. Fetch Players Details
        const playerIds = picks.map(p => p.element);
        const players = await Player.find({ id: { $in: playerIds } }).lean();
        const playerMap = new Map(players.map(p => [p.id, p]));

        // Fetch Teams for Club Name lookup
        const teams = await Team.find({}).lean();
        const teamMap = new Map(teams.map((t: any) => [t.id, t]));

        // 4. Transform to TeamDetails format
        const detailsData = picks.map(pick => {
            const player = playerMap.get(pick.element);
            if (!player) return null; // Should not happen if data is synced

            // Find history for the target GW for stats
            const playerGwHistory = (player.history || []).find(h => h.gameweek === targetGw);

            const positionMap = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
            const posString = positionMap[player.elementType as 1 | 2 | 3 | 4] || 'UNK';

            let lineupType: 'Starting XI' | 'SUB 1' | 'SUB 2' | 'SUB 3' | 'SUB 4' = 'Starting XI';
            if (pick.position > 11) {
                const subIndex = pick.position - 11;
                lineupType = `SUB ${subIndex}` as any;
            }

            const clubData = teamMap.get(player.teamId);
            const clubName = clubData ? clubData.name : "Unknown";
            const teamShortName = clubData ? (clubData.nameCode || clubData.shortName) : "UNK";
            const teamColor = clubData && clubData.teamColors ? clubData.teamColors.primary : "#003399";
            const teamTextColor = clubData && clubData.teamColors ? clubData.teamColors.text : "#ffffff";


            return {
                gw: targetGw,
                team_name: team.name, // The user's team name
                player_id: Number(pick.element), // Use the element ID directly
                player_name: player.name || player.webName,
                position: posString,
                lineup: lineupType,
                role: pick.isCaptain ? 'CAPTAIN' : (pick.isViceCaptain ? 'VICE CAPTAIN' : null),
                club: clubName,
                // Use XPoint from snapshot for team contribution
                point: Number((pick as any).statsSnapshot?.points) || 0,
                // Using appearances if available, checking existing implementation details in interface
                app: Number(playerGwHistory?.appearances) || 0,
                goal: Number(playerGwHistory?.goalsScored) || 0,
                assist: Number(playerGwHistory?.assists) || 0,
                clean_sheet: Number(playerGwHistory?.cleanSheets) || 0,
                save: Number(playerGwHistory?.saves) || 0,
                red_card: Number(playerGwHistory?.redCards) || 0,
                yellow_card: Number(playerGwHistory?.yellowCards) || 0,
                penalty_miss: Number(playerGwHistory?.penaltiesMissed) || 0,
                penalty_save: Number(playerGwHistory?.penaltiesSaved) || 0,
                team_short_name: teamShortName,
                team_color: teamColor,
                team_text_color: teamTextColor,
                shirtNumber: player.shirtNumber || 0
            } as unknown as TeamDetails;
        }).filter((d): d is TeamDetails => d !== null);

        // 5. Calculate Aggregates
        // Average and Highest from Team History
        const gwPoints = team.history.map(h => h.points);
        const avg = gwPoints.length > 0 ? (gwPoints.reduce((a, b) => a + b, 0) / gwPoints.length).toFixed(2) : "0.00";
        const highest = gwPoints.length > 0 ? Math.max(...gwPoints) : 0;

        // Total GW Score
        // For historical GWs, rely on history entry points.
        // For live/current, sum the player points? Or use the history entry if present.
        // If we found historyEntry earlier, we can just use historyEntry.points.
        let totalGWScore = 0;
        if (historyEntry) {
            totalGWScore = historyEntry.points;
        } else {
            // Calculate from players if using currentSquad (live) - Logic to verify with subs
            // Logic: Sum of starting XI (pos <= 11) unless autosub happen etc.
            // For simplicity, sum of starters.
            totalGWScore = detailsData.reduce((acc, curr) => {
                if (curr.lineup === 'Starting XI') return acc + curr.point;
                return acc;
            }, 0);
        }

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