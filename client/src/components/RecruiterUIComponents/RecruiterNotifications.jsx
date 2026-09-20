import React, { useState, useEffect } from 'react';
import {
    BellRing, CheckCheck, Trash2, FileText,
    Calendar, AlertTriangle, Award, ArrowRight, X
} from 'lucide-react';
import { recruiterService } from '../../services/recruiterService';
import './RecruiterNotifications.css';

export default function RecruiterNotifications({ onNavigate }) {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'application' | 'interview'

    const loadNotifications = async () => {
        const notifs = await recruiterService.getNotifications();
        setNotifications(notifs);
    };

    useEffect(() => {
        loadNotifications();

        window.addEventListener('recruiter_notifications_updated', loadNotifications);
        return () => {
            window.removeEventListener('recruiter_notifications_updated', loadNotifications);
        };
    }, []);

    const handleMarkAllRead = async () => {
        await recruiterService.markAllRead();
        loadNotifications();
    };

    const handleClearAll = async () => {
        if (window.confirm('Clear all notifications?')) {
            await recruiterService.clearAllNotifications();
            loadNotifications();
        }
    };

    const handleDeleteSingle = async (id, e) => {
        e.stopPropagation();
        await recruiterService.deleteNotification(id);
        loadNotifications();
    };

    const handleClickNotification = async (notif) => {
        if (notif.unread) {
            await recruiterService.markNotificationRead(notif.id);
        }
        if (notif.actionLink && onNavigate) {
            onNavigate(notif.actionLink);
        }
    };

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return n.unread;
        if (filter === 'application') return n.type === 'application';
        if (filter === 'interview') return n.type === 'interview';
        return true;
    });

    const unreadCount = notifications.filter(n => n.unread).length;

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
                    {filtered.map(notif => (
                        <div
                            key={notif.id}
                            className={`rnotif-card ${notif.unread ? 'unread' : ''}`}
                            onClick={() => handleClickNotification(notif)}
                            style={{ cursor: notif.actionLink ? 'pointer' : 'default' }}
                        >
                            <div className="rnotif-left">
                                <div className={`rnotif-icon-box ${notif.type || 'application'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="rnotif-content">
                                    <h4>
                                        {notif.title}
                                        {notif.unread && <span className="rnotif-unread-dot" />}
                                    </h4>
                                    <p>{notif.message}</p>
                                    <span className="rnotif-time">{notif.time}</span>
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
                                    onClick={(e) => handleDeleteSingle(notif.id, e)}
                                    title="Delete notification"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
