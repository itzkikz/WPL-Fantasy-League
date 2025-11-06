import express from 'express';
import { subscribe, send } from '../controllers/notification';
const router = express.Router();

router.post("/notify/subscribe", subscribe);
router.post("/notify/send", send)



export default router;