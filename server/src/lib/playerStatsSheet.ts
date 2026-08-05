import { PlayerStats } from '../models/PlayerStats';
import { Player } from '../models/Player';
import { Team } from '../models/Team';
import { Fixture } from '../models/Fixture';
import mongoose from 'mongoose';
import '../models/League';
import { resolvePosition } from '../utils';

export const PLAYER_STATS_SHEET_HEADERS = [
    'Player ID', 'Player Name', 'Position', 'Team ID', 'Team Name', 'League Name', 'Auction Price',
    'Fixture ID', 'Gameweek', 'Fixture Date', 'Opponent', 'Home/Away', 'Result',
    'Points', 'Total Points',
    'Minutes Played', 'Rating',
    'Goals', 'Assists', 'Clean Sheet', 'Goals Conceded', 'Saves', 'Penalty Saved',
    'Yellow Cards', 'Red Cards', 'Penalty Won', 'Penalty Committed', 'Penalty Scored', 'Penalty Missed', 'Offsides',
    'Shots', 'Shots On Target', 'Expected Goals', 'Expected Assists',
    'Passes', 'Accurate Passes', 'Pass Accuracy', 'Crosses', 'Accurate Long Balls',
    'Aerial Won', 'Aerial Lost', 'Duels Won', 'Duels Lost',
    'Tackles', 'Won Tackles', 'Challenges Won', 'Challenges Lost', 'Dispossessed',
    'Clearances', 'Blocks', 'Ball Recoveries', 'Touches', 'Unsuccessful Touches',
    'Fouls Drawn', 'Fouls Committed',
];

const passAccuracy = (stats: any): number => {
    const total = stats.totalPass || 0;
    if (total <= 0) return 0;
    return Number(((stats.accuratePass || 0) / total * 100).toFixed(1));
};

const fixtureDate = (ts?: number): string => {
    if (!ts) return '';
    return new Date(ts * 1000).toISOString().slice(0, 16).replace('T', ' ');
};

/**
 * Build long-format rows for the full player stats sheet: one row per player per
 * fixture (a player can feature in multiple matches within a gameweek), with the
 * player's identity, the fixture context (opponent, home/away, result, kickoff),
 * that match's stats (identical to what the points engine reads) and points.
 */
export const buildPlayerStatsRows = async (): Promise<any[][]> => {
    const [pStatsDocs, players, teams, leagues, fixtures] = await Promise.all([
        PlayerStats.find({}).select('playerId gameweeks totalPoints').lean(),
        Player.find({}).select('id name position teamId auctionPrice').lean(),
        Team.find({}).lean(),
        mongoose.model('League').find({}).lean() as Promise<any[]>,
        Fixture.find({}, 'fixtureId homeTeam.id awayTeam.id homeScore.current homeScore.display awayScore.current awayScore.display startTimestamp').lean(),
    ]);

    const playerMap = new Map<number, any>(players.map(p => [p.id, p]));
    const teamNameMap = new Map<number, string>();
    const teamDocMap = new Map<number, any>();
    for (const t of teams as any[]) {
        const tid = t.team?.id ?? t.id;
        if (tid == null) continue;
        teamNameMap.set(tid, t.name || t.team?.name || 'Unknown');
        teamDocMap.set(tid, t);
    }
    const teamLeagueMap = new Map<string, string>();
    for (const league of leagues) {
        if (Array.isArray(league.teams)) {
            for (const teamId of league.teams) {
                teamLeagueMap.set(teamId.toString(), league.name);
            }
        }
    }
    const fixtureMap = new Map<number, any>(fixtures.map(f => [f.fixtureId, f]));

    const rows: any[][] = [];

    for (const doc of pStatsDocs) {
        const player = playerMap.get(doc.playerId);
        const teamId = player?.teamId;
        const leagueName = teamId != null ? teamLeagueMap.get(String(teamId)) : null;
        const teamName = teamNameMap.get(teamId) || 'Unknown';

        for (const entry of doc.gameweeks || []) {
            if (!entry || !entry.stats) continue;

            const fixture = entry.fixtureId != null ? fixtureMap.get(entry.fixtureId) : null;

            let opponent = '';
            let venue = '';
            let result = '';
            if (fixture && teamId != null) {
                const isHome = fixture.homeTeam?.id === teamId;
                const oppId = isHome ? fixture.awayTeam?.id : fixture.homeTeam?.id;
                opponent = teamNameMap.get(oppId) || '';
                venue = isHome ? 'Home' : 'Away';
                const hs = fixture.homeScore?.current ?? fixture.homeScore?.display;
                const as = fixture.awayScore?.current ?? fixture.awayScore?.display;
                if (hs != null && as != null) {
                    const p = isHome ? hs : as;
                    const o = isHome ? as : hs;
                    result = p > o ? 'W' : p < o ? 'L' : 'D';
                }
            }

            const stats = entry.stats;

            rows.push([
                doc.playerId,
                player?.name ?? `Player #${doc.playerId}`,
                resolvePosition(player?.position || ''),
                teamId ?? '',
                teamName,
                leagueName || 'Unknown',
                player?.auctionPrice ?? null,
                entry.fixtureId ?? '',
                entry.id ?? '',
                fixtureDate(fixture?.startTimestamp),
                opponent,
                venue,
                result,
                entry.points || 0,
                doc.totalPoints || 0,
                stats.minutesPlayed || 0,
                Number(stats.rating || 0).toFixed(1),
                stats.goals || 0,
                stats.goalAssist || 0,
                Number(stats.cleanSheet) || 0,
                stats.goalsConceded || 0,
                stats.saves || 0,
                stats.penaltySaved || 0,
                stats.yellowCards || 0,
                stats.redCards || 0,
                stats.penaltyWon || 0,
                stats.penaltyCommitted || 0,
                stats.penaltyScored || 0,
                stats.penaltyMissed || 0,
                stats.offsides || 0,
                stats.totalShots || 0,
                stats.onTargetScoringAttempt || 0,
                stats.expectedGoals || 0,
                stats.expectedAssists || 0,
                stats.totalPass || 0,
                stats.accuratePass || 0,
                passAccuracy(stats),
                stats.totalCross || 0,
                stats.accurateLongBalls || 0,
                stats.aerialWon || 0,
                stats.aerialLost || 0,
                stats.duelWon || 0,
                stats.duelLost || 0,
                stats.totalTackle || 0,
                stats.wonTackle || 0,
                stats.wonContest || 0,
                stats.challengeLost || 0,
                stats.dispossessed || 0,
                stats.totalClearance || 0,
                stats.outfielderBlock || 0,
                stats.ballRecovery || 0,
                stats.touches || 0,
                stats.unsuccessfulTouch || 0,
                stats.wasFouled || 0,
                stats.fouls || 0,
            ]);
        }
    }

    return rows;
};
