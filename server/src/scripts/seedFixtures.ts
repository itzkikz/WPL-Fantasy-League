import dotenv from 'dotenv';
import connectDB from '../config/db';
import { League } from '../models/League';
import { Fixture } from '../models/Fixture';
import { MatchDetails } from '../models/MatchDetails';
import { launchWarmSession } from '../utils/sofascoreScraper';

dotenv.config();

const EXCLUDED_KEYS = new Set([
    'changes', 'eventFilters', 'correctAiInsight', 'correctHalftimeAiInsight',
    'crowdsourcingDataDisplayEnabled', 'customId', 'detailId', 'feedLocked',
    'finalResultOnly', 'hasEventPlayerHeatMap', 'hasGlobalHighlights', 'hasXg'
]);

const pickFields = (event: any): Record<string, any> => {
    const doc: Record<string, any> = {};

    for (const key of Object.keys(event)) {
        if (EXCLUDED_KEYS.has(key)) continue;

        if (key === 'tournament') {
            doc.tournament = { id: event.tournament?.id };
            doc.uniqueTournament = { id: event.tournament?.uniqueTournament?.id };
        } else if (key === 'season') {
            doc.season = { id: event.season?.id };
        } else if (key === 'homeTeam') {
            doc.homeTeam = { id: event.homeTeam?.id };
        } else if (key === 'awayTeam') {
            doc.awayTeam = { id: event.awayTeam?.id };
        } else if (key !== 'id') {
            doc[key] = event[key];
        }
    }

    return doc;
};

const fetchViaPage = async (page: any, url: string): Promise<any> => {
    try {
        return await page.evaluate(async (fetchUrl: string) => {
            const res = await fetch(fetchUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Referer': 'https://www.sofascore.com/'
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} ${res.statusText}`);
            }
            return res.json();
        }, url);
    } catch (err: any) {
        if (err.message?.includes('HTTP 404')) {
            console.log(`    API returned 404 for ${url.split('/').pop()} — no data`);
            return null;
        }
        throw err;
    }
};

const fetchIncidents = (page: any, fixtureId: number) =>
    fetchViaPage(page, `https://www.sofascore.com/api/v1/event/${fixtureId}/incidents`);

const fetchLineups = (page: any, fixtureId: number) =>
    fetchViaPage(page, `https://www.sofascore.com/api/v1/event/${fixtureId}/lineups`);

const fetchFixturesForRound = async (page: any, tournamentId: number, seasonId: number, round: number) => {
    const url = `https://www.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/events/round/${round}`;
    return await page.evaluate(async (fetchUrl: string) => {
        const res = await fetch(fetchUrl, {
            headers: {
                'Accept': 'application/json',
                'Referer': 'https://www.sofascore.com/'
            }
        });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        return res.json();
    }, url);
};

const seedFixtures = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const leagues = await League.find(
            { leagueId: { $exists: true }, leagueSeasonId: { $exists: true }, currentRound: { $exists: true } },
            { name: 1, leagueId: 1, leagueSeasonId: 1, currentRound: 1 }
        ).lean();

        console.log(`Found ${leagues.length} leagues with round data.`);

        if (leagues.length === 0) {
            throw new Error('No leagues with round data found. Run seed:rounds first.');
        }

        await Fixture.collection.dropIndex('fixture.id_1').catch(() => {});
        await Fixture.collection.dropIndex('id_1').catch(() => {});
        console.log('Dropped stale indexes');

        console.log('Warming Puppeteer session...');
        const { browser, page } = await launchWarmSession();

        let totalSaved = 0;

        try {
            for (const [index, league] of leagues.entries()) {
                const leagueData = league as any;
                const name = leagueData.name;
                const tournamentId = leagueData.leagueId as number;
                const seasonId = leagueData.leagueSeasonId as number;
                const round = leagueData.currentRound as number;

                console.log(`\n[${index + 1}/${leagues.length}] ${name} — fetching round ${round} (tournament=${tournamentId}, season=${seasonId})`);

                try {
                    const data = await fetchFixturesForRound(page, tournamentId, seasonId, round);

                    const events = data.events;
                    if (!Array.isArray(events)) {
                        console.warn(`  Response has no "events" array. Keys: ${Object.keys(data).join(', ')}`);
                        continue;
                    }

                    console.log(`  Got ${events.length} events`);

                    let saved = 0;
                    let errors = 0;
                    for (const [ei, event] of events.entries()) {
                        try {
                            const fixtureDoc = pickFields(event);
                            fixtureDoc.fixtureId = event.id;

                            console.log(`  [${ei + 1}/${events.length}] Saving event ${event.id}...`);

                            await Fixture.findOneAndUpdate(
                                { fixtureId: event.id },
                                { $set: fixtureDoc },
                                { upsert: true }
                            );

                            if (event.status?.description === 'Ended' && event.status?.type === 'finished') {
                                console.log(`    Finished match — fetching post-match data...`);

                                try {
                                    const incidentsData = await fetchIncidents(page, event.id);
                                    if (incidentsData?.incidents) {
                                        await MatchDetails.findOneAndUpdate(
                                            { fixtureId: event.id },
                                            { incidents: incidentsData.incidents, addedtofantasy: false },
                                            { upsert: true }
                                        );
                                        console.log(`    Saved ${incidentsData.incidents.length} incidents`);
                                    }
                                } catch (incErr: any) {
                                    if (incErr.message?.includes('HTTP 404')) {
                                        console.log(`    No incidents data for event ${event.id}`);
                                    } else {
                                        console.warn(`    Could not fetch incidents: ${incErr.message}`);
                                    }
                                }

                                await new Promise(resolve => setTimeout(resolve, 1000));

                                try {
                                    const lineupsData = await fetchLineups(page, event.id);
                                    if (lineupsData?.home?.players || lineupsData?.away?.players) {
                                        const lineups: { playerId: number; teamId: number; statistics: any; side: string; position: string }[] = [];
                                        for (const side of ['home', 'away'] as const) {
                                            for (const entry of (lineupsData[side]?.players ?? [])) {
                                                if (!entry.player?.id) continue;
                                                lineups.push({
                                                    playerId: entry.player.id,
                                                    teamId: entry.teamId,
                                                    statistics: entry.statistics ?? {},
                                                    side,
                                                    position: entry.position || ''
                                                });
                                            }
                                        }
                                        await MatchDetails.findOneAndUpdate(
                                            { fixtureId: event.id },
                                            { $set: { lineups, addedtofantasy: false } },
                                            { upsert: true }
                                        );
                                        console.log(`    Saved ${lineups.length} lineup players`);
                                    }
                                } catch (lineErr: any) {
                                    if (lineErr.message?.includes('HTTP 404')) {
                                        console.log(`    No lineups data for event ${event.id}`);
                                    } else {
                                        console.warn(`    Could not fetch lineups: ${lineErr.message}`);
                                    }
                                }
                            } else {
                                await new Promise(resolve => setTimeout(resolve, 500));
                            }

                            saved++;
                        } catch (evErr: any) {
                            errors++;
                            console.error(`  [${ei + 1}/${events.length}] Error saving event ${event.id}: ${evErr.message}`);
                        }
                    }

                    console.log(`  Done: ${saved} saved, ${errors} errors`);
                    totalSaved += saved;
                } catch (err: any) {
                    console.error(`  Failed for league: ${err.message}`);
                }
            }

            console.log(`\nDone. Saved ${totalSaved} fixtures across ${leagues.length} leagues.`);
        } finally {
            await browser.close();
            console.log('Browser closed');
        }

        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
};

seedFixtures();
