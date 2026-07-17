import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Team } from '../models/Team';
import { Player } from '../models/Player';
import { launchWarmSession } from '../utils/sofascoreScraper';

dotenv.config();

const DELAY_MS = 2000;

const fetchSofascorePlayers = async (page: any, teamId: number) => {
    return await page.evaluate(async (url: string) => {
        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Referer': 'https://www.sofascore.com/'
            }
        });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        return res.json();
    }, `https://www.sofascore.com/api/v1/team/${teamId}/players`);
};

const seedPlayers = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const teams = await Team.find(
            { id: { $exists: true } },
            { id: 1, name: 1, _id: 0 }
        ).lean();

        console.log(`Found ${teams.length} teams to fetch players for.`);

        if (teams.length === 0) {
            throw new Error('No teams found. Run seed:sofascore-teams first.');
        }

        console.log('Warming Puppeteer session...');
        const { browser, page } = await launchWarmSession();

        let totalSaved = 0;
        let totalTeams = 0;
        let totalErrors = 0;

        try {
            for (const [index, team] of teams.entries()) {
                const teamData = team as any;
                const teamId = teamData.id as number;
                const teamName = teamData.name || `Team ${teamId}`;

                console.log(`\n[${index + 1}/${teams.length}] ${teamName} (teamId=${teamId})`);

                try {
                    const data = await fetchSofascorePlayers(page, teamId);

                    if (!data) {
                        console.warn(`  Empty response body`);
                        totalErrors++;
                        continue;
                    }

                    const players = data.players;
                    if (!Array.isArray(players)) {
                        console.warn(`  Response has no "players" array. Keys: ${Object.keys(data).join(', ')}`);
                        if (players === undefined) {
                            console.warn(`  "players" key is undefined — API may have returned a different shape`);
                        }
                        totalErrors++;
                        continue;
                    }

                    console.log(`  Received ${players.length} players`);

                    if (players.length === 0) {
                        console.warn(`  Empty players array`);
                        totalErrors++;
                        continue;
                    }

                    let saved = 0;
                    for (const item of players) {
                        const p = item?.player;
                        if (!p || !p.id) {
                            console.warn(`  Skipping player item without player.id`);
                            continue;
                        }

                        const playerDoc = {
                            id: p.id,
                            name: p.name,
                            slug: p.slug,
                            shortName: p.shortName,
                            teamId,
                            position: p.position,
                            positionsDetailed: p.positionsDetailed,
                            weight: p.weight,
                            jerseyNumber: p.jerseyNumber,
                            height: p.height,
                            dateOfBirth: p.dateOfBirth,
                            preferredFoot: p.preferredFoot,
                            retired: p.retired,
                            userCount: p.userCount,
                            deceased: p.deceased,
                            gender: p.gender,
                            sofascoreId: p.sofascoreId,
                            underage: p.underage,
                            shirtNumber: p.shirtNumber,
                            dateOfBirthTimestamp: p.dateOfBirthTimestamp,
                            contractUntilTimestamp: p.contractUntilTimestamp,
                            proposedMarketValue: p.proposedMarketValue,
                            proposedMarketValueRaw: p.proposedMarketValueRaw,
                            country: p.country
                        };

                        await Player.findOneAndUpdate(
                            { id: playerDoc.id },
                            { $set: playerDoc },
                            { upsert: true, setDefaultsOnInsert: true }
                        );
                        saved++;
                    }

                    console.log(`  Saved ${saved}/${players.length} players`);
                    totalSaved += saved;
                    totalTeams++;

                    if (index < teams.length - 1) {
                        console.log(`  Waiting ${DELAY_MS}ms...`);
                        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
                    }
                } catch (err: any) {
                    console.error(`  Failed: ${err.message}`);
                    totalErrors++;
                }
            }
        } finally {
            await browser.close();
            console.log('Browser closed');
        }

        console.log(`\nDone. ${totalSaved} players saved across ${totalTeams} teams (${totalErrors} errors).`);
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
};

seedPlayers();
