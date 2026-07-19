import express from 'express';
import { getFullPlayerStats, getFilters } from '../controllers/players';
const router = express.Router();



router.get("/players/filters", getFilters as any);

router.get("/players", getFullPlayerStats);



export default router;