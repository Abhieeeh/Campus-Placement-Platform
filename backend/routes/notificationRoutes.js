import express from 'express';
import {
    getNotifications,
    markAllAsRead,
    markSingleAsRead,
    deleteNotification,
    clearAllNotifications,
    sendNotification
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.post('/', sendNotification);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markSingleAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

export default router;
