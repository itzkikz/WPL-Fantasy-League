import dotenv from 'dotenv';
import connectDB from '../config/db';
import { Team } from '../models/Team';
import { League } from '../models/League';
import { launchWarmSession, fetchSofascoreJSON } from '../utils/sofascoreScraper';

dotenv.config();

const buildStandingsUrl = (leagueId: number, leagueSeasonId: number) =>
    `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${leagueSeasonId}/standings/total`;

interface LeagueSeedRef {
    name: string;
    leagueId: number;
    leagueSeasonId: number;
}

const seedTeams = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // Drop old indexes from previous schema (team.id nested)
        try {
            await Team.collection.dropIndex('team.id_1');
            console.log('Dropped old team.id_1 index');
        } catch {
            console.log('No old team.id_1 index to drop (or already dropped)');
        }

        // Read leagues from DB to drive the loop (single source of truth)
        const leagueRefs: LeagueSeedRef[] = await League.find(
            { leagueId: { $exists: true }, leagueSeasonId: { $exists: true } },
            { name: 1, leagueId: 1, leagueSeasonId: 1, _id: 1 }
        ).lean().then((docs) =>
            docs.map((d: any) => ({
                name: d.name as string,
                leagueId: d.leagueId as number,
                leagueSeasonId: d.leagueSeasonId as number,
                leagueMongoId: d._id,
            }))
        );

        if (leagueRefs.length === 0) {
            throw new Error('No leagues found. Run seed:leagues first.');
        }

        console.log(`Found ${leagueRefs.length} leagues to seed teams for.`);

        console.log('Warming Puppeteer session...');
        const { browser, page } = await launchWarmSession();

        try {
            let totalInserted = 0;

            for (const league of leagueRefs as any[]) {
                console.log(
                    `\n— ${league.name} (leagueId=${league.leagueId}, leagueSeasonId=${league.leagueSeasonId})`
                );
                const url = buildStandingsUrl(league.leagueId, league.leagueSeasonId);
                const data = await fetchSofascoreJSON(url, page);

                const rows = data?.standings?.[0]?.rows;
                if (!rows || !Array.isArray(rows)) {
                    console.warn(`  No standings rows for ${league.name}, skipping.`);
                    continue;
                }

                console.log(`  Found ${rows.length} teams in standings`);
                const teamMongoIds: any[] = [];

                let i = 0;
                for (const row of rows) {
                    const teamData = row.team;
                    if (!teamData || !teamData.id) {
                        console.warn('  Skipping row without team data:', row);
                        continue;
                    }

                    const { sport, gender, userCount, fieldTranslations, ...cleanTeam } = teamData;

                    const upserted = await Team.findOneAndUpdate(
                        { id: cleanTeam.id },
                        { $set: cleanTeam, $setOnInsert: { league: league.leagueMongoId } },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    teamMongoIds.push(upserted!._id);
                    i++;
                    console.log(`    ${i}. ${teamData.name} (${teamData.id})`);
                }

                // Link the team ObjectIds back to the league document
                await League.updateOne(
                    { _id: league.leagueMongoId },
                    { $addToSet: { teams: { $each: teamMongoIds } } }
                );
                console.log(`  Linked ${teamMongoIds.length} teams to league "${league.name}"`);
                totalInserted += teamMongoIds.length;
            }

            console.log(`\n✅ Successfully upserted ${totalInserted} teams across ${leagueRefs.length} leagues.`);
        } finally {
            await browser.close();
            console.log('Browser closed');
        }
    } catch (error) {
        console.error('Error seeding teams:', error);
        process.exit(1);
    }
};

seedTeams();
