
import express from 'express';
import { SyncController } from '../controllers/syncController';

const router = express.Router();

router.get('/gw-data', SyncController.syncGameWeekData);

export default router;
