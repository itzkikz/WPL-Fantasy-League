import { Router } from 'express';
import { SheetController } from '../controllers/sheetController';

const router = Router();

router.post('/sheet/update-players-latest', SheetController.updatePlayersLatest);
router.get('/sheet/update-players-latest', SheetController.updatePlayersLatest); // Allowing GET for easy manual testing

router.post('/sheet/update-match-stats', SheetController.updateMatchPlayerStats);
router.get('/sheet/update-match-stats', SheetController.updateMatchPlayerStats);

router.post('/sheet/update-match-events', SheetController.updateMatchEvents);
router.get('/sheet/update-match-events', SheetController.updateMatchEvents);

export default router;
