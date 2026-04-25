import express from 'express';
import { fetchSofascoreJSON } from '../utils/sofascoreScraper';

const router = express.Router();

// 1. Get rounds for a season
router.get('/rounds/:seasonId', async (req, res) => {
    const { seasonId } = req.params;
    const url = `https://api.sofascore.com/api/v1/unique-tournament/17/season/${seasonId}/rounds`;

    try {
        const data = await fetchSofascoreJSON(url);
        if (!data) return res.status(500).json({ error: "Failed to parse data" });
        res.json({ success: true, ...data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Get events for a specific round in a season
router.get('/events/:seasonId/round/:round', async (req, res) => {
    const { seasonId, round } = req.params;
    const url = `https://api.sofascore.com/api/v1/unique-tournament/17/season/${seasonId}/events/round/${round}`;

    try {
        const data = await fetchSofascoreJSON(url);
        if (!data) return res.status(500).json({ error: "Failed to parse data" });
        res.json({ success: true, ...data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Get incidents for a specific match
router.get('/event/:matchId/incidents', async (req, res) => {
    const { matchId } = req.params;
    const url = `https://api.sofascore.com/api/v1/event/${matchId}/incidents`;

    try {
        const data = await fetchSofascoreJSON(url);
        if (!data) return res.status(500).json({ error: "Failed to parse data" });
        res.json({ success: true, ...data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Get lineups for a specific match
router.get('/event/:matchId/lineups', async (req, res) => {
    const { matchId } = req.params;
    const url = `https://api.sofascore.com/api/v1/event/${matchId}/lineups`;

    try {
        const data = await fetchSofascoreJSON(url);
        if (!data) return res.status(500).json({ error: "Failed to parse data" });
        res.json({ success: true, ...data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Get best players summary for a specific match
router.get('/event/:matchId/best-players', async (req, res) => {
    const { matchId } = req.params;
    const url = `https://api.sofascore.com/api/v1/event/${matchId}/best-players/summary`;

    try {
        const data = await fetchSofascoreJSON(url);
        if (!data) return res.status(500).json({ error: "Failed to parse data" });
        res.json({ success: true, ...data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. Get overall standings for a season
router.get('/standings/:seasonId', async (req, res) => {
    const { seasonId } = req.params;
    const url = `https://api.sofascore.com/api/v1/unique-tournament/17/season/${seasonId}/standings/total`;

    try {
        const data = await fetchSofascoreJSON(url);
        if (!data) return res.status(500).json({ error: "Failed to parse data" });
        res.json({ success: true, ...data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. Get players for a specific team
router.get('/team/:teamId/players', async (req, res) => {
    const { teamId } = req.params;
    const url = `https://api.sofascore.com/api/v1/team/${teamId}/players`;

    try {
        const data = await fetchSofascoreJSON(url);
        if (!data) return res.status(500).json({ error: "Failed to parse data" });
        res.json({ success: true, ...data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
