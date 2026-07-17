import { NextFunction, Request, Response } from "express";
import { PlayerStats, SofaScoreStats } from "../types/players";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { Gameweek } from "../models/Gameweek";
import { PlayerStats as PlayerStatsModel } from "../models/PlayerStats";
import "../models/League";
import { resolvePosition } from "../utils";

function sumNumeric(...nums: (number | undefined | null)[]): number {
    return nums.reduce<number>((acc, n) => acc + (n ?? 0), 0);
}

function avgRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

const aggregateMatchStats = (gameweeks: any[]): SofaScoreStats => {
    const res: SofaScoreStats = {
        totalPass: 0, accuratePass: 0, totalLongBalls: 0, accurateLongBalls: 0,
        accurateOwnHalfPasses: 0, totalOwnHalfPasses: 0,
        accurateOppositionHalfPasses: 0, totalOppositionHalfPasses: 0,
        totalCross: 0, aerialLost: 0, aerialWon: 0,
        duelLost: 0, duelWon: 0, challengeLost: 0, dispossessed: 0,
        totalContest: 0, wonContest: 0, unsuccessfulTouch: 0,
        onTargetScoringAttempt: 0, totalShots: 0, goals: 0, goalAssist: 0,
        shotValueNormalized: 0,
        totalClearance: 0, clearanceOffLine: 0, outfielderBlock: 0,
        ballRecovery: 0, totalTackle: 0, wonTackle: 0,
        wasFouled: 0, fouls: 0,
        minutesPlayed: 0, touches: 0, possessionLostCtrl: 0,
        rating: 0, ratingVersions: { original: 0, alternative: 0 },
        expectedGoals: 0, expectedGoalsOnTarget: 0, expectedAssists: 0,
        topSpeed: 0, kilometersCovered: 0, numberOfSprints: 0,
        metersCoveredWalkingKm: 0, metersCoveredJoggingKm: 0,
        metersCoveredRunningKm: 0, metersCoveredHighSpeedRunningKm: 0,
        metersCoveredSprintingKm: 0,
        goodHighClaim: 0, savedShotsFromInsideTheBox: 0,
        saves: 0, punches: 0, keeperSaveValue: 0,
        goalsPrevented: 0, goalkeeperValueNormalized: 0,
        defensiveValueNormalized: 0, passValueNormalized: 0,
        dribbleValueNormalized: 0,
        ballCarriesCount: 0, totalBallCarriesDistance: 0, totalProgression: 0,
        statisticsType: { sportSlug: 'football', statisticsType: 'player' },
        appearances: 0, substitute: false, yellowCards: 0, redCards: 0, goalsConceded: 0,
        cleanSheet: 0, penaltyWon: 0, penaltyCommitted: 0,
        penaltyScored: 0, penaltyMissed: 0, penaltySaved: 0, offsides: 0,
    };
    const ratings: number[] = [];
    gameweeks.forEach((gw) => {
        const s = gw.stats;
        if (!s) return;
        res.totalPass = sumNumeric(res.totalPass, s.totalPass);
        res.accuratePass = sumNumeric(res.accuratePass, s.accuratePass);
        res.totalLongBalls = sumNumeric(res.totalLongBalls, s.totalLongBalls);
        res.accurateLongBalls = sumNumeric(res.accurateLongBalls, s.accurateLongBalls);
        res.accurateOwnHalfPasses = sumNumeric(res.accurateOwnHalfPasses, s.accurateOwnHalfPasses);
        res.totalOwnHalfPasses = sumNumeric(res.totalOwnHalfPasses, s.totalOwnHalfPasses);
        res.accurateOppositionHalfPasses = sumNumeric(res.accurateOppositionHalfPasses, s.accurateOppositionHalfPasses);
        res.totalOppositionHalfPasses = sumNumeric(res.totalOppositionHalfPasses, s.totalOppositionHalfPasses);
        res.totalCross = sumNumeric(res.totalCross, s.totalCross);
        res.aerialLost = sumNumeric(res.aerialLost, s.aerialLost);
        res.aerialWon = sumNumeric(res.aerialWon, s.aerialWon);
        res.duelLost = sumNumeric(res.duelLost, s.duelLost);
        res.duelWon = sumNumeric(res.duelWon, s.duelWon);
        res.challengeLost = sumNumeric(res.challengeLost, s.challengeLost);
        res.dispossessed = sumNumeric(res.dispossessed, s.dispossessed);
        res.totalContest = sumNumeric(res.totalContest, s.totalContest);
        res.wonContest = sumNumeric(res.wonContest, s.wonContest);
        res.unsuccessfulTouch = sumNumeric(res.unsuccessfulTouch, s.unsuccessfulTouch);
        res.onTargetScoringAttempt = sumNumeric(res.onTargetScoringAttempt, s.onTargetScoringAttempt);
        res.totalShots = sumNumeric(res.totalShots, s.totalShots);
        res.goals = sumNumeric(res.goals, s.goals);
        res.goalAssist = sumNumeric(res.goalAssist, s.goalAssist);
        res.shotValueNormalized = sumNumeric(res.shotValueNormalized, s.shotValueNormalized);
        res.totalClearance = sumNumeric(res.totalClearance, s.totalClearance);
        res.clearanceOffLine = sumNumeric(res.clearanceOffLine, s.clearanceOffLine);
        res.outfielderBlock = sumNumeric(res.outfielderBlock, s.outfielderBlock);
        res.ballRecovery = sumNumeric(res.ballRecovery, s.ballRecovery);
        res.totalTackle = sumNumeric(res.totalTackle, s.totalTackle);
        res.wonTackle = sumNumeric(res.wonTackle, s.wonTackle);
        res.wasFouled = sumNumeric(res.wasFouled, s.wasFouled);
        res.fouls = sumNumeric(res.fouls, s.fouls);
        res.minutesPlayed = sumNumeric(res.minutesPlayed, s.minutesPlayed);
        if ((s.minutesPlayed ?? 0) > 0) {
            res.appearances = (res.appearances ?? 0) + 1;
        }
        res.touches = sumNumeric(res.touches, s.touches);
        res.possessionLostCtrl = sumNumeric(res.possessionLostCtrl, s.possessionLostCtrl);
        if (s.rating != null) ratings.push(s.rating);
        res.expectedGoals = sumNumeric(res.expectedGoals, s.expectedGoals);
        res.expectedGoalsOnTarget = sumNumeric(res.expectedGoalsOnTarget, s.expectedGoalsOnTarget);
        res.expectedAssists = sumNumeric(res.expectedAssists, s.expectedAssists);
        res.topSpeed = Math.max(res.topSpeed ?? 0, s.topSpeed ?? 0);
        res.kilometersCovered = sumNumeric(res.kilometersCovered, s.kilometersCovered);
        res.numberOfSprints = sumNumeric(res.numberOfSprints, s.numberOfSprints);
        res.metersCoveredWalkingKm = sumNumeric(res.metersCoveredWalkingKm, s.metersCoveredWalkingKm);
        res.metersCoveredJoggingKm = sumNumeric(res.metersCoveredJoggingKm, s.metersCoveredJoggingKm);
        res.metersCoveredRunningKm = sumNumeric(res.metersCoveredRunningKm, s.metersCoveredRunningKm);
        res.metersCoveredHighSpeedRunningKm = sumNumeric(res.metersCoveredHighSpeedRunningKm, s.metersCoveredHighSpeedRunningKm);
        res.metersCoveredSprintingKm = sumNumeric(res.metersCoveredSprintingKm, s.metersCoveredSprintingKm);
        res.goodHighClaim = sumNumeric(res.goodHighClaim, s.goodHighClaim);
        res.savedShotsFromInsideTheBox = sumNumeric(res.savedShotsFromInsideTheBox, s.savedShotsFromInsideTheBox);
        res.saves = sumNumeric(res.saves, s.saves);
        res.punches = sumNumeric(res.punches, s.punches);
        res.keeperSaveValue = sumNumeric(res.keeperSaveValue, s.keeperSaveValue);
        res.goalsPrevented = sumNumeric(res.goalsPrevented, s.goalsPrevented);
        res.goalkeeperValueNormalized = sumNumeric(res.goalkeeperValueNormalized, s.goalkeeperValueNormalized);
        res.defensiveValueNormalized = sumNumeric(res.defensiveValueNormalized, s.defensiveValueNormalized);
        res.passValueNormalized = sumNumeric(res.passValueNormalized, s.passValueNormalized);
        res.dribbleValueNormalized = sumNumeric(res.dribbleValueNormalized, s.dribbleValueNormalized);
        res.ballCarriesCount = sumNumeric(res.ballCarriesCount, s.ballCarriesCount);
        res.totalBallCarriesDistance = sumNumeric(res.totalBallCarriesDistance, s.totalBallCarriesDistance);
        res.totalProgression = sumNumeric(res.totalProgression, s.totalProgression);
        res.yellowCards = sumNumeric(res.yellowCards, s.yellowCards);
        res.redCards = sumNumeric(res.redCards, s.redCards);
        res.goalsConceded = sumNumeric(res.goalsConceded, s.goalsConceded);
        res.cleanSheet = res.cleanSheet ?? 0;
        if (s.cleanSheet === 1) res.cleanSheet = 1;
        res.penaltyWon = sumNumeric(res.penaltyWon, s.penaltyWon);
        res.penaltyCommitted = sumNumeric(res.penaltyCommitted, s.penaltyCommitted);
        res.penaltyScored = sumNumeric(res.penaltyScored, s.penaltyScored);
        res.penaltyMissed = sumNumeric(res.penaltyMissed, s.penaltyMissed);
        res.penaltySaved = sumNumeric(res.penaltySaved, s.penaltySaved);
        res.offsides = sumNumeric(res.offsides, s.offsides);
    });
    res.rating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return res;
};

