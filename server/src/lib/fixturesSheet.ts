import mongoose from 'mongoose';
import { Fixture } from '../models/Fixture';
import { Gameweek } from '../models/Gameweek';
import { Team } from '../models/Team';
import '../models/League';

export const FIXTURES_SHEET_HEADERS = [
    'Gameweek', 'League', 'Round', 'Kickoff (UTC)',
    'Home Team', 'Home Code', 'Away Team', 'Away Code',
    'Status', 'Home Score', 'Away Score', 'Fixture ID',
];

const kickoffString = (ts?: number): string => {
    if (!ts) return '';
    return new Date(ts * 1000).toISOString().slice(0, 16).replace('T', ' ');
};

/**
 * Build rows for the "Fixtures" sheet: one row per fixture across ALL gameweeks.
 * Fixtures are matched by explicit gameweek assignment (fixtureId) and, as a
 * fallback for gameweeks without explicit assignments, by `roundInfo.round` —
 * so rescheduled or double-gameweek fixtures are never dropped. Each row carries
 * the gameweek label (assigned gameweek, else league round), league, kickoff,
 * both teams and the live status/score.
 */
export const buildCurrentFixturesRows = async (): Promise<any[][]> => {
    // Fetch ALL gameweeks (not just current + next 2) to export the full season
    const allGwDocs = (await Gameweek.find({}).select('number fixtures isCompleted').sort({ number: 1 }).lean()) as any[];

    // Build a map of fixtureId -> gameweek number for explicitly assigned fixtures
    const fixtureGwMap = new Map<number, number>();
    const explicitlyAssignedFixtureIds = new Set<number>();
    const gameweeksWithoutAssignments = new Set<number>();

    for (const g of allGwDocs) {
        const gwNumber = g.number;
        const fixtureIds = (g.fixtures || []).map((f: any) => Number(f?.fixtureId ?? f?.id ?? f)).filter(Boolean);

        if (fixtureIds.length > 0) {
            for (const fid of fixtureIds) {
                fixtureGwMap.set(fid, gwNumber);
                explicitlyAssignedFixtureIds.add(fid);
            }
        } else {
            // This gameweek has no explicit assignments; we'll use its round number as fallback
            gameweeksWithoutAssignments.add(gwNumber);
        }
    }

    // Query fixtures using BOTH explicit assignments AND round-number fallback
    // for gameweeks without assignments. This ensures fixtures aren't dropped
    // just because some gameweeks have assignments and others don't.
    let fixtures: any[] = [];

    if (explicitlyAssignedFixtureIds.size > 0 && gameweeksWithoutAssignments.size > 0) {
        // Both explicit assignments and fallback rounds exist — query for both and deduplicate
        const [explicitFixtures, fallbackFixtures] = await Promise.all([
            Fixture.find({ fixtureId: { $in: Array.from(explicitlyAssignedFixtureIds) } }).sort({ startTimestamp: 1 }).lean(),
            Fixture.find({ 'roundInfo.round': { $in: Array.from(gameweeksWithoutAssignments) } }).sort({ startTimestamp: 1 }).lean(),
        ]);

        // Deduplicate by fixtureId (a fixture could match both explicit ID and round number)
        const seen = new Set<number>();
        for (const f of [...explicitFixtures, ...fallbackFixtures]) {
            const fid = Number(f.fixtureId);
            if (!seen.has(fid)) {
                seen.add(fid);
                fixtures.push(f);
            }
        }
        // Re-sort by kickoff after deduplication
        fixtures.sort((a, b) => (a.startTimestamp || 0) - (b.startTimestamp || 0));
    } else if (explicitlyAssignedFixtureIds.size > 0) {
        // Only explicit assignments exist
        fixtures = (await Fixture.find({ fixtureId: { $in: Array.from(explicitlyAssignedFixtureIds) } }).sort({ startTimestamp: 1 }).lean()) as any[];
    } else if (gameweeksWithoutAssignments.size > 0) {
        // Only fallback rounds exist (no gameweek has explicit assignments)
        fixtures = (await Fixture.find({ 'roundInfo.round': { $in: Array.from(gameweeksWithoutAssignments) } }).sort({ startTimestamp: 1 }).lean()) as any[];
    } else {
        // No gameweeks at all — return empty
        fixtures = [];
    }

    const teams = (await Team.find({}).populate('league').lean()) as any[];
    const teamMap = new Map<number, any>();
    for (const t of teams) {
        const tid = t.team?.id ?? t.id;
        if (tid != null) teamMap.set(tid, t);
    }

    const leagueName = (t: any): string => {
        return t?.league?.name || 'Unknown';
    };

    const rows: any[][] = [];
    for (const f of fixtures) {
        const home = teamMap.get(f.homeTeam?.id);
        const away = teamMap.get(f.awayTeam?.id);
        const gw = fixtureGwMap.get(Number(f.fixtureId)) ?? f.roundInfo?.round ?? '';

        rows.push([
            gw,
            leagueName(home),
            f.roundInfo?.round ?? '',
            kickoffString(f.startTimestamp),
            home?.name || home?.team?.name || f.homeTeam?.id || '',
            home?.nameCode || home?.shortName || '',
            away?.name || away?.team?.name || f.awayTeam?.id || '',
            away?.nameCode || away?.shortName || '',
            f.status?.description || f.status?.type || '',
            f.homeScore?.current ?? f.homeScore?.display ?? '',
            f.awayScore?.current ?? f.awayScore?.display ?? '',
            f.fixtureId ?? '',
        ]);
    }

    // Order by gameweek, then kickoff
    rows.sort((a, b) => (Number(a[0]) || 0) - (Number(b[0]) || 0) || String(a[3]).localeCompare(String(b[3])));

    return rows;
};
