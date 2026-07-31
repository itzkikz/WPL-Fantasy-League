import path from 'path';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { launchWarmSession, fetchSofascoreJSON } from '../utils/sofascoreScraper';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');
const SHEET_ID = process.env.API_DATA_SHEET_ID || '1plKi4qvX0yR4BK6LAxzkDdJfNfKXABFjiYNhgTmh4zg';
const SHEET_NAME = 'Players';
const DELAY_MS = 1500;

interface LeagueRef {
  name: string;
  leagueId: number;
  leagueSeasonId: number;
}

const LEAGUES: LeagueRef[] = [
  { name: 'Premier League', leagueId: 17, leagueSeasonId: 96668 },
  { name: 'LaLiga', leagueId: 8, leagueSeasonId: 97268 },
  { name: 'Bundesliga', leagueId: 35, leagueSeasonId: 97464 },
  { name: 'Serie A', leagueId: 23, leagueSeasonId: 95836 },
  { name: 'Ligue 1', leagueId: 34, leagueSeasonId: 96127 }
];

const buildStandingsUrl = (leagueId: number, leagueSeasonId: number) =>
  `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${leagueSeasonId}/standings/total`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureSheetExists = async (sheets: any, spreadsheetId: string, sheetTitle: string) => {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = meta.data.sheets?.some(
    (s: any) => s.properties?.title?.toLowerCase() === sheetTitle.toLowerCase()
  );

  if (!sheetExists) {
    console.log(`Sheet "${sheetTitle}" not found. Creating it...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle
              }
            }
          }
        ]
      }
    });
    console.log(`Sheet "${sheetTitle}" created successfully.`);
  }
};

const exportPlayersToGoogleSheet = async () => {
  console.log('🚀 Starting Sofascore player fetch and Google Sheet export...');
  console.log(`Target Spreadsheet ID: ${SHEET_ID}`);
  console.log(`Target Sheet Name: ${SHEET_NAME}`);

  // 1. Setup Google Sheets Client
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES
  });
  const sheets = google.sheets({ version: 'v4', auth });

  await ensureSheetExists(sheets, SHEET_ID, SHEET_NAME);

  // 2. Launch Puppeteer session for Sofascore scraping
  console.log('\nWarming up Puppeteer session...');
  const { browser, page } = await launchWarmSession();

  const headers = [
    'Player ID',
    'Name',
    'Short Name',
    'Slug',
    'Position',
    'Detailed Positions',
    'Jersey Number',
    'Height',
    'Weight',
    'Date of Birth',
    'Preferred Foot',
    'Country',
    'Market Value',
    'Team ID',
    'Team Name',
    'League ID',
    'League Name'
  ];

  const allPlayerRows: any[][] = [];
  let totalPlayersCount = 0;
  let totalTeamsCount = 0;

  try {
    for (const league of LEAGUES) {
      console.log(`\n==============================================`);
      console.log(`🏆 Fetching standings for ${league.name} (League ID: ${league.leagueId})...`);
      console.log(`==============================================`);

      const standingsUrl = buildStandingsUrl(league.leagueId, league.leagueSeasonId);
      const standingsData = await fetchSofascoreJSON(standingsUrl, page);

      const rows = standingsData?.standings?.[0]?.rows;
      if (!rows || !Array.isArray(rows)) {
        console.warn(`⚠️ No standings rows found for ${league.name}, skipping.`);
        continue;
      }

      console.log(`Found ${rows.length} teams in ${league.name}.`);

      for (const [tIdx, row] of rows.entries()) {
        const teamData = row.team;
        if (!teamData || !teamData.id) {
          continue;
        }

        const teamId = teamData.id;
        const teamName = teamData.name || `Team ${teamId}`;
        totalTeamsCount++;

        console.log(`  [${tIdx + 1}/${rows.length}] Fetching players for ${teamName} (ID: ${teamId})...`);

        try {
          const playersUrl = `https://www.sofascore.com/api/v1/team/${teamId}/players`;
          const playersData = await fetchSofascoreJSON(playersUrl, page);

          const playersList = playersData?.players;
          if (!Array.isArray(playersList)) {
            console.warn(`    ⚠️ No valid players array returned for ${teamName}`);
            continue;
          }

          let teamPlayerCount = 0;
          for (const item of playersList) {
            const p = item?.player;
            if (!p || !p.id) continue;

            let formattedDob = '';
            if (p.dateOfBirthTimestamp) {
              formattedDob = new Date(p.dateOfBirthTimestamp * 1000).toISOString().split('T')[0];
            } else if (p.dateOfBirth) {
              formattedDob = String(p.dateOfBirth);
            }

            const detailedPos = Array.isArray(p.positionsDetailed)
              ? p.positionsDetailed.join(', ')
              : p.positionsDetailed || '';

            const playerRow = [
              p.id,
              p.name || '',
              p.shortName || '',
              p.slug || '',
              p.position || '',
              detailedPos,
              p.jerseyNumber || p.shirtNumber || '',
              p.height || '',
              p.weight || '',
              formattedDob,
              p.preferredFoot || '',
              p.country?.name || '',
              p.proposedMarketValue?.value || p.proposedMarketValueRaw?.value || '',
              teamId,
              teamName,
              league.leagueId,
              league.name
            ];

            allPlayerRows.push(playerRow);
            teamPlayerCount++;
          }

          console.log(`    ✅ Extracted ${teamPlayerCount} players from ${teamName}`);
          totalPlayersCount += teamPlayerCount;
          await delay(DELAY_MS);
        } catch (err: any) {
          console.error(`    ❌ Failed to fetch players for ${teamName}: ${err.message}`);
        }
      }
    }
  } finally {
    await browser.close();
    console.log('\n🔒 Puppeteer session closed.');
  }

  console.log(`\n📊 Total Extracted Players: ${totalPlayersCount} across ${totalTeamsCount} teams.`);

  if (allPlayerRows.length === 0) {
    console.warn('⚠️ No player rows were extracted. Skipping Google Sheet update.');
    return;
  }

  // 3. Save to Google Sheets
  console.log(`\n📝 Writing ${allPlayerRows.length} player rows to Google Sheet tab "${SHEET_NAME}"...`);

  // Clear existing sheet content first
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `'${SHEET_NAME}'!A1:Z`
  });

  // Write headers + data rows
  const values = [headers, ...allPlayerRows];
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `'${SHEET_NAME}'!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values
    }
  });

  console.log(`\n✅ Successfully exported ${allPlayerRows.length} players to Google Sheet "${SHEET_NAME}"!`);
};

exportPlayersToGoogleSheet().catch((err) => {
  console.error('Fatal error exporting players to Google Sheet:', err);
  process.exit(1);
});
