import { NextFunction, Request, Response } from "express";
import { PlayerStats, PlayerMatchStat } from "../types/players";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { Gameweek } from "../models/Gameweek";
import { PlayerStats as PlayerStatsModel } from "../models/PlayerStats";
import "../models/League"; // Register League model for populate
import { resolvePosition } from "../utils";

const aggregateMatchStats = (gameweeks: any[]): PlayerMatchStat => {
    const res: PlayerMatchStat = {
        games: { minutes: 0, number: null, position: '', rating: null, captain: false, substitute: false, cleansheet: false, appearances: 0 },
        offsides: 0,
        shots: { total: 0, on: 0 },
        goals: { total: 0, conceded: 0, assists: 0, saves: 0 },
        passes: { total: 0, key: 0, accuracy: null },
        tackles: { total: 0, blocks: 0, interceptions: 0 },
        duels: { total: 0, won: 0 },
        dribbles: { attempts: 0, success: 0, past: 0 },
        fouls: { drawn: 0, committed: 0 },
        cards: { yellow: 0, red: 0 },
        penalty: { won: 0, commited: 0, scored: 0, missed: 0, saved: 0 },
        total_point: 0
    };
    gameweeks.forEach((gw) => {
        const stats = gw.stats;
        if (!stats) return;
        if (stats.games) {
            res.games.minutes = (res.games.minutes || 0) + (stats.games.minutes || 0);
            if (stats.games.minutes && stats.games.minutes > 0) {
                res.games.appearances = (res.games.appearances || 0) + 1;
            }
        }
        res.offsides = (res.offsides || 0) + (stats.offsides || 0);
        if (stats.shots) {
            res.shots.total = (res.shots.total || 0) + (stats.shots.total || 0);
            res.shots.on = (res.shots.on || 0) + (stats.shots.on || 0);
        }
        if (stats.goals) {
            res.goals.total = (res.goals.total || 0) + (stats.goals.total || 0);
            res.goals.conceded = (res.goals.conceded || 0) + (stats.goals.conceded || 0);
            res.goals.assists = (res.goals.assists || 0) + (stats.goals.assists || 0);
            res.goals.saves = (res.goals.saves || 0) + (stats.goals.saves || 0);
        }
        if (stats.passes) {
            res.passes.total = (res.passes.total || 0) + (stats.passes.total || 0);
            res.passes.key = (res.passes.key || 0) + (stats.passes.key || 0);
        }
        if (stats.tackles) {
            res.tackles.total = (res.tackles.total || 0) + (stats.tackles.total || 0);
            res.tackles.blocks = (res.tackles.blocks || 0) + (stats.tackles.blocks || 0);
            res.tackles.interceptions = (res.tackles.interceptions || 0) + (stats.tackles.interceptions || 0);
        }
        if (stats.duels) {
            res.duels.total = (res.duels.total || 0) + (stats.duels.total || 0);
            res.duels.won = (res.duels.won || 0) + (stats.duels.won || 0);
        }
        if (stats.dribbles) {
            res.dribbles.attempts = (res.dribbles.attempts || 0) + (stats.dribbles.attempts || 0);
            res.dribbles.success = (res.dribbles.success || 0) + (stats.dribbles.success || 0);
            res.dribbles.past = (res.dribbles.past || 0) + (stats.dribbles.past || 0);
        }
        if (stats.fouls) {
            res.fouls.drawn = (res.fouls.drawn || 0) + (stats.fouls.drawn || 0);
            res.fouls.committed = (res.fouls.committed || 0) + (stats.fouls.committed || 0);
        }
        if (stats.cards) {
            res.cards.yellow = (res.cards.yellow || 0) + (stats.cards.yellow || 0);
            res.cards.red = (res.cards.red || 0) + (stats.cards.red || 0);
        }
        if (stats.penalty) {
            res.penalty.won = (res.penalty.won || 0) + (stats.penalty.won || 0);
            res.penalty.commited = (res.penalty.commited || 0) + (stats.penalty.commited || 0);
            res.penalty.scored = (res.penalty.scored || 0) + (stats.penalty.scored || 0);
            res.penalty.missed = (res.penalty.missed || 0) + (stats.penalty.missed || 0);
            res.penalty.saved = (res.penalty.saved || 0) + (stats.penalty.saved || 0);
        }
    });
    return res;
};

