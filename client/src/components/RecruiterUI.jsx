import React, { useState, useRef, useEffect } from 'react';
import {
    Briefcase, Bell, ChevronDown, LayoutDashboard,
    Users, UserCheck, Calendar, BellRing, Building2,
    Settings, LogOut, Menu, X, PlusCircle, Sparkles
} from 'lucide-react';
import './RecruiterUI.css';

import RecruiterDashboard from './RecruiterUIComponents/RecruiterDashboard';
import RecruiterJobs from './RecruiterUIComponents/RecruiterJobs';
import RecruiterApplications from './RecruiterUIComponents/RecruiterApplications';
import RecruiterShortlist from './RecruiterUIComponents/RecruiterShortlist';
import RecruiterInterviews from './RecruiterUIComponents/RecruiterInterviews';
import RecruiterNotifications from './RecruiterUIComponents/RecruiterNotifications';
import RecruiterCompanyProfile from './RecruiterUIComponents/RecruiterCompanyProfile';
import RecruiterSettings from './RecruiterUIComponents/RecruiterSettings';
import { recruiterService } from '../services/recruiterService';

const SIDEBAR_ITEMS = [
    { id: 'recruiterdashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recruiterjobs', label: 'Job Drives', icon: Briefcase },
    { id: 'recruiterapplications', label: 'Candidate Pipeline', icon: Users },
    { id: 'recruitershortlist', label: 'Shortlisted Pool', icon: UserCheck },
    { id: 'recruiterinterviews', label: 'Interviews', icon: Calendar },
    { id: 'recruiternotifications', label: 'Notifications', icon: BellRing },
    { id: 'recruitercompanyprofile', label: 'Company Profile', icon: Building2 },
    { id: 'recruitersettings', label: 'Settings', icon: Settings },
];

