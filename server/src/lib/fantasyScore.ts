import { PlayerStats } from '../models/PlayerStats';
import { Player } from '../models/Player';
import { FantasyTeam } from '../models/FantasyTeam';
import { Gameweek } from '../models/Gameweek';
import { getGameweekPoints, getGameweekMinutes, getGameweekStats } from '../controllers/players';
import { resolvePosition } from '../utils';

export const getPlayerStatsMap = async (): Promise<Map<number, any>> => {
    const playerStats = await PlayerStats.find({})
        .select('playerId gameweeks.id gameweeks.points gameweeks.stats gameweeks.fixtureId')
        .lean();
    const map = new Map<number, any>();
    playerStats.forEach((ps: any) => map.set(ps.playerId, ps));
    return map;
};

/**
 * Score a fantasy team's picks for a single gameweek. Identical to the logic
 * used by `getStandingsData` (captain doubles if he played, otherwise the
 * vice-captain doubles; only starting picks score).
 */
export const computeTeamGwScore = (picks: any[], gwId: number, playerStatsMap: Map<number, any>): number => {
    let score = 0;
    let captainPlayed = false;

    const captainPick = picks.find(p => p.isCaptain);
    if (captainPick) {
        const cStats = playerStatsMap.get(captainPick.playerId);
        if (cStats && cStats.gameweeks) {
            if (getGameweekMinutes(cStats.gameweeks, gwId) > 0) {
                captainPlayed = true;
            }
        }
    }

    picks.forEach(pick => {
        if (!pick.isStarting) return;

        const statsDoc = playerStatsMap.get(pick.playerId);
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

export interface FantasyTeamGamewiseRow {
    fantasyTeamId: string;
    teamName: string;
    managers: string;
    gameweek: number;
    playerId: number;
    playerName: string;
    position: string;
    lineup: string;
    role: string;
    minutesPlayed: number;
    goals: number;
    goalAssist: number;
    cleanSheet: number;
    yellowCards: number;
    redCards: number;
    penaltyMissed: number;
    penaltySaved: number;
    saves: number;
    totalTackle: number;
    totalClearance: number;
    outfielderBlock: number;
    ballRecovery: number;
    points: number;
}

export const FANTASY_GAMEWISE_HEADERS = [
    'FantasyTeamId', 'Team Name', 'Managers', 'Gameweek', 'Player ID', 'Player Name', 'Position',
    'Lineup', 'Role', 'Minutes', 'Goals', 'Assists', 'Clean Sheet', 'Yellow Cards', 'Red Cards',
    'Penalty Missed', 'Penalty Saved', 'Saves', 'Tackles', 'Clearances', 'Blocks', 'Ball Recoveries',
    'Points',
];

const roleLabel = (pick: any): string => {
    if (pick.isCaptain) return 'CAPTAIN';
    if (pick.isViceCaptain) return 'VICE CAPTAIN';
    return '';
};

const lineupLabel = (pick: any): string => {
    if (pick.isStarting) return 'Starting';
    return `Sub ${pick.subNumber || 0}`;
};

/**
 * Build the long-format rows: one row per pick per gameweek per fantasy team,
 * with the stats that drive the points calculation plus the effective points.
 */
export const buildFantasyTeamGamewiseRows = async (): Promise<FantasyTeamGamewiseRow[]> => {
    const [gameweeks, teams, playerStatsMap, players] = await Promise.all([
        Gameweek.find({}, 'number').sort({ number: 1 }).lean(),
        FantasyTeam.find({}, 'name history currentSquad managerDisplayNames').lean(),
        getPlayerStatsMap(),
        Player.find({}, 'id name position').lean(),
    ]);

    const gwNumbers = gameweeks.map(gw => gw.number);
    const currentGw = await Gameweek.findOne({ isCurrent: true }).select('number').lean();
    const currentGwNumber = currentGw?.number ?? null;

    const playerMap = new Map<number, any>(players.map(p => [p.id, p]));

    const rows: FantasyTeamGamewiseRow[] = [];

    for (const team of teams) {
        const teamId = String(team._id);
        const teamName = team.name || 'Unknown';
        const managers = team.managerDisplayNames || '';

        for (const gwNumber of gwNumbers) {
            const historyEntry = (team.history || []).find((h: any) => h.gameweek === gwNumber);
            let picks: any[] | null = historyEntry?.picks || null;

            if (!picks && gwNumber === currentGwNumber && team.currentSquad?.picks?.length > 0) {
                picks = team.currentSquad.picks;
            }
            if (!picks) continue;

            let captainPlayed = false;
            const captainPick = picks.find(p => p.isCaptain);
            if (captainPick) {
                const cStats = playerStatsMap.get(captainPick.playerId);
                if (cStats?.gameweeks && getGameweekMinutes(cStats.gameweeks, gwNumber) > 0) {
                    captainPlayed = true;
                }
            }

            for (const pick of picks) {
                const statsDoc = playerStatsMap.get(pick.playerId);
                const basePoints = statsDoc?.gameweeks ? getGameweekPoints(statsDoc.gameweeks, gwNumber) : 0;
                const stats = statsDoc?.gameweeks ? getGameweekStats(statsDoc.gameweeks, gwNumber) : ({} as any);
                const playerDoc = playerMap.get(pick.playerId);

                rows.push({
                    fantasyTeamId: teamId,
                    teamName,
                    managers,
                    gameweek: gwNumber,
                    playerId: pick.playerId,
                    playerName: playerDoc?.name ?? `Player #${pick.playerId}`,
                    position: resolvePosition(playerDoc?.position || ''),
                    lineup: lineupLabel(pick),
                    role: roleLabel(pick),
                    minutesPlayed: stats.minutesPlayed || 0,
                    goals: stats.goals || 0,
                    goalAssist: stats.goalAssist || 0,
                    cleanSheet: Number(stats.cleanSheet) || 0,
                    yellowCards: stats.yellowCards || 0,
                    redCards: stats.redCards || 0,
                    penaltyMissed: stats.penaltyMissed || 0,
                    penaltySaved: stats.penaltySaved || 0,
                    saves: stats.saves || 0,
                    totalTackle: stats.totalTackle || 0,
                    totalClearance: stats.totalClearance || 0,
                    outfielderBlock: stats.outfielderBlock || 0,
                    ballRecovery: stats.ballRecovery || 0,
                    points: pick.isCaptain && captainPlayed
                        ? basePoints * 2
                        : pick.isViceCaptain && !captainPlayed
                        ? basePoints * 2
                        : basePoints,
                });
            }
        }
    }

    return rows;
};

export const fantasyGamewiseRowsToValues = (rows: FantasyTeamGamewiseRow[]): any[][] => {
    return rows.map(row => [
        row.fantasyTeamId,
        row.teamName,
        row.managers,
        row.gameweek,
        row.playerId,
        row.playerName,
        row.position,
        row.lineup,
        row.role,
        row.minutesPlayed,
        row.goals,
        row.goalAssist,
        row.cleanSheet,
        row.yellowCards,
        row.redCards,
        row.penaltyMissed,
        row.penaltySaved,
        row.saves,
        row.totalTackle,
        row.totalClearance,
        row.outfielderBlock,
        row.ballRecovery,
        row.points,
    ]);
};
