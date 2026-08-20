import dotenv from 'dotenv';
import connectDB from '../config/db';
import { League } from '../models/League';
import { launchWarmSession, fetchViaPage } from '../utils/sofascoreScraper';

dotenv.config();

const fetchRounds = (page: any, leagueId: number, seasonId: number) =>
    fetchViaPage(page, `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${seasonId}/rounds`);

const seedRounds = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const leagues = await League.find(
            { leagueId: { $exists: true }, leagueSeasonId: { $exists: true } },
            { name: 1, leagueId: 1, leagueSeasonId: 1 }
        ).lean();

        console.log(`Found ${leagues.length} leagues to fetch rounds for.`);

        if (leagues.length === 0) {
            throw new Error('No leagues found. Run seed:leagues first.');
        }

        console.log('Warming Puppeteer session...');
        let { browser, page } = await launchWarmSession();

        let totalUpdated = 0;

        try {
            for (const [index, league] of leagues.entries()) {
                const leagueData = league as any;
                const name = leagueData.name;
                const leagueId = leagueData.leagueId as number;
                const seasonId = leagueData.leagueSeasonId as number;

                console.log(`\n[${index + 1}/${leagues.length}] ${name} (leagueId=${leagueId}, seasonId=${seasonId})`);

                const processLeague = async () => {
                    const data = await fetchRounds(page, leagueId, seasonId);

                    if (!data) {
                        console.warn(`  Empty response body`);
                        return;
                    }

                    const rounds = data.rounds;
                    if (!Array.isArray(rounds)) {
                        console.warn(`  Response has no "rounds" array. Keys: ${Object.keys(data).join(', ')}`);
                        return;
                    }

                    const totalRounds = rounds.length;
                    const currentRound = data.currentRound?.round ?? null;

                    console.log(`  Rounds: ${totalRounds}, Current: ${currentRound}`);

                    await League.findOneAndUpdate(
                        { leagueId },
                        { $set: { totalRounds, currentRound } }
                    );

                    console.log(`  Updated ${name}`);
                    totalUpdated++;
                };

                try {
                    await processLeague();
                } catch (err: any) {
                    if (/(403|429|503)/.test(err.message)) {
                        console.error(`  Failed (${err.message}). Re-warming session and retrying...`);
                        try {
                            await browser.close();
                            ({ browser, page } = await launchWarmSession());
                            await processLeague();
                        } catch (retryErr: any) {
                            console.error(`  Re-fetch also failed: ${retryErr.message}`);
                        }
                    } else {
                        console.error(`  Failed: ${err.message}`);
                    }
                }
            }

            console.log(`\nDone. Updated rounds for ${totalUpdated}/${leagues.length} leagues.`);
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

seedRounds();
