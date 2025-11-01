import express from 'express';
import { details, substitution } from '../controllers/manager';
const router = express.Router();

router.post("/manager/sub", substitution);
router.get("/manager", details)



export default router;