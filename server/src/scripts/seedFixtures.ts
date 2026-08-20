import dotenv from 'dotenv';
import connectDB from '../config/db';
import { League } from '../models/League';
import { Fixture } from '../models/Fixture';
import { MatchDetails } from '../models/MatchDetails';
import { launchWarmSession, fetchViaPage } from '../utils/sofascoreScraper';
import { pickFields, mapLineups } from '../lib/sofascoreFixtures';

dotenv.config();

const REQUEST_DELAY_MS = 2500;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchIncidents = (page: any, fixtureId: number) =>
    fetchViaPage(page, `https://www.sofascore.com/api/v1/event/${fixtureId}/incidents`);

const fetchLineups = (page: any, fixtureId: number) =>
    fetchViaPage(page, `https://www.sofascore.com/api/v1/event/${fixtureId}/lineups`);

const fetchFixturesForRound = (page: any, tournamentId: number, seasonId: number, round: number) =>
    fetchViaPage(page, `https://www.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/events/round/${round}`);

/**
 * Persists a round's events (fixtures) plus post-match data (incidents/lineups)
 * for finished matches. Returns the number of fixtures saved.
 */
const saveFixturesForRound = async (page: any, events: any[]): Promise<number> => {
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
                        // $set + $setOnInsert only: never reset addedtofantasy on an
                        // existing doc (that flag is owned by the admin add/undo flow),
                        // and never replace the whole doc (that would wipe lineups).
                        await MatchDetails.findOneAndUpdate(
                            { fixtureId: event.id },
                            { $set: { incidents: incidentsData.incidents }, $setOnInsert: { addedtofantasy: false } },
                            { upsert: true }
                        );
                        console.log(`    Saved ${incidentsData.incidents.length} incidents`);
                    }
                } catch (incErr: any) {
                    console.warn(`    Could not fetch incidents: ${incErr.message}`);
                }

                await sleep(REQUEST_DELAY_MS);

                try {
                    const lineupsData = await fetchLineups(page, event.id);
                    if (lineupsData?.home?.players || lineupsData?.away?.players) {
                        const lineups = mapLineups(lineupsData);
                        await MatchDetails.findOneAndUpdate(
                            { fixtureId: event.id },
                            { $set: { lineups }, $setOnInsert: { addedtofantasy: false } },
                            { upsert: true }
                        );
                        console.log(`    Saved ${lineups.length} lineup players`);
                    }
                } catch (lineErr: any) {
                    console.warn(`    Could not fetch lineups: ${lineErr.message}`);
                }
            }

            saved++;
        } catch (evErr: any) {
            errors++;
            console.error(`  [${ei + 1}/${events.length}] Error saving event ${event.id}: ${evErr.message}`);
        }

        await sleep(REQUEST_DELAY_MS);
    }

    console.log(`  Done: ${saved} saved, ${errors} errors`);
    return saved;
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
        let { browser, page } = await launchWarmSession();

        let totalSaved = 0;

        try {
            for (const [index, league] of leagues.entries()) {
                const leagueData = league as any;
                const name = leagueData.name;
                const tournamentId = leagueData.leagueId as number;
                const seasonId = leagueData.leagueSeasonId as number;
                const round = leagueData.currentRound as number;

                console.log(`\n[${index + 1}/${leagues.length}] ${name} — fetching round ${round} (tournament=${tournamentId}, season=${seasonId})`);

                const processLeague = async () => {
                    const data = await fetchFixturesForRound(page, tournamentId, seasonId, round);

                    const events = data.events;
                    if (!Array.isArray(events)) {
                        console.warn(`  Response has no "events" array. Keys: ${Object.keys(data).join(', ')}`);
                        return 0;
                    }

                    console.log(`  Got ${events.length} events`);
                    const saved = await saveFixturesForRound(page, events);
                    return saved;
                };

                try {
                    totalSaved += await processLeague();
                } catch (err: any) {
                    // 403 (challenge/IP block) or 503 (rate limit) — the session is dead.
                    // Re-warm a fresh session and retry this league once.
                    if (/(403|429|503)/.test(err.message)) {
                        console.error(`  Failed for league (${err.message}). Re-warming session and retrying...`);
                        try {
                            await browser.close();
                            ({ browser, page } = await launchWarmSession());
                            totalSaved += await processLeague();
                        } catch (retryErr: any) {
                            console.error(`  Re-fetch also failed for league: ${retryErr.message}`);
                        }
                    } else {
                        console.error(`  Failed for league: ${err.message}`);
                    }
                }

                await sleep(REQUEST_DELAY_MS);
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