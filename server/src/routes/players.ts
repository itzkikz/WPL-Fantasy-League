import express from 'express';
import { getFullPlayerStats, getPlayerStats, getFilters } from '../controllers/players';
const router = express.Router();



router.get("/players/filters", getFilters as any);

router.get("/players", getFullPlayerStats);

router.get("/players/:playerName", getPlayerStats);



export default router;