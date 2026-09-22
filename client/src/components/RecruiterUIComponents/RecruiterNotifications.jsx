import React, { useState, useEffect } from 'react';
import {
    BellRing, CheckCheck, Trash2, FileText,
    Calendar, AlertTriangle, Award, ArrowRight, X
} from 'lucide-react';
import './RecruiterNotifications.css';
import { authFetch } from '../../utils/api';
import { getSocket } from '../../utils/socket';

export default function RecruiterNotifications({ user, onNavigate }) {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'application' | 'interview'

    const loadNotifications = async () => {
        try {
            const query = user?._id ? `?userId=${user._id}` : '';
            const res = await authFetch(`http://localhost:5000/api/notifications${query}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Failed to load recruiter notifications:', e);
        }
    };

    useEffect(() => {
        loadNotifications();

        window.addEventListener('recruiter_notifications_updated', loadNotifications);
        return () => {
            window.removeEventListener('recruiter_notifications_updated', loadNotifications);
        };
    }, [user?._id]);

    // Real-time socket listener
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        const handleNew = (notif) => {
            setNotifications(prev => [{ ...notif, seen: false }, ...prev]);
        };
        socket.on('new_notification', handleNew);
        return () => socket.off('new_notification', handleNew);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await authFetch('http://localhost:5000/api/notifications/mark-all-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?._id || user?.id })
            });
            setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
            window.dispatchEvent(new Event('recruiter_notifications_updated'));
        } catch (e) {
            console.error('Failed to mark all read:', e);
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('Clear all notifications?')) {
            try {
                await authFetch('http://localhost:5000/api/notifications/clear-all', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user?._id || user?.id })
                });
                setNotifications([]);
                window.dispatchEvent(new Event('recruiter_notifications_updated'));
            } catch (e) {
                console.error('Failed to clear notifications:', e);
            }
        }
    };

    const handleDeleteSingle = async (id, e) => {
        e.stopPropagation();
        try {
            await authFetch(`http://localhost:5000/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => (n._id || n.id) !== id));
            window.dispatchEvent(new Event('recruiter_notifications_updated'));
        } catch (e) {
            console.error('Failed to delete notification:', e);
        }
    };

    const handleClickNotification = async (notif) => {
        const notifId = notif._id || notif.id;
        // Use !notif.seen (DB field) – notif.unread is the old localStorage field
        if (!notif.seen) {
            try {
                await authFetch(`http://localhost:5000/api/notifications/${notifId}/read`, { method: 'PATCH' });
                setNotifications(prev =>
                    prev.map(n => (n._id || n.id) === notifId ? { ...n, seen: true } : n)
                );
                window.dispatchEvent(new Event('recruiter_notifications_updated'));
            } catch (e) { /* ignore */ }
        }
        if (notif.actionLink && onNavigate) {
            onNavigate(notif.actionLink);
        }
    };

    const filtered = notifications.filter(n => {
        const isUnread = !n.seen || n.unread;
        if (filter === 'unread') return isUnread;
        if (filter === 'application') return n.type === 'application';
        if (filter === 'interview') return n.type === 'interview';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.seen || n.unread).length;

    const getIcon = (type) => {
        switch (type) {
            case 'application': return <FileText size={18} />;
            case 'interview': return <Calendar size={18} />;
            case 'deadline': return <AlertTriangle size={18} />;
            case 'selection': return <Award size={18} />;
            default: return <BellRing size={18} />;
        }
    };

    return (
        <div className="rnotif-container">
            {/* Control Bar */}
            <div className="rnotif-top-bar">
                <div className="rnotif-filters">
                    <button
                        className={`rnotif-filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        className={`rnotif-filter-btn ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        className={`rnotif-filter-btn ${filter === 'application' ? 'active' : ''}`}
                        onClick={() => setFilter('application')}
                    >
                        Applications
                    </button>
                    <button
                        className={`rnotif-filter-btn ${filter === 'interview' ? 'active' : ''}`}
                        onClick={() => setFilter('interview')}
                    >
                        Interviews
                    </button>
                </div>

                <div className="rnotif-actions">
                    <button className="rnotif-btn-sec" onClick={handleMarkAllRead}>
                        <CheckCheck size={14} /> Mark All Read
                    </button>
                    <button className="rnotif-btn-sec" onClick={handleClearAll}>
                        <Trash2 size={14} /> Clear All
                    </button>
                </div>
            </div>

            {/* Notification Cards */}
            {filtered.length === 0 ? (
                <div style={{ background: '#fff', padding: '3.5rem', borderRadius: '14px', textAlign: 'center', color: '#64748b' }}>
                    No notifications in this view.
                </div>
            ) : (
                <div className="rnotif-list">
                    {filtered.map(notif => {
                        const notifId = notif._id || notif.id;
                        const isUnread = !notif.seen && notif.unread !== false;
                        return (
                            <div
                                key={notifId}
                                className={`rnotif-card ${isUnread ? 'unread' : ''}`}
                                onClick={() => handleClickNotification(notif)}
                                style={{ cursor: notif.actionLink ? 'pointer' : 'default' }}
                            >
                                <div className="rnotif-left">
                                    <div className={`rnotif-icon-box ${notif.type || 'application'}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="rnotif-content">
                                        <h4>
                                            {notif.title || notif.message}
                                            {isUnread && <span className="rnotif-unread-dot" />}
                                        </h4>
                                        <p>{notif.message}</p>
                                        <span className="rnotif-time">{notif.time || new Date(notif.timestamp || notif.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="rnotif-right">
                                    {notif.actionLink && (
                                        <button
                                            className="rnotif-goto-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClickNotification(notif);
                                            }}
                                        >
                                            View <ArrowRight size={12} />
                                        </button>
                                    )}
                                    <button
                                        className="rnotif-del-btn"
                                        onClick={(e) => handleDeleteSingle(notifId, e)}
                                        title="Delete notification"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
