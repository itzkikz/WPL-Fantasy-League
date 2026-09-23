import { NextFunction, Request, Response } from "express";
import { PlayerStats, SofaScoreStats } from "../types/players";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { Gameweek } from "../models/Gameweek";
import { PlayerStats as PlayerStatsModel } from "../models/PlayerStats";
import { FantasyTeam } from "../models/FantasyTeam";
import { Fixture } from "../models/Fixture";
import "../models/League";
import { resolveEffectivePosition } from "../utils";
import { getMatchPointsBreakdown, getSeasonPointsBreakdown, PointsBreakdownItem } from "../lib/points";

function sumNumeric(...nums: (number | undefined | null)[]): number {
    return nums.reduce<number>((acc, n) => acc + (n ?? 0), 0);
}

function avgRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export const aggregateMatchStats = (gameweeks: any[]): SofaScoreStats => {
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
        ballRecovery: 0, interceptionWon: 0, totalTackle: 0, wonTackle: 0,
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
        appearances: 0, appearances60: 0, substitute: false, yellowCards: 0, redCards: 0, goalsConceded: 0,
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
        res.interceptionWon = sumNumeric(res.interceptionWon, s.interceptionWon);
        res.totalTackle = sumNumeric(res.totalTackle, s.totalTackle);
        res.wonTackle = sumNumeric(res.wonTackle, s.wonTackle);
        res.wasFouled = sumNumeric(res.wasFouled, s.wasFouled);
        res.fouls = sumNumeric(res.fouls, s.fouls);
        res.minutesPlayed = sumNumeric(res.minutesPlayed, s.minutesPlayed);
        if ((s.minutesPlayed ?? 0) > 0) {
            res.appearances = (res.appearances ?? 0) + 1;
            if ((s.minutesPlayed ?? 0) >= 60) {
                res.appearances60 = (res.appearances60 ?? 0) + 1;
            }
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
        res.cleanSheet = sumNumeric(res.cleanSheet, s.cleanSheet);
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

// A player can appear in multiple fixtures within a single gameweek.
// These helpers aggregate all per-match entries that share the same gameweek id.

export const getGameweekEntries = (gameweeks: any[], gwId: number): any[] => {
    if (!Array.isArray(gameweeks)) return [];
    return gameweeks.filter((e) => e && e.id === gwId);
};

export const getGameweekPoints = (gameweeks: any[], gwId: number): number => {
    return getGameweekEntries(gameweeks, gwId).reduce((sum, e) => sum + (e.points || 0), 0);
};

export const getGameweekMinutes = (gameweeks: any[], gwId: number): number => {
    return getGameweekEntries(gameweeks, gwId).reduce((sum, e) => sum + (e.stats?.minutesPlayed || 0), 0);
};

// Pre-compute per-player gameweek -> (points, minutes) lookups so hot scoring
// loops (standings, H2H) avoid O(gameweeks) `.filter` scans on every pick.
// Semantically identical to getGameweekPoints/getGameweekMinutes.
export const buildGameweekLookup = (gameweeks: any[]): Map<number, { points: number; minutes: number }> => {
    const lookup = new Map<number, { points: number; minutes: number }>();
    if (!Array.isArray(gameweeks)) return lookup;
    for (const e of gameweeks) {
        if (!e || typeof e.id !== 'number') continue;
        const cur = lookup.get(e.id) || { points: 0, minutes: 0 };
        cur.points += e.points || 0;
        cur.minutes += e.stats?.minutesPlayed || 0;
        lookup.set(e.id, cur);
    }
    return lookup;
};

export const getGameweekStats = (gameweeks: any[], gwId: number): SofaScoreStats => {
    return aggregateMatchStats(getGameweekEntries(gameweeks, gwId));
};

export const getGameweekForm = (gameweeks: any[], upToGw: number): { gw: number; points: number }[] => {
    if (!Array.isArray(gameweeks)) return [];
    const gwIds = [...new Set(gameweeks.filter((e) => e && e.id <= upToGw).map((e) => e.id))];
    gwIds.sort((a, b) => a - b);
    return gwIds.map((gwId) => ({ gw: gwId, points: getGameweekPoints(gameweeks, gwId) }));
};

const BREAKDOWN_ORDER = [
    'Minutes Played', 'Goals', 'Assists', 'Clean Sheet', 'Yellow Cards', 'Red Card',
    'Penalty Missed', 'Penalty Saved', 'Saves', 'Defensive Actions',
];

function breakdownLabel(key: string, count: number): string {
    if (key === 'Minutes Played') return key;
    if (key === 'Clean Sheet') return count > 1 ? `Clean Sheets (${count})` : 'Clean Sheet';
    if (key === 'Red Card') return count > 1 ? `Red Cards (${count})` : 'Red Card';
    return `${key} (${count})`;
}

function breakdownValue(key: string, count: number): string {
    if (key === 'Minutes Played') return `${count} mins`;
    if (key === 'Clean Sheet' || key === 'Red Card') return 'Yes';
    return `${count}`;
}

/**
 * Gameweek points breakdown where a player may appear in MULTIPLE matches in a
 * single gameweek. Each match's points are computed separately (per-match rules:
 * appearance from that match's minutes, per-match saves round-down, etc.) and
 * then merged component-by-component. The summed total is identical to
 * `getGameweekPoints` (which already sums the stored per-match points).
 */
export const getGameweekBreakdown = (
    gameweeks: any[],
    gwId: number,
    positionOr: string | undefined
): PointsBreakdownItem[] => {
    const entries = getGameweekEntries(gameweeks, gwId);
    const acc = new Map<string, { count: number; points: number }>();
    let totalMinutes = 0;
    for (const e of entries) {
        if (!e || !e.stats || !e.stats.minutesPlayed) continue;
        totalMinutes += e.stats.minutesPlayed;
        const pos = e.position || positionOr;
        const items = getMatchPointsBreakdown(e.stats, pos);
        for (const item of items) {
            const key = item.label.replace(/\s*\(.*\)$/, '').trim();
            const numMatch = item.label.match(/\((\d+)\)/);
            const cur = acc.get(key) || { count: 0, points: 0 };
            cur.count += numMatch ? parseInt(numMatch[1], 10) : 1;
            cur.points += item.points;
            acc.set(key, cur);
        }
    }
    const hasMinutes = acc.has('Minutes Played');
    if (hasMinutes) {
        acc.set('Minutes Played', { count: totalMinutes, points: acc.get('Minutes Played')!.points });
    }
    return [...acc.entries()]
        .sort((a, b) => {
            const ia = BREAKDOWN_ORDER.indexOf(a[0]);
            const ib = BREAKDOWN_ORDER.indexOf(b[0]);
            return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
        })
        .filter(([key, v]) => v.points !== 0 || key === 'Minutes Played')
        .map(([key, v]) => ({ label: breakdownLabel(key, v.count), value: breakdownValue(key, v.count), points: v.points }));
};

/**
 * Build the `current_week` object used across manager/standings/players views.
 * Includes merged stats for raw-count display, the total gameweek `point`
 * (summed per match) and a `matches[]` array with one entry per fixture in the
 * gameweek (per-match stats, points and breakdown) so the UI can show matches
 * separately.
 */
export const buildCurrentWeek = (
    psDoc: any,
    gwId: number,
    positionOr: string | undefined,
    playerTeamId?: number | null,
    fixtureMap?: Map<number, { home: any; away: any; kickoff?: number }>
): any => {
    const merged = getGameweekStats(psDoc.gameweeks, gwId);
    const entries = getGameweekEntries(psDoc.gameweeks, gwId);
    const matches = entries.map((e) => {
        const info = fixtureMap?.get(e.fixtureId);
        let opponent: string | null = null;
        let opponentShort: string | null = null;
        let isHome: boolean | null = null;
        if (info) {
            const homeIsPlayer = playerTeamId != null && info.home?.id === playerTeamId;
            const side = homeIsPlayer ? info.home : info.away;
            const other = homeIsPlayer ? info.away : info.home;
            opponent = other?.name || null;
            opponentShort = other?.nameCode || other?.shortName || null;
            isHome = playerTeamId != null ? homeIsPlayer : null;
            void side;
        }
        return {
            fixtureId: e.fixtureId,
            opponent,
            opponent_short_name: opponentShort,
            isHome,
            kickoff: info?.kickoff ?? null,
            points: e.points || 0,
            stats: e.stats || null,
            breakdown: e.stats ? getMatchPointsBreakdown(e.stats, e.position || positionOr) : [],
        };
    });
    return {
        ...merged,
        point: getGameweekPoints(psDoc.gameweeks, gwId),
        matches,
    };
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
        let teamLogo = "";
        let leagueName = "Unknown League";

        if (team) {
            teamName = team.name;
            teamShortName = team.nameCode || team.shortName || "UNK";
            teamColor = team.teamColors?.primary || "#003399";
            teamColorText = team.teamColors?.text || "#ffffff";
            teamLogo = team.logo || "";
            leagueName = team.league ? (team.league as any).name : "Unknown League";
        }

        const positionName = resolveEffectivePosition(player);

        const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
        const currentGw = currentGwDoc ? currentGwDoc.number : 1;
        const pStatsDoc = await PlayerStatsModel.findOne({ playerId: player.id }).lean();
        let currentWeekStats = undefined;
        let overallStats = aggregateMatchStats([]);
        if (pStatsDoc && pStatsDoc.gameweeks) {
            overallStats = aggregateMatchStats(pStatsDoc.gameweeks);
            const gwEntries = getGameweekEntries(pStatsDoc.gameweeks, currentGw);
            if (gwEntries.length > 0) {
                const Fixture = (await import("../models/Fixture")).Fixture;
                const gwDoc = (await Gameweek.findOne({ number: currentGw }).select('fixtures').lean()) as any;
                const gwFixtureIds = (gwDoc?.fixtures || []) as number[];
                const gwFixtures = gwFixtureIds.length > 0
                    ? (await Fixture.find({ fixtureId: { $in: gwFixtureIds } }).lean() as any[])
                    : [];
                const fixtureTeamIds = [...new Set(gwFixtures.flatMap((f: any) => [f.homeTeam?.id, f.awayTeam?.id]).filter(Boolean))];
                const fixtureTeams = (await Team.find({ id: { $in: fixtureTeamIds } }).lean()) as any[];
                const fixtureTeamMap = new Map(fixtureTeams.map((t: any) => [t.id, t]));
                const gwFixtureMap = new Map(gwFixtures.map((f: any) => {
                    const home = f.homeTeam?.id != null ? fixtureTeamMap.get(f.homeTeam.id) : null;
                    const away = f.awayTeam?.id != null ? fixtureTeamMap.get(f.awayTeam.id) : null;
                    return [f.fixtureId ?? f.id, { home: home || f.homeTeam, away: away || f.awayTeam, kickoff: f.startTimestamp }];
                }));
                currentWeekStats = buildCurrentWeek(pStatsDoc, currentGw, player.position, player.teamId, gwFixtureMap);
            }
        }
        (overallStats as any).total_point = pStatsDoc?.totalPoints || 0;

        // 1. Calculate ownership percentage dynamically
        const FantasyTeam = (await import("../models/FantasyTeam")).FantasyTeam;
        const totalTeamsCount = await FantasyTeam.countDocuments();
        let ownershipPct = 0;
        let fantasyTeamName: string | null = null;
        if (totalTeamsCount > 0) {
            const teamPicksCount = await FantasyTeam.countDocuments({
                "currentSquad.picks.playerId": player.id
            });
            ownershipPct = Number(((teamPicksCount / totalTeamsCount) * 100).toFixed(1));
            const ownerTeam = await FantasyTeam.findOne({
                "currentSquad.picks.playerId": player.id
            }).select("name").lean();
            if (ownerTeam) fantasyTeamName = ownerTeam.name;
        }

        // 2. Fetch upcoming fixtures
        const Fixture = (await import("../models/Fixture")).Fixture;
        // Determine upcoming rounds from the gameweek lifecycle. The fixture
        // `status` field is unreliable (stale/always "finished"), so it cannot
        // be used to decide which fixtures are upcoming.
        const upcomingGwDocs = (await Gameweek.find({ isCompleted: { $ne: true }, number: { $gte: currentGw } }).select('number fixtures').lean()) as any[];
        const upcomingRounds = upcomingGwDocs.map((g) => g.number);
        const fixtureGwMap = new Map<number, number>();
        for (const g of upcomingGwDocs) {
            for (const fid of (g.fixtures || [])) fixtureGwMap.set(Number(fid?.fixtureId ?? fid?.id ?? fid), g.number);
        }
        const upcomingDocs = await Fixture.find({
            'roundInfo.round': { $in: upcomingRounds },
            $or: [
                { 'homeTeam.id': player.teamId },
                { 'awayTeam.id': player.teamId }
            ]
        })
        .sort({ startTimestamp: 1 })
        .limit(3)
        .lean() as any[];

        const teamsList = await Team.find({}).lean() as any[];
        const teamMap = new Map(teamsList.map(t => [t.id, t]));

        const upcomingFixtures = upcomingDocs.map((f: any, idx) => {
            const isHome = f.homeTeam.id === player.teamId;
            const opponentId = isHome ? f.awayTeam.id : f.homeTeam.id;
            const opponentTeam = teamMap.get(opponentId);
            const myTeam = teamMap.get(player.teamId);
            return {
                // Label by the app gameweek the fixture is assigned to when one
                // exists; otherwise by chronological position (next match =
                // current gameweek). Round numbers are not chronological for
                // rescheduled leagues, so they are not used as a label.
                gw: fixtureGwMap.get(Number(f.fixtureId ?? f.id)) || (currentGw + idx) || 0,
                fixture_id: f.fixtureId ?? f.id,
                kickoff: f.startTimestamp || 0,
                opponent_short_name: opponentTeam?.nameCode || opponentTeam?.shortName || "UNK",
                opponent_logo: opponentTeam?.logo || opponentTeam?.photo || "",
                opponent_color: opponentTeam?.teamColors?.primary || "#003399",
                opponent_text_color: opponentTeam?.teamColors?.text || "#ffffff",
                my_team_short_name: myTeam?.nameCode || myTeam?.shortName || "UNK",
                my_team_logo: myTeam?.logo || myTeam?.photo || "",
                is_home: isHome
            };
        });

        while (upcomingFixtures.length < 3) {
            const nextGw = currentGw + upcomingFixtures.length;
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

        // 3. Extract recent form history
        let recentForm: any[] = [];
        if (pStatsDoc && pStatsDoc.gameweeks) {
            recentForm = getGameweekForm(pStatsDoc.gameweeks, currentGw).slice(-5);
        }

        // If form is empty, fill with default placeholders up to current gameweek
        if (recentForm.length === 0) {
            for (let i = Math.max(1, currentGw - 4); i <= currentGw; i++) {
                recentForm.push({ gw: i, points: 0 });
            }
        }

        // 4. Calculate points breakdown details (per-match, summed across a multi-match gameweek)
        const pointsBreakdown = (pStatsDoc && pStatsDoc.gameweeks)
            ? getGameweekBreakdown(pStatsDoc.gameweeks, currentGw, player.position)
            : [];

        // Season points breakdown (per-match flooring applied and summed across all gameweeks)
        const seasonPointsBreakdown = (pStatsDoc && pStatsDoc.gameweeks)
            ? getSeasonPointsBreakdown(pStatsDoc.gameweeks, player.position)
            : [];

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
            team_logo: teamLogo,
            player_id: player.id,
            current_week: currentWeekStats,
            photo: player.photo || "",
            ownership: ownershipPct,
            fantasy_team_name: fantasyTeamName,
            upcoming_fixtures: upcomingFixtures,
            recent_form: recentForm,
            points_breakdown: pointsBreakdown,
            season_points_breakdown: seasonPointsBreakdown,
            auctionPrice: player.auctionPrice
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

// --- Caching helpers for player listings ---
let cachedTeamsMap: Map<number, any> | null = null;
let lastTeamsMapTime = 0;
let teamsMapPromise: Promise<Map<number, any>> | null = null;
const TEAMS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const getAllTeamsMap = async (): Promise<Map<number, any>> => {
    const now = Date.now();
    if (cachedTeamsMap && (now - lastTeamsMapTime < TEAMS_CACHE_TTL)) {
        return cachedTeamsMap;
    }
    if (teamsMapPromise) return teamsMapPromise;
    teamsMapPromise = (async () => {
        try {
            const teams = await Team.find({}).populate({ path: 'league', strictPopulate: false }).lean() as any[];
            const map = new Map<number, any>(teams.map(t => [t.id, t]));
            cachedTeamsMap = map;
            lastTeamsMapTime = Date.now();
            return map;
        } finally {
            teamsMapPromise = null;
        }
    })();
    return teamsMapPromise;
};

let cachedTotalPointsMap: Map<number, number> | null = null;
let lastTotalPointsTime = 0;
let totalPointsPromise: Promise<Map<number, number>> | null = null;
const TOTAL_POINTS_TTL = 15 * 60 * 1000; // 15 minutes

export const getTotalPointsMap = async (): Promise<Map<number, number>> => {
    const now = Date.now();
    if (cachedTotalPointsMap && (now - lastTotalPointsTime < TOTAL_POINTS_TTL)) {
        return cachedTotalPointsMap;
    }
    if (totalPointsPromise) return totalPointsPromise;
    totalPointsPromise = (async () => {
        try {
            const totalPointsDocs = await PlayerStatsModel.find({}, { playerId: 1, totalPoints: 1 }).lean();
            const map = new Map<number, number>(totalPointsDocs.map(d => [d.playerId, d.totalPoints || 0]));
            cachedTotalPointsMap = map;
            lastTotalPointsTime = Date.now();
            return map;
        } finally {
            totalPointsPromise = null;
        }
    })();
    return totalPointsPromise;
};

export interface PlayerSummary {
    id: number;
    teamId: number;
    position?: string;
    tm_position?: string;
}

let cachedPlayersSummary: PlayerSummary[] | null = null;
let lastPlayersSummaryTime = 0;
let playersSummaryPromise: Promise<PlayerSummary[]> | null = null;
const PLAYERS_SUMMARY_TTL = 15 * 60 * 1000; // 15 minutes

export const getAllPlayersSummary = async (): Promise<PlayerSummary[]> => {
    const now = Date.now();
    if (cachedPlayersSummary && (now - lastPlayersSummaryTime < PLAYERS_SUMMARY_TTL)) {
        return cachedPlayersSummary;
    }
    if (playersSummaryPromise) return playersSummaryPromise;
    playersSummaryPromise = (async () => {
        try {
            const docs = await Player.find({}, 'id teamId position tm_position').lean() as any[];
            const summary: PlayerSummary[] = docs.map(d => ({
                id: d.id,
                teamId: d.teamId,
                position: d.position,
                tm_position: d.tm_position
            }));
            cachedPlayersSummary = summary;
            lastPlayersSummaryTime = Date.now();
            return summary;
        } finally {
            playersSummaryPromise = null;
        }
    })();
    return playersSummaryPromise;
};

export interface OwnershipContext {
    allFantasyTeams: any[];
    teamNameByPlayer: Map<number, string[]>;
    ownedSet: Set<number>;
    totalTeamsCount: number;
}

let cachedOwnershipContext: OwnershipContext | null = null;
let lastOwnershipTime = 0;
let ownershipPromise: Promise<OwnershipContext> | null = null;
const OWNERSHIP_TTL = 15 * 60 * 1000; // 15 minutes

export const getOwnershipContext = async (): Promise<OwnershipContext> => {
    const now = Date.now();
    if (cachedOwnershipContext && (now - lastOwnershipTime < OWNERSHIP_TTL)) {
        return cachedOwnershipContext;
    }
    if (ownershipPromise) return ownershipPromise;
    ownershipPromise = (async () => {
        try {
            const allFantasyTeams = await FantasyTeam.find({}).select('name currentSquad.picks.playerId').lean();
            const teamNameByPlayer = new Map<number, string[]>();
            const ownedSet = new Set<number>();
            for (const ft of allFantasyTeams) {
                for (const pick of ft.currentSquad?.picks || []) {
                    if (!teamNameByPlayer.has(pick.playerId)) teamNameByPlayer.set(pick.playerId, []);
                    teamNameByPlayer.get(pick.playerId)!.push(ft.name);
                    ownedSet.add(pick.playerId);
                }
            }
            const context: OwnershipContext = {
                allFantasyTeams,
                teamNameByPlayer,
                ownedSet,
                totalTeamsCount: allFantasyTeams.length
            };
            cachedOwnershipContext = context;
            lastOwnershipTime = Date.now();
            return context;
        } finally {
            ownershipPromise = null;
        }
    })();
    return ownershipPromise;
};

export interface GwContext {
    gw: number;
    currentGwFixtureMap: Map<number, any>;
    upcomingRounds: number[];
    fixtureGwMap: Map<number, number>;
}

let cachedCurrentGwContext: GwContext | null = null;
let lastCurrentGwContextTime = 0;
let gwContextPromise: Promise<GwContext> | null = null;
const GW_CONTEXT_TTL = 15 * 60 * 1000; // 15 minutes

export const getCurrentGwContext = async (): Promise<GwContext> => {
    const now = Date.now();
    if (cachedCurrentGwContext && (now - lastCurrentGwContextTime < GW_CONTEXT_TTL)) {
        return cachedCurrentGwContext;
    }
    if (gwContextPromise) return gwContextPromise;
    gwContextPromise = (async () => {
        try {
            const [allTeamsMap, gwDocs, currentGwDoc] = await Promise.all([
                getAllTeamsMap(),
                Gameweek.find({
                    isCompleted: { $ne: true }
                }).select('number fixtures isCurrent').sort({ number: 1 }).lean().exec() as Promise<any[]>,
                Gameweek.findOne({ isCurrent: true }).select('number fixtures').lean().exec() as Promise<any>
            ]);

            const currentGw = currentGwDoc ? currentGwDoc.number : 1;
            const upcomingGwDocs = gwDocs.filter((g: any) => g.number >= currentGw && g.number <= currentGw + 3);
            const upcomingRounds = upcomingGwDocs.map((g: any) => g.number);
            const fixtureGwMap = new Map<number, number>();
            for (const g of upcomingGwDocs) {
                for (const fid of (g.fixtures || [])) {
                    fixtureGwMap.set(Number(fid?.fixtureId ?? fid?.id ?? fid), g.number);
                }
            }

            const tgwFixtureIds = (currentGwDoc?.fixtures || []) as number[];
            const currentGwDocs = tgwFixtureIds.length > 0
                ? (await Fixture.find(
                    { fixtureId: { $in: tgwFixtureIds } },
                    'fixtureId id startTimestamp homeTeam.id awayTeam.id'
                  ).sort({ startTimestamp: 1 }).lean().exec() as any[])
                : [];

            const currentGwFixtureMap = new Map<number, any>(currentGwDocs.map((f: any) => {
                const home = f.homeTeam?.id != null ? allTeamsMap.get(f.homeTeam.id) : null;
                const away = f.awayTeam?.id != null ? allTeamsMap.get(f.awayTeam.id) : null;
                return [f.fixtureId ?? f.id, { home: home || f.homeTeam, away: away || f.awayTeam, kickoff: f.startTimestamp }];
            }));

            const result: GwContext = {
                gw: currentGw,
                currentGwFixtureMap,
                upcomingRounds,
                fixtureGwMap
            };
            cachedCurrentGwContext = result;
            lastCurrentGwContextTime = Date.now();
            return result;
        } finally {
            gwContextPromise = null;
        }
    })();
    return gwContextPromise;
};

// Per-player stats document cache (stores gameweeks arrays so repeated loads don't re-download 240KB of nested BSON)
const playerStatsDocCache = new Map<number, { doc: any; timestamp: number }>();
const PSTATS_DOC_TTL = 30 * 60 * 1000; // 30 minutes

export const warmPlayersCache = () => {
    (async () => {
        try {
            const [teamMap, gwContext, ownership, totalPointsMap, allPlayersSummary] = await Promise.all([
                getAllTeamsMap(),
                getCurrentGwContext(),
                getOwnershipContext(),
                getTotalPointsMap(),
                getAllPlayersSummary()
            ]);

            // Pre-warm top 50 players stats in background
            const sorted = allPlayersSummary.slice().sort((a, b) =>
                (totalPointsMap.get(b.id) || 0) - (totalPointsMap.get(a.id) || 0) || a.id - b.id
            );
            const top50Ids = sorted.slice(0, 50).map(p => p.id);
            const topStatsDocs = await PlayerStatsModel.find({ playerId: { $in: top50Ids } }).lean().exec();
            const now = Date.now();
            for (const doc of topStatsDocs) {
                playerStatsDocCache.set(doc.playerId, { doc, timestamp: now });
            }
        } catch (err: any) {
            console.warn('Background warming of players cache failed:', err?.message || err);
        }
    })();
};

export const invalidatePlayerStatsCache = () => {
    cachedTeamsMap = null;
    lastTeamsMapTime = 0;
    teamsMapPromise = null;
    cachedTotalPointsMap = null;
    lastTotalPointsTime = 0;
    totalPointsPromise = null;
    cachedPlayersSummary = null;
    lastPlayersSummaryTime = 0;
    playersSummaryPromise = null;
    cachedOwnershipContext = null;
    lastOwnershipTime = 0;
    ownershipPromise = null;
    cachedCurrentGwContext = null;
    lastCurrentGwContextTime = 0;
    gwContextPromise = null;
    playerStatsDocCache.clear();
};

export const getFullPlayerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const clubs = req.query.clubs ? (req.query.clubs as string).split(',') : [];
        const leagues = req.query.leagues ? (req.query.leagues as string).split(',') : [];
        const positions = req.query.positions ? (req.query.positions as string).split(',') : [];
        const freeAgents = req.query.freeAgents === 'true';

        // 1. Fetch all data caches concurrently via Promise.all
        // Warm: ~0ms (in-memory instant return)
        // Cold: all 5 execute concurrently in ~1.5s instead of 8s
        const [teamMap, gwContext, ownership, totalPointsMap, allPlayersSummary] = await Promise.all([
            getAllTeamsMap(),
            getCurrentGwContext(),
            getOwnershipContext(),
            getTotalPointsMap(),
            getAllPlayersSummary()
        ]);
        const { gw: currentGw, currentGwFixtureMap, upcomingRounds, fixtureGwMap } = gwContext;

        // 2. High-speed in-memory filtering across 3,236 summary candidates (< 1ms)
        let candidates = allPlayersSummary;

        if (positions.length > 0) {
            const posMap: Record<string, string[]> = {
                'G': ['Goalkeeper', 'GK', 'GKP', 'G'],
                'D': ['Defender', 'DEF', 'D'],
                'M': ['Midfielder', 'MID', 'M'],
                'F': ['Attacker', 'FWD', 'F']
            };
            const dbPositions = new Set(positions.flatMap(p => posMap[p] || [p]).filter(Boolean));
            candidates = candidates.filter(p => p.position && dbPositions.has(p.position));
        }

        if (clubs.length > 0 || leagues.length > 0) {
            const allTeams = Array.from(teamMap.values());
            const filteredTeamIds = new Set(allTeams.filter((t: any) => {
                let matches = true;
                if (clubs.length > 0 && !clubs.some(c => (t.name || t.team?.name)?.toLowerCase() === c.toLowerCase())) matches = false;
                if (leagues.length > 0 && !leagues.some(l => t.league && (t.league as any).name && (t.league as any).name.toLowerCase() === l.toLowerCase())) matches = false;
                return matches;
            }).map(t => t.id).filter(Boolean));

            candidates = candidates.filter(p => filteredTeamIds.has(p.teamId));
        }

        if (freeAgents) {
            candidates = candidates.filter(p => !ownership.ownedSet.has(p.id));
        }

        // 3. High-speed in-memory sort by totalPoints desc, then id asc (< 1ms)
        candidates = candidates.slice().sort((a, b) =>
            (totalPointsMap.get(b.id) || 0) - (totalPointsMap.get(a.id) || 0) || a.id - b.id
        );

        const totalPlayers = candidates.length;
        const totalPages = Math.ceil(totalPlayers / limit);
        const pageCandidates = candidates.slice(skip, skip + limit);
        const pageIds = pageCandidates.map(p => p.id);

        if (pageIds.length === 0) {
            res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
            return res.json({
                success: true,
                data: [],
                meta: {
                    page,
                    limit,
                    totalPlayers,
                    totalPages,
                    hasNextPage: false
                }
            });
        }

        // 4. Parallel fetch: 20 Players (projected) + missing PlayerStats + Upcoming Fixtures (projected next 4 rounds)
        const playerTeamIds = [...new Set(pageCandidates.map(p => p.teamId).filter(Boolean))];

        const reqTime = Date.now();
        const missingStatsPlayerIds: number[] = [];
        const pStatsDocs: any[] = [];

        for (const pid of pageIds) {
            const cached = playerStatsDocCache.get(pid);
            if (cached && (reqTime - cached.timestamp < PSTATS_DOC_TTL)) {
                pStatsDocs.push(cached.doc);
            } else {
                missingStatsPlayerIds.push(pid);
            }
        }

        const [playersRaw, freshStatsDocs, upcomingDocs] = await Promise.all([
            Player.find(
                { id: { $in: pageIds } },
                'id name webName photo teamId position positionsDetailed tm_position price.nowCost auctionPrice'
            ).lean().exec() as Promise<any[]>,
            missingStatsPlayerIds.length > 0
                ? (PlayerStatsModel.find({ playerId: { $in: missingStatsPlayerIds } }).lean().exec() as Promise<any[]>)
                : Promise.resolve([] as any[]),
            upcomingRounds.length > 0 && playerTeamIds.length > 0
                ? (Fixture.find(
                    {
                        'roundInfo.round': { $in: upcomingRounds },
                        $or: [
                            { 'homeTeam.id': { $in: playerTeamIds } },
                            { 'awayTeam.id': { $in: playerTeamIds } }
                        ]
                    },
                    'fixtureId id startTimestamp homeTeam.id awayTeam.id roundInfo.round'
                  ).sort({ startTimestamp: 1 }).lean().exec() as Promise<any[]>)
                : Promise.resolve([] as any[])
        ]);

        for (const doc of freshStatsDocs) {
            playerStatsDocCache.set(doc.playerId, { doc, timestamp: reqTime });
            pStatsDocs.push(doc);
        }

        const playersById = new Map(playersRaw.map(p => [p.id, p]));
        const players = pageIds.map(id => playersById.get(id)).filter(Boolean);
        const pStatsMap = new Map(pStatsDocs.map(doc => [doc.playerId, doc]));

        // 5. Map upcoming fixtures by team
        const fixturesByTeam = new Map<number, any[]>();
        for (const f of upcomingDocs) {
            const homeId = f.homeTeam?.id;
            const awayId = f.awayTeam?.id;
            if (homeId && !fixturesByTeam.has(homeId)) fixturesByTeam.set(homeId, []);
            if (awayId && !fixturesByTeam.has(awayId)) fixturesByTeam.set(awayId, []);
            if (homeId) fixturesByTeam.get(homeId)!.push({ fixture: f, isHome: true, opponentId: awayId });
            if (awayId) fixturesByTeam.get(awayId)!.push({ fixture: f, isHome: false, opponentId: homeId });
        }

        // 6. Ownership counts
        const ownershipMap = new Map<number, { pct: number; teamName: string | null }>();
        for (const pid of pageIds) {
            const owners = ownership.teamNameByPlayer.get(pid) || [];
            const pct = ownership.totalTeamsCount > 0 ? Number(((owners.length / ownership.totalTeamsCount) * 100).toFixed(1)) : 0;
            ownershipMap.set(pid, { pct, teamName: owners[0] || null });
        }

        // 8. Transform to PlayerStats[]
        const playerStats: PlayerStats[] = players.map(player => {
            const team = teamMap.get(player.teamId);
            const teamName = team ? team.name : "Unknown";
            const leagueName = team && team.league ? (team.league as any).name : "Unknown League";
            const teamShortName = team ? (team.nameCode || team.shortName || "UNK") : "UNK";
            const teamColor = team?.teamColors?.primary || "#003399";
            const teamColorText = team?.teamColors?.text || "#ffffff";
            const teamLogo = team?.logo || "";

            let currentWeekStats = undefined;
            let overallStats = aggregateMatchStats([]);
            const pStatsDoc = pStatsMap.get(player.id);
            if (pStatsDoc && pStatsDoc.gameweeks) {
                overallStats = aggregateMatchStats(pStatsDoc.gameweeks);
                const gwEntries = getGameweekEntries(pStatsDoc.gameweeks, currentGw);
                if (gwEntries.length > 0) {
                    currentWeekStats = buildCurrentWeek(pStatsDoc, currentGw, player.position, player.teamId, currentGwFixtureMap);
                }
            }
            (overallStats as any).total_point = pStatsDoc?.totalPoints || 0;

            // Recent form (last 5 gameweeks)
            const recentForm: any[] = (pStatsDoc && (pStatsDoc as any).gameweeks)
                ? getGameweekForm((pStatsDoc as any).gameweeks, currentGw).slice(-5)
                : [];
            if (recentForm.length === 0) {
                for (let i = Math.max(1, currentGw - 4); i <= currentGw; i++) {
                    recentForm.push({ gw: i, points: 0 });
                }
            }

            // Upcoming fixtures
            const teamFixtures = fixturesByTeam.get(player.teamId) || [];
            const upcomingFixtures = teamFixtures.slice(0, 3).map(({ fixture: f, isHome, opponentId }, idx) => {
                const opponentTeam = teamMap.get(opponentId);
                return {
                    gw: fixtureGwMap.get(Number(f.fixtureId ?? f.id)) || (currentGw + idx) || 0,
                    fixture_id: f.fixtureId ?? f.id,
                    kickoff: f.startTimestamp || 0,
                    opponent_short_name: opponentTeam?.nameCode || "UNK",
                    opponent_logo: opponentTeam?.logo || "",
                    opponent_color: opponentTeam?.teamColors?.primary || "#003399",
                    opponent_text_color: opponentTeam?.teamColors?.text || "#ffffff",
                    my_team_short_name: team?.nameCode || "UNK",
                    my_team_logo: team?.logo || "",
                    is_home: isHome
                };
            });
            while (upcomingFixtures.length < 3) {
                const nextGw = currentGw + upcomingFixtures.length;
                upcomingFixtures.push({ gw: nextGw, fixture_id: 0, kickoff: 0, opponent_short_name: "TBD", opponent_logo: "", opponent_color: "#1b1035", opponent_text_color: "#ffffff", my_team_short_name: teamShortName, my_team_logo: "", is_home: true });
            }

            // Points breakdown
            const ownership = ownershipMap.get(player.id) || { pct: 0, teamName: null };
            const pointsBreakdown = (pStatsDoc && (pStatsDoc as any).gameweeks)
                ? getGameweekBreakdown((pStatsDoc as any).gameweeks, currentGw, player.position)
                : [];

            // Season points breakdown (per-match flooring applied and summed across all gameweeks)
            const seasonPointsBreakdown = (pStatsDoc && (pStatsDoc as any).gameweeks)
                ? getSeasonPointsBreakdown((pStatsDoc as any).gameweeks, resolveEffectivePosition(player))
                : [];

            return {
                player_name: player.name || player.webName || "",
                team_name: teamName,
                position: resolveEffectivePosition(player),
                overall: overallStats,
                price: player.price?.nowCost || 0,
                release_value: player.price?.nowCost || 0,
                club: teamName,
                league: leagueName,
                team_short_name: teamShortName,
                team_color: teamColor,
                team_text_color: teamColorText,
                team_logo: teamLogo,
                player_id: player.id,
                current_week: currentWeekStats,
                photo: player.photo || "",
                ownership: ownership.pct,
                fantasy_team_name: ownership.teamName || "Free Agent",
                upcoming_fixtures: upcomingFixtures,
                recent_form: recentForm,
                points_breakdown: pointsBreakdown,
                season_points_breakdown: seasonPointsBreakdown,
                auctionPrice: player.auctionPrice
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
};

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