export const getPlayerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { playerName } = req.params;
        const searchValue = decodeURI(playerName).toLowerCase();

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

        const team = (await Team.findOne({ id: player.teamId }).populate({ path: 'league', strictPopulate: false }).lean()) as any;
        let teamName = "Unknown";
        let teamShortName = "UNK";
        let teamColor = "#000000";
        let teamColorText = "#ffffff";
        let leagueName = "Unknown League";

        if (team) {
            teamName = team.name;
            teamShortName = team.nameCode || team.shortName || "UNK";
            teamColor = team.teamColors?.primary || "#003399";
            teamColorText = team.teamColors?.text || "#ffffff";
            leagueName = team.league ? (team.league as any).name : "Unknown League";
        }

        const positionName = resolvePosition(player.position || '');

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
        (overallStats as any).total_point = pStatsDoc?.totalPoints || 0;

        // 1. Calculate ownership percentage dynamically
        const FantasyTeam = (await import("../models/FantasyTeam")).FantasyTeam;
        const totalTeamsCount = await FantasyTeam.countDocuments();
        let ownershipPct = 0;
        if (totalTeamsCount > 0) {
            const teamPicksCount = await FantasyTeam.countDocuments({
                "currentSquad.picks.playerId": player.id
            });
            ownershipPct = Number(((teamPicksCount / totalTeamsCount) * 100).toFixed(1));
        }

        // 2. Fetch upcoming fixtures
        const Fixture = (await import("../models/Fixture")).Fixture;
        const upcomingDocs = await Fixture.find({
            $and: [
                { 'roundInfo.round': { $gte: currentGw } },
                { 'status.type': { $ne: 'finished' } },
                {
                    $or: [
                        { 'homeTeam.id': player.teamId },
                        { 'awayTeam.id': player.teamId }
                    ]
                }
            ]
        })
        .sort({ 'roundInfo.round': 1, startTimestamp: 1 })
        .limit(3)
        .lean() as any[];

        const teamsList = await Team.find({}).lean() as any[];
        const teamMap = new Map(teamsList.map(t => [t.id, t]));

        const upcomingFixtures = upcomingDocs.map((f: any) => {
            const isHome = f.homeTeam.id === player.teamId;
            const opponentId = isHome ? f.awayTeam.id : f.homeTeam.id;
            const opponentTeam = teamMap.get(opponentId);
            const myTeam = teamMap.get(player.teamId);
            return {
                gw: f.roundInfo?.round || 0,
                opponent_short_name: opponentTeam?.nameCode || opponentTeam?.shortName || "UNK",
                opponent_logo: opponentTeam?.photo || "",
                opponent_color: opponentTeam?.teamColors?.primary || "#003399",
                opponent_text_color: opponentTeam?.teamColors?.text || "#ffffff",
                my_team_short_name: myTeam?.nameCode || myTeam?.shortName || "UNK",
                my_team_logo: myTeam?.photo || "",
                is_home: isHome
            };
        });

        while (upcomingFixtures.length < 3) {
            const nextGw = currentGw + upcomingFixtures.length;
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

        // 3. Extract recent form history
        const recentForm: any[] = [];
        if (pStatsDoc && pStatsDoc.gameweeks) {
            const sortedGws = [...pStatsDoc.gameweeks].sort((a, b) => a.id - b.id);
            const filteredGws = sortedGws.filter((g: any) => g.id <= currentGw);
            const last5 = filteredGws.slice(-5);
            last5.forEach((g: any) => {
                recentForm.push({
                    gw: g.id,
                    points: g.points || 0
                });
            });
        }

        // If form is empty, fill with default placeholders up to current gameweek
        if (recentForm.length === 0) {
            for (let i = Math.max(1, currentGw - 4); i <= currentGw; i++) {
                recentForm.push({ gw: i, points: 0 });
            }
        }

        // 4. Calculate points breakdown details
        const pointsBreakdown: { label: string; value: string; points: number }[] = [];
        if (pStatsDoc && pStatsDoc.gameweeks) {
            const gwData = pStatsDoc.gameweeks.find((g: any) => g.id === currentGw);
            if (gwData && gwData.stats) {
                const s = gwData.stats;
                const position = resolvePosition(player.position || '');
                const minutes = s.minutesPlayed || 0;
                
                if (minutes > 0) {
                    pointsBreakdown.push({ label: "Minutes Played", value: `${minutes} mins`, points: 2 });
                    
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
                    }

                    const yellow = s.yellowCards || 0;
                    if (yellow > 0) {
                        pointsBreakdown.push({ label: "Yellow Cards", value: `${yellow}`, points: yellow * -1 });
                    }

                    const red = s.redCards || 0;
                    if (red > 0) {
                        pointsBreakdown.push({ label: "Red Card", value: "Yes", points: -3 });
                    }

                    const penMiss = s.penaltyMissed || 0;
                    if (penMiss > 0) {
                        pointsBreakdown.push({ label: "Penalty Missed", value: `${penMiss}`, points: penMiss * -2 });
                    }

                    if (position === 'GK') {
                        const penSave = s.penaltySaved || 0;
                        if (penSave > 0) {
                            pointsBreakdown.push({ label: "Penalty Saved", value: `${penSave}`, points: penSave * 5 });
                        }
                        const gkSaves = s.saves || 0;
                        if (gkSaves >= 3) {
                            pointsBreakdown.push({ label: `Saves (${gkSaves})`, value: `${gkSaves}`, points: Math.floor(gkSaves / 3) });
                        }
                    }

                    const tackles = s.totalTackle || 0;
                    const clearances = s.totalClearance || 0;
                    const blocks = s.outfielderBlock || 0;
                    const ballRecovery = s.ballRecovery || 0;
                    const defCont = tackles + clearances + blocks + ballRecovery;
                    if (defCont > 0) {
                        let defPoints = 0;
                        if (position === 'DEF') {
                            defPoints = Math.floor(defCont / 10) * 2;
                        } else {
                            defPoints = Math.floor(defCont / 12) * 2;
                        }
                        if (defPoints > 0) {
                            pointsBreakdown.push({ label: `Defensive Actions (${defCont})`, value: `${defCont}`, points: defPoints });
                        }
                    }
                }
            }
        }

        const data: PlayerStats = {
            player_name: player.name || player.webName || "",
            team_name: teamName,
            position: positionName,
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
            photo: player.photo || "",
            ownership: ownershipPct,
            upcoming_fixtures: upcomingFixtures,
            recent_form: recentForm,
            points_breakdown: pointsBreakdown
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
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const clubs = req.query.clubs ? (req.query.clubs as string).split(',') : [];
        const leagues = req.query.leagues ? (req.query.leagues as string).split(',') : [];
        const positions = req.query.positions ? (req.query.positions as string).split(',') : [];
        const freeAgents = req.query.freeAgents === 'true';

        const query: any = {};

        if (positions.length > 0) {
            const posMap: Record<string, string[]> = {
                'G': ['Goalkeeper', 'GK', 'GKP', 'G'],
                'D': ['Defender', 'DEF', 'D'],
                'M': ['Midfielder', 'MID', 'M'],
                'F': ['Attacker', 'FWD', 'F']
            };
            const dbPositions = positions.flatMap(p => posMap[p] || [p]).filter(Boolean);
            if (dbPositions.length > 0) {
                query.position = { $in: dbPositions };
            }
        }

        if (clubs.length > 0 || leagues.length > 0 || freeAgents) {
            const teamQuery: any = {};

            if (clubs.length > 0) {
                teamQuery.name = { $in: clubs.map(c => new RegExp(`^${c}$`, 'i')) };
            }

            let teamIdsFromFilter: number[] = [];

            const allTeams = (await Team.find({}).populate('league').lean()) as any[];

            const filteredTeams = allTeams.filter((t: any) => {
                let matches = true;
                if (clubs.length > 0 && !clubs.some(c => (t.name || t.team?.name)?.toLowerCase() === c.toLowerCase())) matches = false;
                if (leagues.length > 0 && !leagues.some(l => t.league && (t.league as any).name && (t.league as any).name.toLowerCase() === l.toLowerCase())) matches = false;
                return matches;
            });

            teamIdsFromFilter = filteredTeams.map(t => t.id).filter(Boolean);

            if (freeAgents) {
                const freeAgentTeam = allTeams.find(t => (t.name || t.team?.name) === 'Free Agent');
                if (freeAgentTeam) {
                    teamIdsFromFilter = [freeAgentTeam.id];
                }
            }

            if (clubs.length > 0 || leagues.length > 0 || freeAgents) {
                query.teamId = { $in: teamIdsFromFilter };
            }
        }

        const totalPlayers = await Player.countDocuments(query);
        const totalPages = Math.ceil(totalPlayers / limit);

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

        const teamIds = [...new Set(players.map(p => p.teamId))];
        const teams = (await Team.find({ id: { $in: teamIds } }).populate({ path: 'league', strictPopulate: false }).lean()) as any[];
        const teamMap = new Map(teams.map(t => [t.id, t]));

        const positionMap: Record<number, string> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

        const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
        const currentGw = currentGwDoc ? currentGwDoc.number : 1;

        const pStatsDocs = await PlayerStatsModel.find({ playerId: { $in: players.map(p => p.id) } }).lean();
        const pStatsMap = new Map(pStatsDocs.map(doc => [doc.playerId, doc]));

        const playerStats: PlayerStats[] = players.map(player => {
            const team = teamMap.get(player.teamId);
            const teamName = team ? team.name : "Unknown";
            const leagueName = team && team.league ? (team.league as any).name : "Unknown League";
            const teamShortName = team ? (team.nameCode || team.shortName || "UNK") : "UNK";
            const teamColor = team?.teamColors?.primary || "#003399";
            const teamColorText = team?.teamColors?.text || "#ffffff";

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
            (overallStats as any).total_point = pStatsDoc?.totalPoints || 0;

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

        res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
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

        const clubs = [...new Set(teams.map(t => t.name || t.team?.name).filter(Boolean))].sort();
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
