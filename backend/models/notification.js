import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null   // null for system/broadcast notifications
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null   // null for broadcast-to-all notifications
    },
    senderRole: {
        type: String,
        default: 'system'
    },
    receiverRole: {
        type: String,
        default: 'student'
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'job', 'application', 'shortlist', 'interview', 'offer', 'admin'],
        default: 'general'
    },
    seen: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

notificationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