/** Derive a readable recruiter display name */
function nameFromEmail(email = '') {
    if (!email) return 'Recruiter';
    return email
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

export default function RecruiterUI({ user, onLogout }) {
    const [activePage, setActivePage] = useState('recruiterdashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cross-page navigation state (e.g. Schedule Interview target)
    const [scheduleInterviewTarget, setScheduleInterviewTarget] = useState(null);
    const [openCreateJobModal, setOpenCreateJobModal] = useState(false);

    // Dynamic unread notifications badge
    const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

    const displayName = user?.name || nameFromEmail(user?.email);
    const initial = displayName[0] ?? 'R';

    const syncNotifsCount = async () => {
        try {
            const notifs = await recruiterService.getNotifications();
            setUnreadNotifsCount(notifs.filter(n => n.unread).length);
        } catch (e) { /* ignore */ }
    };

    useEffect(() => {
        syncNotifsCount();
        window.addEventListener('recruiter_notifications_updated', syncNotifsCount);
        return () => window.removeEventListener('recruiter_notifications_updated', syncNotifsCount);
    }, []);

    /* Close user dropdown on outside click */
    useEffect(() => {
        function handleOutsideClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleScheduleInterview = (candidate, application) => {
        setScheduleInterviewTarget({ candidate, application });
        setActivePage('recruiterinterviews');
    };

    const handleQuickPostJob = () => {
        setOpenCreateJobModal(true);
        setActivePage('recruiterjobs');
    };

    const getPageTitle = () => {
        switch (activePage) {
            case 'recruiterdashboard': return { title: 'Recruitment Overview', sub: 'Key metrics, upcoming rounds, and talent pipeline activity.' };
            case 'recruiterjobs': return { title: 'Job Postings & Campus Drives', sub: 'Create and manage recruitment openings across university branches.' };
            case 'recruiterapplications': return { title: 'Candidate Pipeline', sub: 'Review, evaluate, and filter student applications.' };
            case 'recruitershortlist': return { title: 'Shortlisted Talent', sub: 'Candidates shortlisted for technical assessments and executive interviews.' };
            case 'recruiterinterviews': return { title: 'Interview Management', sub: 'Coordinate schedules, manage meeting links, and submit evaluations.' };
            case 'recruiternotifications': return { title: 'Recruitment Alerts', sub: 'Application alerts, interview reminders, and system notifications.' };
            case 'recruitercompanyprofile': return { title: 'Company Profile & Preferences', sub: 'Manage organization details and minimum academic criteria.' };
            case 'recruitersettings': return { title: 'Recruiter Settings', sub: 'Configure automation thresholds, alerts, and meeting platform defaults.' };
            default: return { title: 'Hiring Dashboard', sub: '' };
        }
    };

    const pageMeta = getPageTitle();

    return (
        <div className="rec-layout">
            {/* ── TOP NAVBAR ─────────────────────────────────────────── */}
            <header className="rec-navbar">
                <div className="rec-navbar-left">
                    <button
                        className="rec-hamburger"
                        onClick={() => setSidebarOpen(v => !v)}
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="rec-brand">
                        <div className="rec-brand-badge">
                            <Briefcase size={20} />
                        </div>
                        <span className="rec-brand-title">
                            CampusHire
                            <span className="rec-brand-tag">Recruiter</span>
                        </span>
                    </div>
                </div>

                <div className="rec-navbar-right">
                    {/* Quick Post Job CTA */}
                    <button
                        id="rec-post-job-btn"
                        className="rec-quick-post-btn"
                        onClick={handleQuickPostJob}
                    >
                        <PlusCircle size={15} />
                        <span>Post Drive</span>
                    </button>

                    {/* Notification bell */}
                    <button
                        id="rec-notif-btn"
                        className="rec-icon-btn"
                        title="Notifications"
                        onClick={() => setActivePage('recruiternotifications')}
                    >
                        <Bell size={19} />
                        {unreadNotifsCount > 0 && (
                            <span className="rec-notif-badge">{unreadNotifsCount}</span>
                        )}
                    </button>

                    {/* Recruiter dropdown */}
                    <div className="rec-user-menu" ref={dropdownRef}>
                        <button
                            id="rec-user-btn"
                            className="rec-user-btn"
                            onClick={() => setDropdownOpen(v => !v)}
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                        >
                            <div className="rec-avatar">{initial}</div>
                            <div className="rec-user-details">
                                <span className="rec-username">{displayName}</span>
                                <span className="rec-user-role">Recruiter</span>
                            </div>
                            <ChevronDown
                                size={14}
                                className={`rec-chevron ${dropdownOpen ? 'open' : ''}`}
                            />
                        </button>

                        {dropdownOpen && (
                            <div className="rec-dropdown" role="menu">
                                <button
                                    className="rec-dropdown-item"
                                    role="menuitem"
                                    onClick={() => {
                                        setActivePage('recruitercompanyprofile');
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <Building2 size={15} />
                                    Company Profile
                                </button>
                                <button
                                    className="rec-dropdown-item"
                                    role="menuitem"
                                    onClick={() => {
                                        setActivePage('recruitersettings');
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <Settings size={15} />
                                    Settings & Rules
                                </button>
                                <div className="rec-dropdown-divider" />
                                <button
                                    id="rec-logout-btn"
                                    className="rec-dropdown-item danger"
                                    role="menuitem"
                                    onClick={onLogout}
                                >
                                    <LogOut size={15} />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── BODY (sidebar + content) ─────────────────────────── */}
            <div className="rec-body">
                {/* Sidebar */}
                <aside className={`rec-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                    <div className="rec-sidebar-heading">Navigation</div>
                    {SIDEBAR_ITEMS.slice(0, 6).map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`rec-nav-item ${activePage === id ? 'active' : ''}`}
                            onClick={() => setActivePage(id)}
                            title={!sidebarOpen ? label : undefined}
                        >
                            <div className="rec-nav-left-group">
                                <Icon size={18} className="rec-nav-icon" />
                                <span className="rec-nav-label">{label}</span>
                            </div>
                            {id === 'recruiternotifications' && unreadNotifsCount > 0 && (
                                <span className="rec-nav-badge">{unreadNotifsCount}</span>
                            )}
                        </button>
                    ))}

                    <div className="rec-sidebar-heading">Management</div>
                    {SIDEBAR_ITEMS.slice(6).map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`rec-nav-item ${activePage === id ? 'active' : ''}`}
                            onClick={() => setActivePage(id)}
                            title={!sidebarOpen ? label : undefined}
                        >
                            <div className="rec-nav-left-group">
                                <Icon size={18} className="rec-nav-icon" />
                                <span className="rec-nav-label">{label}</span>
                            </div>
                        </button>
                    ))}
                </aside>

                {/* Main Content View */}
                <main className="rec-main">
                    <div className="rec-page-header">
                        <div className="rec-page-title-group">
                            <h1>{pageMeta.title}</h1>
                            {pageMeta.sub && <p className="rec-page-subtitle">{pageMeta.sub}</p>}
                        </div>
                    </div>

                    <div className="rec-page-body">
                        {activePage === 'recruiterdashboard' && (
                            <RecruiterDashboard
                                onNavigate={setActivePage}
                                onPostJob={handleQuickPostJob}
                                onScheduleInterview={handleScheduleInterview}
                            />
                        )}
                        {activePage === 'recruiterjobs' && (
                            <RecruiterJobs
                                user={user}
                                onScheduleInterview={handleScheduleInterview}
                                openCreateModalOnMount={openCreateJobModal}
                                onPostJobModalHandled={() => setOpenCreateJobModal(false)}
                            />
                        )}
                        {activePage === 'recruiterapplications' && (
                            <RecruiterApplications
                                onScheduleInterview={handleScheduleInterview}
                            />
                        )}
                        {activePage === 'recruitershortlist' && (
                            <RecruiterShortlist
                                onScheduleInterview={handleScheduleInterview}
                            />
                        )}
                        {activePage === 'recruiterinterviews' && (
                            <RecruiterInterviews
                                initialScheduleTarget={scheduleInterviewTarget}
                                onScheduleHandled={() => setScheduleInterviewTarget(null)}
                            />
                        )}
                        {activePage === 'recruiternotifications' && (
                            <RecruiterNotifications
                                onNavigate={setActivePage}
                            />
                        )}
                        {activePage === 'recruitercompanyprofile' && (
                            <RecruiterCompanyProfile
                                user={user}
                            />
                        )}
                        {activePage === 'recruitersettings' && (
                            <RecruiterSettings />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
