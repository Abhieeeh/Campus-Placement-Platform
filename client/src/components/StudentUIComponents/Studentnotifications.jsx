import React, { useState, useEffect, useMemo } from 'react';
import {
    Bell, BellRing, Check, CheckCheck, Trash2, Eye,
    Building, Calendar, Clock, AlertCircle, Sparkles,
    CheckCircle, Video, Award, Megaphone, X, ArrowRight
} from 'lucide-react';
import './Studentnotifications.css';
import { authFetch } from '../../utils/api';
import { getSocket } from '../../utils/socket';

export default function Studentnotifications({ user, onNavigate }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedNotif, setSelectedNotif] = useState(null);

    // Resolve userId from the user object (supports _id, id fields)
    const userId = user?._id || user?.id;

    // ── Fetch from DB ────────────────────────────────────────────────────────
    const loadNotifications = async () => {
        try {
            if (!userId) return;
            const res = await authFetch(
                `http://localhost:5000/api/notifications?userId=${userId}`
            );
            if (res.ok) {
                const data = await res.json();
                setNotifications(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('[Notifications] Failed to load:', e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [userId]);

    // ── Real-time socket listener ─────────────────────────────────────────────
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleNew = (notif) => {
            // Prepend incoming socket notification
            setNotifications(prev => [{ ...notif, seen: false }, ...prev]);
            // Dispatch event so StudentUI badge updates
            window.dispatchEvent(new Event('student_notifications_updated'));
        };
        socket.on('new_notification', handleNew);
        return () => socket.off('new_notification', handleNew);
    }, []);

    // ── Actions ──────────────────────────────────────────────────────────────
    const markAsRead = async (notifId) => {
        try {
            await authFetch(`http://localhost:5000/api/notifications/${notifId}/read`, {
                method: 'PATCH'
            });
            setNotifications(prev =>
                prev.map(n => n._id === notifId ? { ...n, seen: true } : n)
            );
            window.dispatchEvent(new Event('student_notifications_updated'));
        } catch (e) {
            console.error('Failed to mark as read:', e);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await authFetch('http://localhost:5000/api/notifications/mark-all-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
            window.dispatchEvent(new Event('student_notifications_updated'));
        } catch (e) {
            console.error('Failed to mark all read:', e);
        }
    };

    const handleDeleteNotif = async (notifId, e) => {
        e?.stopPropagation();
        try {
            await authFetch(`http://localhost:5000/api/notifications/${notifId}`, {
                method: 'DELETE'
            });
            setNotifications(prev => prev.filter(n => n._id !== notifId));
            if (selectedNotif?._id === notifId) setSelectedNotif(null);
            window.dispatchEvent(new Event('student_notifications_updated'));
        } catch (e) {
            console.error('Failed to delete notification:', e);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to clear all notifications?')) return;
        try {
            await authFetch('http://localhost:5000/api/notifications/clear-all', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            setNotifications([]);
            window.dispatchEvent(new Event('student_notifications_updated'));
        } catch (e) {
            console.error('Failed to clear all:', e);
        }
    };

    const handleViewDetails = (notif) => {
        if (!notif.seen) markAsRead(notif._id);
        setSelectedNotif(notif);
    };

    // ── Derived values ───────────────────────────────────────────────────────
    const unreadCount = useMemo(() => notifications.filter(n => !n.seen).length, [notifications]);

    const filteredNotifications = useMemo(() => {
        if (activeFilter === 'unread') return notifications.filter(n => !n.seen);
        return notifications;
    }, [notifications, activeFilter]);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const getNotifIcon = (type) => {
        switch (type) {
            case 'job': return <Building size={20} />;
            case 'shortlist': return <CheckCircle size={20} />;
            case 'interview': return <Video size={20} />;
            case 'offer': return <Award size={20} />;
            case 'admin': return <Megaphone size={20} />;
            case 'application': return <Bell size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
        const days = Math.floor(hrs / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="notifs-container">
            {/* ── 1. Hero Header ─────────────────────────────────────────────── */}
            <section className="notifs-header">
                <div className="notifs-header-top">
                    <h1>
                        <BellRing size={28} color="#f87171" />
                        Placement Alerts &amp; Notifications
                    </h1>
                    <p>Stay informed with instant alerts regarding recruiter job updates, shortlist results, interview invitations, and admin announcements.</p>
                </div>
            </section>

            {/* ── 2. Filter Toolbar &amp; Bulk Actions ──────────────────────────── */}
            <div className="notifs-toolbar">
                <div className="notifs-tabs">
                    <button
                        className={`notif-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All Notifications
                        <span className="tab-count">{notifications.length}</span>
                    </button>
                    <button
                        className={`notif-tab-btn ${activeFilter === 'unread' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('unread')}
                    >
                        Unread
                        <span className="tab-count">{unreadCount}</span>
                    </button>
                </div>

                <div className="notifs-bulk-actions">
                    {unreadCount > 0 && (
                        <button className="btn-toolbar-action" onClick={handleMarkAllRead}>
                            <CheckCheck size={14} /> Mark All as Read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button className="btn-toolbar-action danger" onClick={handleClearAll}>
                            <Trash2 size={14} /> Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* ── 3. Notifications List ─────────────────────────────────────── */}
            <div className="notifs-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: 16 }}>
                        <p style={{ color: '#64748b' }}>Loading notifications…</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
                        <AlertCircle size={40} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>No notifications to display</h3>
                        <p style={{ margin: '0.35rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            {activeFilter === 'unread' ? 'You have read all notifications!' : 'You have no active alerts at the moment.'}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`notif-item-card ${!notif.seen ? 'unread' : ''}`}
                            onClick={() => handleViewDetails(notif)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="notif-content-area">
                                {/* Icon box */}
                                <div className={`notif-icon-box ${notif.type || 'general'}`}>
                                    {getNotifIcon(notif.type)}
                                </div>

                                {/* Text Details */}
                                <div className="notif-details">
                                    <div className="notif-title-row">
                                        <h4>{notif.message}</h4>
                                        {!notif.seen && <span className="unread-dot" title="Unread notification" />}
                                        <span className={`notif-tag ${notif.type || 'general'}`}>
                                            {notif.type || 'general'}
                                        </span>
                                    </div>
                                    <span className="notif-time-text">
                                        <Clock size={13} /> {formatTime(notif.timestamp || notif.createdAt)} • From: {notif.senderRole || 'system'}
                                    </span>
                                </div>
                            </div>

                            {/* Actions on Item */}
                            <div className="notif-actions-group" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className="btn-notif-view"
                                    onClick={() => handleViewDetails(notif)}
                                >
                                    <Eye size={14} /> View Details
                                </button>
                                <button
                                    className="btn-notif-delete"
                                    title="Delete notification"
                                    onClick={(e) => handleDeleteNotif(notif._id, e)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── 4. Notification Details Modal ─────────────────────────────── */}
            {selectedNotif && (
                <div className="modal-backdrop" onClick={() => setSelectedNotif(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h2>Notification Details</h2>
                            <button className="modal-close-icon-btn" onClick={() => setSelectedNotif(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-scrollable-body">
                            {/* Header Banner */}
                            <div className="modal-company-hero">
                                <div className={`notif-icon-box ${selectedNotif.type || 'general'}`} style={{ width: 50, height: 50 }}>
                                    {getNotifIcon(selectedNotif.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3>{selectedNotif.type ? selectedNotif.type.toUpperCase() : 'Notification'}</h3>
                                    <p>{selectedNotif.senderRole || 'System'} • {formatTime(selectedNotif.timestamp || selectedNotif.createdAt)}</p>
                                </div>
                                <span className={`notif-tag ${selectedNotif.type || 'general'}`}>
                                    {selectedNotif.type || 'general'}
                                </span>
                            </div>

                            {/* Full Message */}
                            <div>
                                <h4 className="modal-section-title">Message</h4>
                                <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                    {selectedNotif.message}
                                </p>
                            </div>
                        </div>

                        <div className="modal-footer-custom" style={{ justifyContent: 'space-between' }}>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                onClick={() => handleDeleteNotif(selectedNotif._id)}
                            >
                                <Trash2 size={15} /> Delete Notification
                            </button>

                            <div style={{ display: 'flex', gap: '0.65rem' }}>
                                <button className="btn-secondary" onClick={() => setSelectedNotif(null)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}