import express from 'express';
import { details, substitution, dashboard } from '../controllers/manager';
const router = express.Router();

router.post("/manager/sub", substitution);
router.get("/manager", details);
router.get("/manager/dashboard", dashboard);

export default router;