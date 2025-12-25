import { NextFunction, Request, Response } from "express";
import { PlayerStats } from "../types/players";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import "../models/League"; // Register League model for populate

export const getPlayerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { playerName } = req.params;
        const searchValue = decodeURI(playerName).toLowerCase();

        // Find player by name (case-insensitive regex)
        const player = await Player.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${searchValue}$`, 'i') } },
                { webName: { $regex: new RegExp(`^${searchValue}$`, 'i') } },
                { slug: { $regex: new RegExp(`^${searchValue}$`, 'i') } }
            ]
        }).lean();

        if (!player) {
            return res.status(404).json({ success: false, error: "Player not found" });
        }

        // Fetch Team Details with League
        const team = await Team.findOne({ id: player.teamId }).populate('league').lean();
        let teamName = "Unknown";
        let teamShortName = "UNK";
        let teamColor = "#000000";
        let teamColorText = "#ffffff";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let leagueName = "Unknown League";

        if (team) {
            teamName = team.name;
            teamShortName = team.nameCode || team.shortName;
            teamColor = team.teamColors?.primary || "#000000";
            teamColorText = team.teamColors?.text || "#ffffff";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            leagueName = team.league ? (team.league as any).name : "Unknown League";
        }

        const positionMap: Record<number, string> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
        const positionName = positionMap[player.elementType] || "UNK";

        const data: PlayerStats = {
            player_name: player.name || player.webName,
            team_name: teamName,
            position: positionName,
            app: player.stats?.appearances || 0,
            goal: player.stats?.goalsScored || 0,
            assist: player.stats?.assists || 0,
            clean_sheet: player.stats?.cleanSheets || 0,
            save: player.stats?.saves || 0,
            red_card: player.stats?.redCards || 0,
            yellow_card: player.stats?.yellowCards || 0,
            penalty_miss: player.stats?.penaltiesMissed || 0,
            penalty_save: player.stats?.penaltiesSaved || 0,
            total_point: player.stats?.totalPoints || 0,
            price: player.price?.nowCost || 0,
            release_value: player.price?.nowCost || 0, // Fallback mapping
            club: teamName,
            league: leagueName,
            team_short_name: teamShortName,
            team_color: teamColor,
            team_text_color: teamColorText,
            player_id: player.id
        };


        res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.json({
            success: true,
            data: data,
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

export const getFullPlayerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20; // Default to 20 for infinite scroll
        const skip = (page - 1) * limit;

        const clubs = req.query.clubs ? (req.query.clubs as string).split(',') : [];
        const leagues = req.query.leagues ? (req.query.leagues as string).split(',') : [];
        const positions = req.query.positions ? (req.query.positions as string).split(',') : [];
        const freeAgents = req.query.freeAgents === 'true';

        const query: any = {};

        // 1. Filter by Positions
        if (positions.length > 0) {
            const posMap: Record<string, number> = { 'G': 1, 'D': 2, 'M': 3, 'F': 4 };
            const elementTypes = positions.map(p => posMap[p]).filter(Boolean);
            if (elementTypes.length > 0) {
                query.elementType = { $in: elementTypes };
            }
        }

        // 2. Filter by Team (Clubs & Leagues)
        // If club or league filters are present, we need to resolve team IDs first
        if (clubs.length > 0 || leagues.length > 0 || freeAgents) {
            const teamQuery: any = {};

            if (clubs.length > 0) {
                teamQuery.name = { $in: clubs.map(c => new RegExp(`^${c}$`, 'i')) };
            }

            // Note: Solving leagues requires League model or assuming populated field check
            // Since Team stores league ID, we strictly need to query League first or use populate match?
            // Simpler: Fetch teams, populate league, filter in code? No, fetch Teams matches.
            // We can find Teams where name in clubs OR belongs to leagues.

            let teamIdsFromFilter: number[] = [];

            // Just fetch all teams to map properly (efficient enough for small team count)
            const allTeams = await Team.find({}).populate('league').lean();

            const filteredTeams = allTeams.filter((t: any) => {
                let matches = true;
                if (clubs.length > 0 && !clubs.some(c => t.name.toLowerCase() === c.toLowerCase())) matches = false;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (leagues.length > 0 && !leagues.some(l => t.league && (t.league as any).name && (t.league as any).name.toLowerCase() === l.toLowerCase())) matches = false;
                return matches;
            });

            teamIdsFromFilter = filteredTeams.map(t => t.id);

            // Handle Free Agents: Assuming Free Agent team has a specific ID or name?
            // Usually they have valid teamId but special "Free Agent" team?
            // If freeAgents is TRUE, usually means ONLY free agents? Or exclude?
            // UI has explicit "Free Agents" toggle. Assuming it means "Show ONLY Free Agents" if checked (often checkbox filter logic)
            // But UI code: if freeAgentSelected && p.team_name !== "Free Agent" return false; 
            // Logic: Checkbox implies "Include Free Agents" or "Show ONLY"?
            // UI says: if (freeAgentSelected && p.team_name !== "Free Agent") return false; -> If checked, must be Free Agent.
            if (freeAgents) {
                const freeAgentTeam = allTeams.find(t => t.name === 'Free Agent');
                if (freeAgentTeam) {
                    // Start fresh or intersect?
                    // Typically user wouldn't select "Arsenal" AND "Free Agents" expecting overlap.
                    // If checked, scope drastically to free agent team.
                    teamIdsFromFilter = [freeAgentTeam.id];
                }
            } else {
                // If NOT checking free agents, do we EXCLUDE them? 
                // UI code didn't exclude if unchecked. It only strictly included if checked.
            }

            if (clubs.length > 0 || leagues.length > 0 || freeAgents) {
                query.teamId = { $in: teamIdsFromFilter };
            }
        }


        const totalPlayers = await Player.countDocuments(query);
        const totalPages = Math.ceil(totalPlayers / limit);

        // Fetch paginated players, sorted by totalPoints
        const players = await Player.find(query)
            .sort({ 'stats.totalPoints': -1 }) // Use DB index
            .skip(skip)
            .limit(limit)
            .lean();

        // Get unique team IDs to fetch relevant teams
        const teamIds = [...new Set(players.map(p => p.teamId))];
        const teams = await Team.find({ id: { $in: teamIds } }).populate('league').lean();
        const teamMap = new Map(teams.map(t => [t.id, t]));

        const positionMap: Record<number, string> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

        const playerStats: PlayerStats[] = players.map(player => {
            const team = teamMap.get(player.teamId);
            const teamName = team ? team.name : "Unknown";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const leagueName = team && team.league ? (team.league as any).name : "Unknown League";
            const teamShortName = team ? (team.nameCode || team.shortName) : "UNK";
            const teamColor = team && team.teamColors ? team.teamColors.primary : "#000000";
            const teamColorText = team && team.teamColors ? team.teamColors.text : "#ffffff";

            return {
                player_name: player.name || player.webName,
                team_name: teamName,
                position: positionMap[player.elementType] || "UNK",
                app: player.stats?.appearances || 0,
                goal: player.stats?.goalsScored || 0,
                assist: player.stats?.assists || 0,
                clean_sheet: player.stats?.cleanSheets || 0,
                save: player.stats?.saves || 0,
                red_card: player.stats?.redCards || 0,
                yellow_card: player.stats?.yellowCards || 0,
                penalty_miss: player.stats?.penaltiesMissed || 0,
                penalty_save: player.stats?.penaltiesSaved || 0,
                total_point: player.stats?.totalPoints || 0,
                price: player.price?.nowCost || 0,
                release_value: player.price?.nowCost || 0,
                club: teamName,
                league: leagueName,
                team_short_name: teamShortName,
                team_color: teamColor,
                team_text_color: teamColorText,
                player_id: player.id
            };
        });

        res.set('Cache-Control', 'public, max-age=60, s-maxage=60'); // Reduce cache time for dynamic lists
        res.json({
            success: true,
            data: playerStats,
            meta: {
                page,
                limit,
                totalPlayers,
                totalPages,
                hasNextPage: page < totalPages
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

export const getFilters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teams = await Team.find({}).populate('league').lean();

        const clubs = [...new Set(teams.map(t => t.name))].sort();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leagues = [...new Set(teams.map(t => (t.league as any)?.name).filter(Boolean))].sort();

        res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.json({
            success: true,
            data: {
                clubs,
                leagues
            }
        });
    } catch (error: unknown) {
        console.error("Error reading filter data:", error);
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