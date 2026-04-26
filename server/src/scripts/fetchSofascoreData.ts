/**
 * Standalone script to fetch Sofascore data and save as JSON files.
 * Designed to run inside GitHub Actions on a cron schedule.
 * 
 * Usage: npx ts-node src/scripts/fetchSofascoreData.ts
 */

import path from 'path';
import fs from 'fs';
import { launchWarmSession, fetchSofascoreJSON } from '../utils/sofascoreScraper';

// ── Configuration ──────────────────────────────────────────
// Mapping of SEASON_ID to its corresponding unique-tournament ID
const TOURNAMENT_SEASONS: Record<string, string> = {
    '76986': '17',
    '77559': '8',
    '76457': '23',
    '77356': '34',
    '77333': '35'
};

const DATA_DIR = path.resolve(__dirname, '../data/sofascore');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const saveJSON = (filename: string, data: any) => {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`  💾 Saved ${filePath}`);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Main ───────────────────────────────────────────────────
async function main() {
    console.log('🚀 Starting Sofascore data sync...');
    console.log(`   Season IDs: ${Object.keys(TOURNAMENT_SEASONS).join(', ')}`);
    console.log(`   Data dir:  ${DATA_DIR}\n`);

    const { browser, page } = await launchWarmSession();

    try {
        for (const [SEASON_ID, TOURNAMENT_ID] of Object.entries(TOURNAMENT_SEASONS)) {
            console.log(`\n==============================================`);
            console.log(`   Processing Season ID: ${SEASON_ID} (Tournament: ${TOURNAMENT_ID})`);
            console.log(`==============================================\n`);

            // 1. Fetch rounds
            console.log('📋 Fetching rounds...');
            const roundsUrl = `https://www.sofascore.com/api/v1/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/rounds`;
            const roundsData = await fetchSofascoreJSON(roundsUrl, page);
            saveJSON(`${SEASON_ID}_rounds.json`, roundsData);
            await delay(2000);

            // 2. Fetch standings
            console.log('📊 Fetching standings...');
            const standingsUrl = `https://www.sofascore.com/api/v1/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/standings/total`;
            const standingsData = await fetchSofascoreJSON(standingsUrl, page);
            saveJSON(`${SEASON_ID}_standings.json`, standingsData);
            await delay(2000);

            // 3. Fetch events for each round
            const totalRounds = roundsData?.currentRound?.round || roundsData?.rounds?.length || 1;
            console.log(`⚽ Fetching events for ${totalRounds} rounds...`);
            // for (let round = 1; round <= totalRounds; round++) {
            //     console.log(`   Round ${round}/${totalRounds}`);
            const eventsUrl = `https://www.sofascore.com/api/v1/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/events/round/${roundsData?.currentRound?.round}`;
            const eventsData = await fetchSofascoreJSON(eventsUrl, page);
            saveJSON(`${SEASON_ID}_events_round_${roundsData?.currentRound?.round}.json`, eventsData);
            //     await delay(1500);
            // }

            // 4. Fetch team players from standings
            if (standingsData?.standings?.[0]?.rows) {
                const teams = standingsData.standings[0].rows;
                console.log(`👥 Fetching players for ${teams.length} teams...`);
                for (const row of teams) {
                    const teamId = row.team?.id;
                    const teamName = row.team?.name || teamId;
                    if (!teamId) continue;
                    console.log(`   Team: ${teamName} (${teamId})`);
                    const playersUrl = `https://www.sofascore.com/api/v1/team/${teamId}/players`;
                    const playersData = await fetchSofascoreJSON(playersUrl, page);
                    saveJSON(`${SEASON_ID}_team_${teamId}_players.json`, playersData);
                    await delay(1500);
                }
            }

            // 5. Fetch match details (incidents, lineups, best-players) for the latest round
            const latestRound = roundsData?.currentRound?.round || totalRounds;
            const latestEventsFile = path.join(DATA_DIR, `${SEASON_ID}_events_round_${latestRound}.json`);
            if (fs.existsSync(latestEventsFile)) {
                const latestEvents = JSON.parse(fs.readFileSync(latestEventsFile, 'utf-8'));
                const matches = latestEvents?.events || [];
                console.log(`🏟️  Fetching match details for ${matches.length} matches in round ${latestRound}...`);

                const fantasyPlayerStats: any[] = [];

                for (const match of matches) {
                    const matchId = match.id;
                    if (!matchId) continue;
                    const matchLabel = `${match.homeTeam?.name || '?'} vs ${match.awayTeam?.name || '?'}`;
                    console.log(`   Match: ${matchLabel} (${matchId})`);

                    if (match.status?.type === 'finished') {
                        // Incidents
                        const incidentsData = await fetchSofascoreJSON(
                            `https://www.sofascore.com/api/v1/event/${matchId}/incidents`, page
                        );
                        saveJSON(`${SEASON_ID}_match_${matchId}_incidents.json`, incidentsData);
                        await delay(1000);

                        // Lineups
                        const lineupsData = await fetchSofascoreJSON(
                            `https://www.sofascore.com/api/v1/event/${matchId}/lineups`, page
                        );
                        saveJSON(`${SEASON_ID}_match_${matchId}_lineups.json`, lineupsData);
                        await delay(1000);

                        // Best players
                        const bestPlayersData = await fetchSofascoreJSON(
                            `https://www.sofascore.com/api/v1/event/${matchId}/best-players/summary`, page
                        );
                        saveJSON(`${SEASON_ID}_match_${matchId}_best_players.json`, bestPlayersData);
                        await delay(1000);

                        // --- FANTASY DATA EXTRACTION ---
                        try {
                            const homeCS = match.awayScore?.current === 0;
                            const awayCS = match.homeScore?.current === 0;

                            const mergedPlayers = [
                                ...(lineupsData?.home?.players || []).map((p: any) => ({ ...p, isCleanSheet: homeCS, teamName: match.homeTeam.name, game: `${match.homeTeam.nameCode} vs ${match.awayTeam.nameCode}`, teamId: match.homeTeam.id })),
                                ...(lineupsData?.away?.players || []).map((p: any) => ({ ...p, isCleanSheet: awayCS, teamName: match.awayTeam.name, game: `${match.homeTeam.nameCode} vs ${match.awayTeam.nameCode}`, teamId: match.awayTeam.id }))
                            ];

                            for (const players of mergedPlayers) {
                                const playerIncidents = (incidentsData?.incidents || []).filter((val: any) => val?.player?.id === players?.player?.id);
                                const player = players.player?.name || 0;
                                const goals = players.statistics?.goals || 0;
                                const assists = players.statistics?.goalAssist || 0;
                                const saves = players.statistics?.saves || 0;
                                const penaltyMiss = players.statistics?.penaltyMiss || 0;
                                const penaltySave = players.statistics?.penaltySave || 0;
                                const rating = players.statistics?.rating || 0;
                                const position = players.position || '';
                                const isPom = bestPlayersData?.playerOfTheMatch?.player?.id === players?.player?.id;
                                const playerId = players?.player?.id;

                                let app = 1;
                                if (!players.statistics || Object.keys(players.statistics).length === 0) {
                                    app = 0;
                                }

                                let yellow = 0;
                                let red = 0;
                                playerIncidents.forEach((val: any) => {
                                    if (val.incidentType === 'card' && (val.incidentClass === 'yellow' || val.incidentClass === 'yellowRed')) {
                                        yellow = yellow + 1;
                                    }
                                    if (val.incidentType === 'card' && val.incidentClass === 'red') {
                                        red = 1;
                                    }
                                });

                                const cs = (app === 1 && players.isCleanSheet && (players.statistics?.minutesPlayed >= 60)) ? 1 : 0;
                                if (app === 1) {
                                    fantasyPlayerStats.push({
                                        player,
                                        position,
                                        app,
                                        goals,
                                        assists,
                                        cs,
                                        saves,
                                        red,
                                        yellow,
                                        penaltyMiss,
                                        penaltySave,
                                        isPom: isPom ? 1 : 0,
                                        round: latestRound,
                                        minutesPlayed: players.statistics?.minutesPlayed || 0,
                                        teamName: players.teamName,
                                        game: players.game,
                                        rating,
                                        playerId,
                                        seasonId: SEASON_ID,
                                        teamId: players.teamId
                                    });
                                }
                            }
                        } catch (e) {
                            console.error(`Error mapping fantasy stats for match ${matchId}:`, e);
                        }
                    }
                } // End inner matches loop

                // Save compiled stats array
                if (fantasyPlayerStats.length > 0) {
                    saveJSON(`${SEASON_ID}_fantasy_players_round_${latestRound}.json`, fantasyPlayerStats);
                    console.log(`   ✨ Saved fantasy player stats for ${fantasyPlayerStats.length} players in Round ${latestRound}!`);
                }
            } // End events file check
        } // End outer season loop

        console.log('\n✅ Sofascore data sync complete for all seasons!');
    } catch (error) {
        console.error('❌ Error during sync:', error);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
}

main();
