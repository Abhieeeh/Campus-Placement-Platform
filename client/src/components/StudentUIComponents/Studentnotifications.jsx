import React, { useState, useEffect, useMemo } from 'react';
import {
    Bell, BellRing, Check, CheckCheck, Trash2, Eye,
    Building, Calendar, Clock, AlertCircle, Sparkles,
    CheckCircle, Video, Award, Megaphone, X, ArrowRight, ExternalLink
} from 'lucide-react';
import './Studentnotifications.css';

// Initial preloaded notification data covering all requested types
const INITIAL_NOTIFICATIONS = [
    {
        id: 'notif-1',
        type: 'interview', // 'job' | 'shortlist' | 'interview' | 'offer' | 'admin'
        title: 'Technical Interview Scheduled with Google',
        company: 'Google',
        message: 'Your Round 2 Technical Interview for Software Development Engineer (SDE-1) has been scheduled for 24 Sep 2026 at 02:30 PM IST via Google Meet.',
        time: '15 minutes ago',
        timestamp: Date.now() - 15 * 60 * 1000,
        unread: true,
        actionUrl: 'studentinterviews',
        actionText: 'View Interview Details',
        sender: 'Google Campus Hiring Team',
        fullDetails: {
            round: 'Round 2: System Design & Coding',
            date: '24 Sep 2026, 02:30 PM - 03:45 PM',
            platform: 'Google Meet',
            interviewer: 'Sundar / Staff Engineer'
        }
    },
    {
        id: 'notif-2',
        type: 'shortlist',
        title: 'Shortlisted for Microsoft Frontend Internship',
        company: 'Microsoft',
        message: 'Congratulations! Your profile has cleared initial screening and you are shortlisted for the Frontend Engineering Intern drive.',
        time: '2 hours ago',
        timestamp: Date.now() - 2 * 3600 * 1000,
        unread: true,
        actionUrl: 'studentapplications',
        actionText: 'Track Application Status',
        sender: 'Microsoft University Recruiting',
        fullDetails: {
            role: 'Frontend Engineering Intern',
            location: 'Hyderabad, India',
            nextStep: 'Online Coding Assessment scheduled for 28 Sep 2026'
        }
    },
    {
        id: 'notif-3',
        type: 'offer',
        title: '🎉 Selected & Offer Extended at Atlassian!',
        company: 'Atlassian',
        message: 'Congratulations! You have been selected for the Associate Product Manager role at Atlassian with an annual package of ₹26 LPA.',
        time: '1 day ago',
        timestamp: Date.now() - 24 * 3600 * 1000,
        unread: true,
        actionUrl: 'studentapplications',
        actionText: 'View Offer Letter',
        sender: 'Atlassian People & Talent',
        fullDetails: {
            role: 'Associate Product Manager',
            ctc: '₹26 LPA (Full-time)',
            joiningDate: 'July 2027',
            location: 'Bengaluru / Remote Friendly'
        }
    },
    {
        id: 'notif-4',
        type: 'job',
        title: 'Job Post Updated: Amazon SDE Drive Extended',
        company: 'Amazon',
        message: 'Amazon has updated the job description and extended the registration deadline for Backend Developer (Go / Node.js) to 02 Oct 2026.',
        time: '2 days ago',
        timestamp: Date.now() - 48 * 3600 * 1000,
        unread: false,
        actionUrl: 'studentjobs',
        actionText: 'View Job Posting',
        sender: 'Amazon Campus Recruiting',
        fullDetails: {
            role: 'Backend Developer (Go / Node.js)',
            updatedCriteria: 'Eligible Branches updated to include AI/DS and CSE',
            newDeadline: '02 Oct 2026'
        }
    },
    {
        id: 'notif-5',
        type: 'admin',
        title: 'Placement Cell Announcement: Resume Review Drive',
        company: 'Campus Placement Cell',
        message: 'Mandatory briefing and 1-on-1 resume verification session tomorrow at 10:00 AM in the Central Auditorium for 2027/2028 batch students.',
        time: '3 days ago',
        timestamp: Date.now() - 72 * 3600 * 1000,
        unread: false,
        actionUrl: 'studentprofile',
        actionText: 'Update Resume in Profile',
        sender: 'Head of Placements / Admin Cell',
        fullDetails: {
            topic: 'Pre-placement talk & resume formatting guidelines',
            venue: 'Auditorium Hall B',
            time: '10:00 AM - 12:30 PM'
        }
    }
];

