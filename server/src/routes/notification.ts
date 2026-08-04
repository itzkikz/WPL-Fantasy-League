import express from 'express';
import { subscribe, send, notifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notification';
const router = express.Router();

router.get("/notify/notifications", notifications);
router.post("/notify/subscribe", subscribe);
router.post("/notify/send", send);

router.patch("/notify/notifications/:id/read", markAsRead);
router.post("/notify/notifications/read-all", markAllAsRead);
router.delete("/notify/notifications/:id", deleteNotification);

export default router;