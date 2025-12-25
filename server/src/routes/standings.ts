import express from 'express';
import { getStandings, getTeamDetails } from '../controllers/standings';
const router = express.Router();

router.get("/standings", getStandings);

router.get("/standings/:teamId/:gameWeek", getTeamDetails);



export default router;