export default function Studentnotifications({ onNavigate }) {
    // Load from localStorage or defaults
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('student_notifications');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                // fallback
            }
        }
        return INITIAL_NOTIFICATIONS;
    });

    // Active filter ('all' | 'unread')
    const [activeFilter, setActiveFilter] = useState('all');

    // Modal state for View Details
    const [selectedNotif, setSelectedNotif] = useState(null);

    // Save and broadcast updates
    const persistNotifications = (updatedList) => {
        setNotifications(updatedList);
        localStorage.setItem('student_notifications', JSON.stringify(updatedList));
        window.dispatchEvent(new Event('student_notifications_updated'));
    };

    // Mark single notification as read
    const markAsRead = (id) => {
        const updated = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
        persistNotifications(updated);
    };

    // Mark all as read
    const handleMarkAllRead = () => {
        const updated = notifications.map(n => ({ ...n, unread: false }));
        persistNotifications(updated);
    };

    // Delete single notification
    const handleDeleteNotif = (id, e) => {
        e?.stopPropagation();
        const updated = notifications.filter(n => n.id !== id);
        persistNotifications(updated);
        if (selectedNotif?.id === id) setSelectedNotif(null);
    };

    // Clear all notifications
    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            persistNotifications([]);
        }
    };

    // Open view details modal
    const handleViewDetails = (notif) => {
        markAsRead(notif.id);
        setSelectedNotif(notif);
    };

    // Unread count
    const unreadCount = useMemo(() => {
        return notifications.filter(n => n.unread).length;
    }, [notifications]);

    // Filtered notifications
    const filteredNotifications = useMemo(() => {
        if (activeFilter === 'unread') {
            return notifications.filter(n => n.unread);
        }
        return notifications;
    }, [notifications, activeFilter]);

    // Helper for icons
    const getNotifIcon = (type) => {
        switch (type) {
            case 'job': return <Building size={20} />;
            case 'shortlist': return <CheckCircle size={20} />;
            case 'interview': return <Video size={20} />;
            case 'offer': return <Award size={20} />;
            case 'admin': return <Megaphone size={20} />;
            default: return <Bell size={20} />;
        }
    };

    return (
        <div className="notifs-container">
            {/* ── 1. Hero Header ─────────────────────────────────────────────── */}
            <section className="notifs-header">
                <div className="notifs-header-top">
                    <h1>
                        <BellRing size={28} color="#f87171" />
                        Placement Alerts & Notifications
                    </h1>
                    <p>Stay informed with instant alerts regarding recruiter job updates, shortlist results, interview invitations, and admin announcements.</p>
                </div>
            </section>

            {/* ── 2. Filter Toolbar & Bulk Actions ──────────────────────────── */}
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
                {filteredNotifications.length === 0 ? (
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
                            key={notif.id}
                            className={`notif-item-card ${notif.unread ? 'unread' : ''}`}
                            onClick={() => handleViewDetails(notif)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="notif-content-area">
                                {/* Icon box */}
                                <div className={`notif-icon-box ${notif.type}`}>
                                    {getNotifIcon(notif.type)}
                                </div>

                                {/* Text Details */}
                                <div className="notif-details">
                                    <div className="notif-title-row">
                                        <h4>{notif.title}</h4>
                                        {notif.unread && <span className="unread-dot" title="Unread notification" />}
                                        <span className={`notif-tag ${notif.type}`}>
                                            {notif.type}
                                        </span>
                                    </div>
                                    <p className="notif-message-text">{notif.message}</p>
                                    <span className="notif-time-text">
                                        <Clock size={13} /> {notif.time} • From: {notif.sender}
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
                                    onClick={(e) => handleDeleteNotif(notif.id, e)}
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
                                <div className={`notif-icon-box ${selectedNotif.type}`} style={{ width: 50, height: 50 }}>
                                    {getNotifIcon(selectedNotif.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3>{selectedNotif.title}</h3>
                                    <p>{selectedNotif.sender} • {selectedNotif.time}</p>
                                </div>
                                <span className={`notif-tag ${selectedNotif.type}`}>
                                    {selectedNotif.type}
                                </span>
                            </div>

                            {/* Full Message */}
                            <div>
                                <h4 className="modal-section-title">Message</h4>
                                <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                    {selectedNotif.message}
                                </p>
                            </div>

                            {/* Dynamic context details */}
                            {selectedNotif.fullDetails && (
                                <div>
                                    <h4 className="modal-section-title">Details & Specifications</h4>
                                    <div className="modal-info-grid">
                                        {Object.entries(selectedNotif.fullDetails).map(([k, v], idx) => (
                                            <div key={idx} className="modal-info-card">
                                                <span>{k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                                <strong>{v}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer-custom" style={{ justifyContent: 'space-between' }}>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                onClick={() => handleDeleteNotif(selectedNotif.id)}
                            >
                                <Trash2 size={15} /> Delete Notification
                            </button>

                            <div style={{ display: 'flex', gap: '0.65rem' }}>
                                <button className="btn-secondary" onClick={() => setSelectedNotif(null)}>
                                    Close
                                </button>
                                {selectedNotif.actionUrl && onNavigate && (
                                    <button
                                        className="btn-primary"
                                        onClick={() => {
                                            setSelectedNotif(null);
                                            onNavigate(selectedNotif.actionUrl);
                                        }}
                                    >
                                        {selectedNotif.actionText} <ArrowRight size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}