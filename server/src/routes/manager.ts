import express from 'express';
import { details, substitution, dashboard, myFixtures, getPublicFacts } from '../controllers/manager';
const router = express.Router();

router.post("/manager/sub", substitution);
router.get("/manager", details);
router.get("/manager/dashboard", dashboard);
router.get("/manager/my-fixtures", myFixtures);
router.get("/manager/facts", getPublicFacts);

export default router;