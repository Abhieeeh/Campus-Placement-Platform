import React, { useState, useRef, useEffect } from 'react';
import {
    GraduationCap, Bell, ChevronDown, LayoutDashboard,
    User, Briefcase, FileText, Calendar, BellRing, LogOut, Menu, X,
} from 'lucide-react';
import './StudentUI.css';
import Studentdashboard from './StudentUIComponents/Studentdashboard';
import Studentprofile from './StudentUIComponents/Studentprofile';
import Studentjobs from './StudentUIComponents/Studentjobs';
import Studentapplication from './StudentUIComponents/Studentapplication';
import Studentinterviews from './StudentUIComponents/Studentinterviews';
import Studentnotifications from './StudentUIComponents/Studentnotifications';
import { authFetch } from '../utils/api';
import { getSocket } from '../utils/socket';

const SIDEBAR_ITEMS = [
    { id: 'studentdashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studentprofile', label: 'My Profile', icon: User },
    { id: 'studentjobs', label: 'Jobs', icon: Briefcase },
    { id: 'studentapplications', label: 'Applications', icon: FileText },
    { id: 'studentinterviews', label: 'Interviews', icon: Calendar },
    { id: 'studentnotifications', label: 'Notifications', icon: BellRing },
];

/** Derive a readable display name from email: "john.doe@..." → "John Doe" */
function nameFromEmail(email = '') {
    return email
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

export default function StudentUI({ user, onLogout }) {
    const [activePage, setActivePage] = useState('studentdashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const displayName = nameFromEmail(user.email);
    const initial = displayName[0] ?? 'S';

    // Unread notifications count state – default 0, filled from DB on mount
    const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

    // Fetch unread count from DB (called on mount AND whenever notifications change)
    const fetchUnreadCount = async () => {
        try {
            const userId = user._id || user.id;
            if (!userId) return;
            const res = await authFetch(
                `http://localhost:5000/api/notifications?userId=${userId}&unreadOnly=true`
            );
            if (res.ok) {
                const data = await res.json();
                setUnreadNotifsCount(Array.isArray(data) ? data.length : 0);
            }
        } catch (e) {
            console.warn('[StudentUI] Could not fetch notification count:', e.message);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchUnreadCount();
    }, [user._id, user.id]);

    // Re-fetch from DB when notifications are read / deleted (event from Studentnotifications)
    useEffect(() => {
        window.addEventListener('student_notifications_updated', fetchUnreadCount);
        return () => window.removeEventListener('student_notifications_updated', fetchUnreadCount);
    }, [user._id, user.id]);

    // Real-time socket listener – increment badge instantly on new notification
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleNewNotification = () => {
            setUnreadNotifsCount(prev => prev + 1);
        };
        socket.on('new_notification', handleNewNotification);
        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, []);

    /* Close dropdown when clicking outside */
    useEffect(() => {
        function handleOutsideClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const activeLabel = SIDEBAR_ITEMS.find(i => i.id === activePage)?.label ?? '';
    const currentpage = SIDEBAR_ITEMS.find(i => i.id === activePage)?.id ?? '';


    return (
        <div className="sd-layout">

            {/* ── TOP NAVBAR ─────────────────────────────────────────── */}
            <header className="sd-navbar">
                <div className="sd-navbar-left">
                    <button
                        className="sd-hamburger"
                        onClick={() => setSidebarOpen(v => !v)}
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="sd-brand">
                        <GraduationCap size={22} className="sd-brand-icon" />
                        <span className="sd-brand-text">Campus Placement Platform</span>
                    </div>
                </div>

                <div className="sd-navbar-right">
                    {/* Notification bell */}
                    <button
                        id="sd-notif-btn"
                        className="sd-icon-btn"
                        title="Notifications"
                        onClick={() => { setActivePage('studentnotifications'); }}
                    >
                        <Bell size={20} />
                        {unreadNotifsCount > 0 && <span className="sd-notif-badge">{unreadNotifsCount}</span>}
                    </button>

                    {/* Student dropdown */}
                    <div className="sd-user-menu" ref={dropdownRef}>
                        <button
                            id="sd-user-btn"
                            className="sd-user-btn"
                            onClick={() => setDropdownOpen(v => !v)}
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                        >
                            <div className="sd-avatar">{initial}</div>
                            <span className="sd-username">{displayName}</span>
                            <ChevronDown
                                size={14}
                                className={`sd-chevron ${dropdownOpen ? 'open' : ''}`}
                            />
                        </button>

                        {dropdownOpen && (
                            <div className="sd-dropdown" role="menu">
                                <button
                                    className="sd-dropdown-item"
                                    role="menuitem"
                                    onClick={() => { setActivePage('studentprofile'); setDropdownOpen(false); }}
                                >
                                    <User size={15} />
                                    My Profile
                                </button>
                                <div className="sd-dropdown-divider" />
                                <button
                                    id="sd-logout-btn"
                                    className="sd-dropdown-item danger"
                                    role="menuitem"
                                    onClick={onLogout}
                                >
                                    <LogOut size={15} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── BODY (sidebar + content) ─────────────────────────── */}
            <div className="sd-body">

                {/* Sidebar */}
                <aside className={`sd-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                    {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`sd-nav-item ${activePage === id ? 'active' : ''}`}
                            onClick={() => setActivePage(id)}
                            title={!sidebarOpen ? label : undefined}
                        >
                            <Icon size={18} className="sd-nav-icon" />
                            <span className="sd-nav-label">{label}</span>
                        </button>
                    ))}
                </aside>

                {/* Main content area */}
                <main className="sd-main">
                    <div className="sd-page-header">
                        {currentpage === 'studentdashboard' && <h1>Dashboard</h1>}
                        {currentpage === 'studentprofile' && <h1>Student Profile</h1>}
                        {currentpage === 'studentjobs' && <h1>Student Jobs</h1>}
                        {currentpage === 'studentapplications' && <h1>Student Applications</h1>}
                        {currentpage === 'studentinterviews' && <h1>Student Interviews</h1>}
                        {currentpage === 'studentnotifications' && <h1>Student Notifications</h1>}

                    </div>
                    <div className="sd-page-body">
                        {currentpage === 'studentdashboard' && <Studentdashboard user={user} onNavigate={setActivePage} />}
                        {currentpage === 'studentprofile' && <Studentprofile user={user} onNavigate={setActivePage} />}
                        {currentpage === 'studentjobs' && <Studentjobs user={user} />}
                        {currentpage === 'studentapplications' && <Studentapplication user={user} />}
                        {currentpage === 'studentinterviews' && <Studentinterviews user={user} />}
                        {currentpage === 'studentnotifications' && <Studentnotifications user={user} onNavigate={setActivePage} />}
                    </div>
                </main>
            </div>
        </div>
    );
}
