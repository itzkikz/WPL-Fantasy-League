import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const DATA_DIR = path.resolve(__dirname, '../data/sofascore');

/**
 * Reads a cached JSON file. Returns parsed data or null.
 */
const readCachedJSON = (filename: string) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

/**
 * Finds a file that ends with a specific string if seasonId isn't known.
 */
const findFileBySuffix = (suffix: string) => {
    if (!fs.existsSync(DATA_DIR)) return null;
    const files = fs.readdirSync(DATA_DIR);
    const matchedFile = files.find(f => f.endsWith(suffix));
    if (!matchedFile) return null;
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, matchedFile), 'utf-8'));
};

// 1. Get rounds for a season
router.get('/rounds/:seasonId', (req, res) => {
    const { seasonId } = req.params;
    const data = readCachedJSON(`${seasonId}_rounds.json`);
    if (!data) return res.status(404).json({ error: 'Rounds data not available yet. Sync may not have run.' });
    res.json({ success: true, ...data });
});

// 2. Get events for a specific round in a season
router.get('/events/:seasonId/round/:round', (req, res) => {
    const { seasonId, round } = req.params;
    const data = readCachedJSON(`${seasonId}_events_round_${round}.json`);
    if (!data) return res.status(404).json({ error: `Events for round ${round} not available.` });
    res.json({ success: true, ...data });
});

// 3. Get incidents for a specific match
router.get('/event/:matchId/incidents', (req, res) => {
    const { matchId } = req.params;
    const data = findFileBySuffix(`_match_${matchId}_incidents.json`);
    if (!data) return res.status(404).json({ error: `Incidents for match ${matchId} not available.` });
    res.json({ success: true, ...data });
});

// 4. Get lineups for a specific match
router.get('/event/:matchId/lineups', (req, res) => {
    const { matchId } = req.params;
    const data = findFileBySuffix(`_match_${matchId}_lineups.json`);
    if (!data) return res.status(404).json({ error: `Lineups for match ${matchId} not available.` });
    res.json({ success: true, ...data });
});

// 5. Get best players summary for a specific match
router.get('/event/:matchId/best-players', (req, res) => {
    const { matchId } = req.params;
    const data = findFileBySuffix(`_match_${matchId}_best_players.json`);
    if (!data) return res.status(404).json({ error: `Best players for match ${matchId} not available.` });
    res.json({ success: true, ...data });
});

// 6. Get overall standings for a season
router.get('/standings/:seasonId', (req, res) => {
    const { seasonId } = req.params;
    const data = readCachedJSON(`${seasonId}_standings.json`);
    if (!data) return res.status(404).json({ error: 'Standings data not available yet.' });
    res.json({ success: true, ...data });
});

// 7. Get players for a specific team
router.get('/team/:teamId/players', (req, res) => {
    const { teamId } = req.params;
    // We don't have seasonId in the route, so we find the matching file regardless of season
    const data = findFileBySuffix(`_team_${teamId}_players.json`);
    if (!data) return res.status(404).json({ error: `Players for team ${teamId} not available.` });
    res.json({ success: true, ...data });
});

export default router;
