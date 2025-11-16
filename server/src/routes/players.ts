import express from 'express';
import { getFullPlayerStats, getPlayerStats } from '../controllers/players';
const router = express.Router();


router.get("/players", getFullPlayerStats);

router.get("/players/:playerName", getPlayerStats);



export default router;