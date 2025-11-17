import express from 'express';
import { subscribe, send, notifications } from '../controllers/notification';
const router = express.Router();

router.get("/notify/notifications", notifications);
router.post("/notify/subscribe", subscribe);
router.post("/notify/send", send)



export default router;