export const getPlayerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { playerName } = req.params;
        const searchValue = decodeURI(playerName).toLowerCase();

        // Find player by name (case-insensitive regex)
        const player = (await Player.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${searchValue}$`, 'i') } },
                { webName: { $regex: new RegExp(`^${searchValue}$`, 'i') } },
                { slug: { $regex: new RegExp(`^${searchValue}$`, 'i') } }
            ]
        }).lean()) as any;

        if (!player) {
            return res.status(404).json({ success: false, error: "Player not found" });
        }

        // Fetch Team Details with League
        const team = (await Team.findOne({ 'team.id': player.teamId }).populate({ path: 'league', strictPopulate: false }).lean()) as any;
        let teamName = "Unknown";
        let teamShortName = "UNK";
        let teamColor = "#000000";
        let teamColorText = "#ffffff";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let leagueName = "Unknown League";

        if (team && team.team) {
            teamName = team.team.name;
            teamShortName = team.team.code || "UNK";
            // no teamColors in schema
            teamColor = "#000000";
            teamColorText = "#ffffff";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            leagueName = team.league ? (team.league as any).name : "Unknown League";
        }

        const positionName = resolvePosition(player.position || '');

        // Fetch Current Gameweek Stats
        const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
        const currentGw = currentGwDoc ? currentGwDoc.number : 1;
        const pStatsDoc = await PlayerStatsModel.findOne({ playerId: player.id }).lean();
        let currentWeekStats = undefined;
        let overallStats = aggregateMatchStats([]);
        if (pStatsDoc && pStatsDoc.gameweeks) {
            overallStats = aggregateMatchStats(pStatsDoc.gameweeks);
            const gwData = pStatsDoc.gameweeks.find((g: any) => g.id === currentGw);
            if (gwData && gwData.stats) {
                currentWeekStats = { ...gwData.stats, point: gwData.points || 0 };
            }
        }
        overallStats.total_point = pStatsDoc?.totalPoints || 0;

        const data: PlayerStats = {
            player_name: player.name || player.webName || "",
            team_name: teamName,
            position: positionName,
            overall: overallStats,
            price: player.price?.nowCost || 0,
            release_value: player.price?.nowCost || 0, // Fallback mapping
            club: teamName,
            league: leagueName,
            team_short_name: teamShortName,
            team_color: teamColor,
            team_text_color: teamColorText,
            player_id: player.id,
            current_week: currentWeekStats,
            photo: player.photo || ""
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
            const posMap: Record<string, string> = { 'G': 'Goalkeeper', 'D': 'Defender', 'M': 'Midfielder', 'F': 'Attacker' };
            const dbPositions = positions.map(p => posMap[p]).filter(Boolean);
            if (dbPositions.length > 0) {
                query.position = { $in: dbPositions };
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
            const allTeams = (await Team.find({}).populate('league').lean()) as any[];

            const filteredTeams = allTeams.filter((t: any) => {
                let matches = true;
                if (clubs.length > 0 && !clubs.some(c => t.team?.name?.toLowerCase() === c.toLowerCase())) matches = false;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (leagues.length > 0 && !leagues.some(l => t.league && (t.league as any).name && (t.league as any).name.toLowerCase() === l.toLowerCase())) matches = false;
                return matches;
            });

            teamIdsFromFilter = filteredTeams.map(t => t.team?.id).filter(Boolean);

            // Handle Free Agents: Assuming Free Agent team has a specific ID or name?
            // Usually they have valid teamId but special "Free Agent" team?
            // If freeAgents is TRUE, usually means ONLY free agents? Or exclude?
            // UI has explicit "Free Agents" toggle. Assuming it means "Show ONLY Free Agents" if checked (often checkbox filter logic)
            // But UI code: if freeAgentSelected && p.team_name !== "Free Agent" return false; 
            // Logic: Checkbox implies "Include Free Agents" or "Show ONLY"?
            // UI says: if (freeAgentSelected && p.team_name !== "Free Agent") return false; -> If checked, must be Free Agent.
            if (freeAgents) {
                const freeAgentTeam = allTeams.find(t => t.team?.name === 'Free Agent');
                if (freeAgentTeam && freeAgentTeam.team) {
                    // Start fresh or intersect?
                    // Typically user wouldn't select "Arsenal" AND "Free Agents" expecting overlap.
                    // If checked, scope drastically to free agent team.
                    teamIdsFromFilter = [freeAgentTeam.team.id];
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

        // Fetch paginated players, sorted by totalPoints from PlayerStats
        const pipeline: any[] = [
            { $match: query },
            {
                $lookup: {
                    from: "playerstats",
                    localField: "id",
                    foreignField: "playerId",
                    as: "pStats"
                }
            },
            {
                $addFields: {
                    total_point_sort: {
                        $ifNull: [{ $arrayElemAt: ["$pStats.totalPoints", 0] }, 0]
                    }
                }
            },
            {
                $sort: { total_point_sort: -1, id: 1 }
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    pStats: 0,
                    total_point_sort: 0
                }
            }
        ];
        const players = await Player.aggregate(pipeline);

        // Get unique team IDs to fetch relevant teams
        const teamIds = [...new Set(players.map(p => p.teamId))];
        const teams = (await Team.find({ 'team.id': { $in: teamIds } }).populate({ path: 'league', strictPopulate: false }).lean()) as any[];
        const teamMap = new Map(teams.map(t => [t.team?.id, t]));

        const positionMap: Record<number, string> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

        const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
        const currentGw = currentGwDoc ? currentGwDoc.number : 1;

        const pStatsDocs = await PlayerStatsModel.find({ playerId: { $in: players.map(p => p.id) } }).lean();
        const pStatsMap = new Map(pStatsDocs.map(doc => [doc.playerId, doc]));

        const playerStats: PlayerStats[] = players.map(player => {
            const team = teamMap.get(player.teamId);
            const teamName = team && team.team ? team.team.name : "Unknown";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const leagueName = team && team.league ? (team.league as any).name : "Unknown League";
            const teamShortName = team && team.team ? team.team.code : "UNK";
            const teamColor = "#000000";
            const teamColorText = "#ffffff";

            let currentWeekStats = undefined;
            let overallStats = aggregateMatchStats([]);
            const pStatsDoc = pStatsMap.get(player.id);
            if (pStatsDoc && pStatsDoc.gameweeks) {
                overallStats = aggregateMatchStats(pStatsDoc.gameweeks);
                const gwData = pStatsDoc.gameweeks.find((g: any) => g.id === currentGw);
                if (gwData && gwData.stats) {
                    currentWeekStats = { ...gwData.stats, point: gwData.points || 0 };
                }
            }
            overallStats.total_point = pStatsDoc?.totalPoints || 0;

            return {
                player_name: player.name || player.webName || "",
                team_name: teamName,
                position: resolvePosition(player.position || ""),
                overall: overallStats,
                price: player.price?.nowCost || 0,
                release_value: player.price?.nowCost || 0,
                club: teamName,
                league: leagueName,
                team_short_name: teamShortName,
                team_color: teamColor,
                team_text_color: teamColorText,
                player_id: player.id,
                current_week: currentWeekStats,
                photo: player.photo || ""
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
        const teams = (await Team.find({}).populate('league').lean()) as any[];

        const clubs = [...new Set(teams.map(t => t.team?.name).filter(Boolean))].sort();
        const leagues = [...new Set(teams.map(t => t.league?.name).filter(Boolean))].sort();

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