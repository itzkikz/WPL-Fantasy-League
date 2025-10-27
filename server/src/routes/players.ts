import express from 'express';
import { getPlayerStats } from '../controllers/players';
const router = express.Router();

router.get("/players/:playerName", getPlayerStats);



export default router;