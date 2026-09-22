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

// Mark all as read
router.post('/mark-all-read', markAllAsRead);
router.put('/read-all', markAllAsRead);            // legacy alias

// Clear all
router.delete('/clear-all', clearAllNotifications);

// Single notification actions
router.patch('/:id/read', markSingleAsRead);       // used by Studentnotifications
router.put('/:id/read', markSingleAsRead);         // legacy alias
router.delete('/:id', deleteNotification);

export default router;
