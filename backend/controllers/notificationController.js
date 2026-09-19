import { INITIAL_NOTIFICATIONS } from '../data/mockData.js';

let notifications = [...INITIAL_NOTIFICATIONS];

export const getNotifications = (req, res) => {
    try {
        const { unreadOnly } = req.query;
        let filtered = [...notifications];

        if (unreadOnly === 'true') {
            filtered = filtered.filter(n => n.unread);
        }

        res.status(200).json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

export const markAllAsRead = (req, res) => {
    try {
        notifications = notifications.map(n => ({ ...n, unread: false }));
        res.status(200).json({ message: 'All notifications marked as read', notifications });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update notifications', error: error.message });
    }
};

export const deleteNotification = (req, res) => {
    try {
        const { id } = req.params;
        notifications = notifications.filter(n => n.id !== id);
        res.status(200).json({ message: 'Notification deleted', id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
};

export const clearAllNotifications = (req, res) => {
    try {
        notifications = [];
        res.status(200).json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to clear notifications', error: error.message });
    }
};

export const sendNotification = (req, res) => {
    try {
        const newNotif = {
            id: `NOTIF-${Date.now()}`,
            time: 'Just now',
            timestamp: Date.now(),
            unread: true,
            ...req.body
        };
        notifications.unshift(newNotif);
        res.status(201).json(newNotif);
    } catch (error) {
        res.status(500).json({ message: 'Failed to send notification', error: error.message });
    }
};
