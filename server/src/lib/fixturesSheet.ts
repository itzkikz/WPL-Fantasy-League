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
 * Build rows for the "Fixtures" sheet: one row per fixture that belongs to the
 * current (and next non-completed) gameweeks. Fixtures are matched the same way
 * as the app's upcoming-fixtures logic — by explicit gameweek assignment
 * (fixtureId) and, as a fallback, by `roundInfo.round` — so rescheduled or
 * double-gameweek fixtures are never dropped. Each row carries the gameweek
 * label (assigned gameweek, else league round), league, kickoff, both teams and
 * the live status/score.
 */
export const buildCurrentFixturesRows = async (): Promise<any[][]> => {
    const currentGwDoc = (await Gameweek.findOne({ isCurrent: true }).lean()) as any;
    const targetGw = currentGwDoc ? currentGwDoc.number : 1;

    // Current gameweek + the next two, so the sheet shows the fixtures that
    // matter right now rather than the whole season.
    const upcomingGwDocs = (await Gameweek.find({ isCompleted: { $ne: true }, number: { $gte: targetGw, $lte: targetGw + 2 } }).select('number fixtures').lean()) as any[];
    const upcomingRounds = upcomingGwDocs.map((g) => g.number);
    const upcomingFixtureIds = [...new Set(upcomingGwDocs.flatMap((g: any) => (g.fixtures || []).map((f: any) => Number(f?.fixtureId ?? f?.id ?? f)).filter(Boolean)))];
    const fixtureGwMap = new Map<number, number>();
    for (const g of upcomingGwDocs) {
        for (const fid of (g.fixtures || [])) fixtureGwMap.set(Number(fid?.fixtureId ?? fid?.id ?? fid), g.number);
    }

    // Export only the fixtures explicitly assigned to these gameweeks, so the
    // sheet mirrors the gameweeks collection. Round-number matching is used
    // only as a fallback when no gameweek in the window has assignments yet
    // (otherwise the sheet would invent "Gameweek 2/3" rows from unassigned
    // fixtures whose league round happens to be 2 or 3).
    const fixtures = upcomingFixtureIds.length > 0
        ? (await Fixture.find({ fixtureId: { $in: upcomingFixtureIds } }).sort({ startTimestamp: 1 }).lean() as any[])
        : (await Fixture.find({ 'roundInfo.round': { $in: upcomingRounds } }).sort({ startTimestamp: 1 }).lean() as any[]);

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
