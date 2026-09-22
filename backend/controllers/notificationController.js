import mongoose from 'mongoose';
import Notification from '../models/notification.js';
import { getIO } from '../socket.js';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Emit a notification payload to the receiver's private socket room */
function emitToReceiver(notification) {
    try {
        const io = getIO();
        io.to(`user:${notification.receiverId}`).emit('new_notification', {
            _id: notification._id,
            senderId: notification.senderId,
            receiverId: notification.receiverId,
            senderRole: notification.senderRole,
            receiverRole: notification.receiverRole,
            message: notification.message,
            type: notification.type,
            seen: notification.seen,
            timestamp: notification.timestamp || notification.createdAt
        });
    } catch (err) {
        // Socket not available in tests / during startup – non-fatal
        console.warn('[Socket] Could not emit notification:', err.message);
    }
}

// ─── controllers ────────────────────────────────────────────────────────────

export const getNotifications = async (req, res) => {
    try {
        const { unreadOnly, userId } = req.query;
        let query = {};
        if (userId) {
            if (mongoose.Types.ObjectId.isValid(userId)) {
                query.receiverId = userId;
            } else {
                return res.status(200).json([]);
            }
        }
        if (unreadOnly === 'true') {
            query.seen = false;
        }

        const notifications = await Notification.find(query).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.body || req.query;
        let query = {};
        if (userId) {
            if (mongoose.Types.ObjectId.isValid(userId)) {
                query.receiverId = userId;
            } else {
                return res.status(200).json({ message: 'All notifications marked as read', notifications: [] });
            }
        }

        await Notification.updateMany(query, { $set: { seen: true } });
        const updated = await Notification.find(query).sort({ createdAt: -1 });
        res.status(200).json({ message: 'All notifications marked as read', notifications: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update notifications', error: error.message });
    }
};

export const markSingleAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Notification.findByIdAndUpdate(id, { $set: { seen: true } }, { new: true });
        res.status(200).json({ message: 'Notification marked as read', id, notification: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update notification', error: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.status(200).json({ message: 'Notification deleted', id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
};

export const clearAllNotifications = async (req, res) => {
    try {
        const { userId } = req.body || req.query;
        let query = {};
        if (userId) {
            if (mongoose.Types.ObjectId.isValid(userId)) {
                query.receiverId = userId;
            } else {
                return res.status(200).json({ message: 'All notifications cleared' });
            }
        }

        await Notification.deleteMany(query);
        res.status(200).json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to clear notifications', error: error.message });
    }
};

export const sendNotification = async (req, res) => {
    try {
        const { senderId, receiverId, senderRole, receiverRole, message, type } = req.body;
        const actualSenderId = req.user?.userId || senderId;
        const actualSenderRole = req.user?.role || senderRole || 'system';

        const newNotif = await Notification.create({
            senderId: actualSenderId,
            receiverId,
            senderRole: actualSenderRole,
            receiverRole: receiverRole || 'user',
            message,
            type: type || 'general',
            seen: false,
            timestamp: new Date()
        });

        emitToReceiver(newNotif);
        res.status(201).json(newNotif);
    } catch (error) {
        res.status(500).json({ message: 'Failed to send notification', error: error.message });
    }
};

/**
 * Internal helper used by other controllers (no HTTP req/res).
 * Creates the DB record and pushes it over Socket.IO.
 */
export async function createAndEmitNotification({
    senderId, receiverId, senderRole, receiverRole, message, type, broadcastToStudents = false
}) {
    try {
        const notif = await Notification.create({
            senderId: senderId || null,
            receiverId: receiverId || null,
            senderRole: senderRole || 'system',
            receiverRole: receiverRole || 'student',
            message,
            type: type || 'general',
            seen: false,
            timestamp: new Date()
        });

        if (broadcastToStudents) {
            // Emit to every connected student (shared "students" room)
            try {
                const io = getIO();
                io.to('students').emit('new_notification', {
                    _id: notif._id,
                    senderId: notif.senderId,
                    receiverId: notif.receiverId,
                    senderRole: notif.senderRole,
                    receiverRole: notif.receiverRole,
                    message: notif.message,
                    type: notif.type,
                    seen: notif.seen,
                    timestamp: notif.timestamp || notif.createdAt
                });
            } catch (err) {
                console.warn('[Socket] Could not broadcast:', err.message);
            }
        } else {
            emitToReceiver(notif);
        }

        return notif;
    } catch (err) {
        console.error('[Notification] Failed to create notification:', err.message);
        return null;
    }
}
