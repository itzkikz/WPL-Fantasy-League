import { Router } from 'express';
import { getFixtures } from '../controllers/footballApi';

const router = Router();

router.get('/fixtures/fetch', getFixtures);

export default router;
