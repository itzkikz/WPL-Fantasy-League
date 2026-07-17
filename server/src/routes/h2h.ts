import express from 'express';
import { getMyH2HLeagues, getH2HStandings, getH2HLeagueFixturesPublic } from '../controllers/h2h';

const router = express.Router();

router.get('/h2h/leagues', getMyH2HLeagues);
router.get('/h2h/leagues/:id/standings', getH2HStandings);
router.get('/h2h/leagues/:id/fixtures', getH2HLeagueFixturesPublic);

export default router;
