import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Briefcase, Building, MapPin, DollarSign, Calendar,
    CheckCircle, Clock, Award, Bookmark, Eye, X, Filter,
    FileText, ArrowRight, Video, AlertCircle, ChevronRight,
    Star, Send, ExternalLink, Trash2, Check
} from 'lucide-react';
import { placementService } from '../../services/placementService';
import './Studentapplication.css';

export default function Studentapplication() {
    // Load applications dynamically via placementService
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadApplications = async () => {
        try {
            const data = await placementService.getApplications();
            setApplications(data);
        } catch (e) {
            // fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
        window.addEventListener('student_applications_updated', loadApplications);
        window.addEventListener('storage', loadApplications);
        return () => {
            window.removeEventListener('student_applications_updated', loadApplications);
            window.removeEventListener('storage', loadApplications);
        };
    }, []);

    // Listen to updates from other tabs / components
    useEffect(() => {
        const syncApplications = () => {
            const saved = localStorage.getItem('student_applications');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) setApplications(parsed);
                } catch (e) {
                    // fallback
                }
            }
        };
        window.addEventListener('student_applications_updated', syncApplications);
        window.addEventListener('storage', syncApplications);
        return () => {
            window.removeEventListener('student_applications_updated', syncApplications);
            window.removeEventListener('storage', syncApplications);
        };
    }, []);

    // Save applications to localStorage whenever changed
    const updateAndPersistApplications = (newApps) => {
        setApplications(newApps);
        localStorage.setItem('student_applications', JSON.stringify(newApps));
        window.dispatchEvent(new Event('student_applications_updated'));
    };

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'applied' | 'saved' | 'shortlisted' | 'interview' | 'offered'

    // Selected application for detail modal
    const [selectedApp, setSelectedApp] = useState(null);

    // Toggle Saved / Bookmark
    const handleToggleSave = (appId, e) => {
        e?.stopPropagation();
        const updated = applications.map(app => {
            if (app.id === appId) {
                const nextSaved = !app.isSaved;
                // If it was only in saved status, update status appropriately
                return {
                    ...app,
                    isSaved: nextSaved,
                    status: app.status === 'Saved' && !nextSaved ? 'Applied' : app.status
                };
            }
            return app;
        });
        updateAndPersistApplications(updated);
    };

    // Withdraw application
    const handleWithdrawApplication = (appId) => {
        if (window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
            const updated = applications.filter(app => app.id !== appId);
            updateAndPersistApplications(updated);
            if (selectedApp?.id === appId) setSelectedApp(null);
        }
    };

    // Stats computation
    const stats = useMemo(() => {
        return {
            total: applications.length,
            applied: applications.filter(a => a.status.toLowerCase() === 'applied').length,
            shortlisted: applications.filter(a => a.status.toLowerCase() === 'shortlisted').length,
            interview: applications.filter(a => a.status.toLowerCase() === 'interview').length,
            saved: applications.filter(a => a.isSaved || a.status.toLowerCase() === 'saved').length,
            offered: applications.filter(a => a.status.toLowerCase() === 'offered').length
        };
    }, [applications]);

    // Filter and search logic
    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                q === '' ||
                app.role.toLowerCase().includes(q) ||
                app.company.toLowerCase().includes(q) ||
                app.location.toLowerCase().includes(q) ||
                app.status.toLowerCase().includes(q) ||
                (app.id && app.id.toLowerCase().includes(q));

            if (!matchesSearch) return false;

            if (activeFilter === 'applied') return app.status.toLowerCase() === 'applied';
            if (activeFilter === 'saved') return app.isSaved || app.status.toLowerCase() === 'saved';
            if (activeFilter === 'shortlisted') return app.status.toLowerCase() === 'shortlisted';
            if (activeFilter === 'interview') return app.status.toLowerCase() === 'interview';
            if (activeFilter === 'offered') return app.status.toLowerCase() === 'offered';

            return true;
        });
    }, [applications, searchQuery, activeFilter]);

    return (
        <div className="apps-container">
            {/* ── 1. Header & Search Bar ─────────────────────────────────────── */}
            <section className="apps-header">
                <div className="apps-header-top">
                    <h1>
                        <Briefcase size={28} color="#818cf8" />
                        Applications & Status Tracker
                    </h1>
                    <p>Track your submitted applications, interview schedules, shortlisted statuses, and placement offers.</p>
                </div>

                {/* Search Bar */}
                <div className="apps-search-bar">
                    <Search size={20} color="#64748b" />
                    <input
                        type="text"
                        className="apps-search-input"
                        placeholder="Search applied jobs by role, company name, location, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                            onClick={() => setSearchQuery('')}
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </section>

            {/* ── 2. Summary Stats Cards ─────────────────────────────────────── */}
            <div className="apps-stats-grid">
                <div className="app-stat-card">
                    <div className="stat-icon-wrap blue">
                        <Send size={22} />
                    </div>
                    <div className="stat-text">
                        <h4>{stats.total}</h4>
                        <span>Total Tracked</span>
                    </div>
                </div>

                <div className="app-stat-card">
                    <div className="stat-icon-wrap emerald">
                        <CheckCircle size={22} />
                    </div>
                    <div className="stat-text">
                        <h4>{stats.shortlisted}</h4>
                        <span>Shortlisted</span>
                    </div>
                </div>

                <div className="app-stat-card">
                    <div className="stat-icon-wrap orange">
                        <Clock size={22} />
                    </div>
                    <div className="stat-text">
                        <h4>{stats.interview}</h4>
                        <span>In Interview</span>
                    </div>
                </div>

                <div className="app-stat-card">
                    <div className="stat-icon-wrap purple">
                        <Bookmark size={22} />
                    </div>
                    <div className="stat-text">
                        <h4>{stats.saved}</h4>
                        <span>Saved Opportunities</span>
                    </div>
                </div>
            </div>

            {/* ── 3. Filters Bar ────────────────────────────────────────────── */}
            <div className="apps-filter-bar">
                <div className="filter-pills-list">
                    <button
                        className={`filter-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All Applications
                        <span className="pill-counter">{stats.total}</span>
                    </button>
                    <button
                        className={`filter-pill-btn ${activeFilter === 'applied' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('applied')}
                    >
                        Applied
                        <span className="pill-counter">{stats.applied}</span>
                    </button>
                    <button
                        className={`filter-pill-btn ${activeFilter === 'saved' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('saved')}
                    >
                        Saved
                        <span className="pill-counter">{stats.saved}</span>
                    </button>
                    <button
                        className={`filter-pill-btn ${activeFilter === 'shortlisted' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('shortlisted')}
                    >
                        Shortlisted
                        <span className="pill-counter">{stats.shortlisted}</span>
                    </button>
                    <button
                        className={`filter-pill-btn ${activeFilter === 'interview' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('interview')}
                    >
                        Interview
                        <span className="pill-counter">{stats.interview}</span>
                    </button>
                    <button
                        className={`filter-pill-btn ${activeFilter === 'offered' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('offered')}
                    >
                        <Star size={13} /> Offered
                        <span className="pill-counter">{stats.offered}</span>
                    </button>
                </div>

                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Showing <strong>{filteredApplications.length}</strong> applications
                </span>
            </div>

            {/* ── 4. Applied Jobs Cards Grid ─────────────────────────────────── */}
            <div className="apps-cards-grid">
                {filteredApplications.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
                        <AlertCircle size={40} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>No applications found</h3>
                        <p style={{ margin: '0.35rem 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                            {searchQuery ? 'Try clearing your search terms.' : 'Apply for exciting campus drives in the Jobs section to see them tracked here.'}
                        </p>
                        <button
                            className="btn-primary"
                            style={{ margin: '0 auto' }}
                            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    filteredApplications.map(app => (
                        <div key={app.id} className="app-card">
                            <div>
                                {/* Top: Company & Status Badge */}
                                <div className="app-card-top">
                                    <div className="app-brand">
                                        <div className="app-logo" style={{ background: app.color || 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                                            {app.company.charAt(0)}
                                        </div>
                                        <div className="app-title-meta">
                                            <h3>{app.role}</h3>
                                            <span>
                                                <Building size={13} /> {app.company}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <span className={`status-pill ${app.status.toLowerCase()}`}>
                                        {app.status === 'Offered' && <Star size={12} />}
                                        {app.status}
                                    </span>
                                </div>

                                {/* Meta Snippet */}
                                <div className="app-meta-row">
                                    <div className="app-meta-item salary">
                                        <DollarSign size={14} /> {app.salary}
                                    </div>
                                    <div className="app-meta-item">
                                        <MapPin size={14} /> {app.location}
                                    </div>
                                    <div className="app-meta-item">
                                        <Calendar size={14} /> Applied: {app.appliedDate}
                                    </div>
                                </div>

                                {/* Attached Resume */}
                                <div className="app-attached-resume">
                                    <div className="app-resume-left">
                                        <FileText size={15} color="#ef4444" />
                                        <span>{app.resumeName || 'Abhishek_K_Resume.pdf'}</span>
                                    </div>
                                    <button
                                        type="button"
                                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                                        onClick={() => alert(`Viewing attached resume: ${app.resumeName || 'Abhishek_K_Resume.pdf'}`)}
                                    >
                                        <Eye size={12} /> View
                                    </button>
                                </div>
                            </div>

                            {/* Actions: View Details & Bookmark */}
                            <div className="app-card-actions">
                                <button
                                    className="btn-view-app"
                                    onClick={() => setSelectedApp(app)}
                                >
                                    <Eye size={15} /> View Progress
                                </button>
                                <button
                                    className={`btn-save-toggle ${app.isSaved || app.status === 'Saved' ? 'saved' : ''}`}
                                    title={app.isSaved ? 'Remove from Saved' : 'Save Application'}
                                    onClick={(e) => handleToggleSave(app.id, e)}
                                >
                                    <Bookmark size={16} fill={app.isSaved || app.status === 'Saved' ? '#7c3aed' : 'none'} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── 5. APPLICATION PROGRESS / DETAILS MODAL ───────────────────── */}
            {selectedApp && (
                <div className="modal-backdrop" onClick={() => setSelectedApp(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h2>Application Details & Status</h2>
                            <button className="modal-close-icon-btn" onClick={() => setSelectedApp(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-scrollable-body">
                            {/* App Hero */}
                            <div className="modal-company-hero">
                                <div className="app-logo" style={{ background: selectedApp.color, width: 52, height: 52 }}>
                                    {selectedApp.company.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3>{selectedApp.role}</h3>
                                    <p>{selectedApp.company} • {selectedApp.location} • {selectedApp.salary}</p>
                                </div>
                                <span className={`status-pill ${selectedApp.status.toLowerCase()}`}>
                                    {selectedApp.status}
                                </span>
                            </div>

                            {/* Stepper Timeline */}
                            <div>
                                <h4 className="modal-section-title">Hiring Stage Progress</h4>
                                <div className="stepper-timeline">
                                    {['Applied', 'Screening', 'Assessment', 'Interview', 'Offer'].map((stepName, idx) => {
                                        const currentStage = selectedApp.stage || (
                                            selectedApp.status === 'Applied' ? 1 :
                                            selectedApp.status === 'Shortlisted' ? 2 :
                                            selectedApp.status === 'Interview' ? 4 :
                                            selectedApp.status === 'Offered' ? 5 : 1
                                        );
                                        const isCompleted = idx + 1 < currentStage;
                                        const isActive = idx + 1 === currentStage;

                                        return (
                                            <div
                                                key={idx}
                                                className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                                            >
                                                <div className="step-circle">
                                                    {isCompleted ? <Check size={16} /> : idx + 1}
                                                </div>
                                                <span className="step-label">{stepName}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Interview Callout Box (if applicable) */}
                            {selectedApp.status === 'Interview' && selectedApp.interviewDetails && (
                                <div className="interview-callout-box">
                                    <div className="interview-callout-header">
                                        <h4>
                                            <Video size={17} />
                                            Scheduled Interview Round
                                        </h4>
                                        <span className="job-type-badge full-time">Action Required</span>
                                    </div>
                                    <div className="interview-details-row">
                                        <div>
                                            <strong>Round:</strong> {selectedApp.interviewDetails.round}
                                        </div>
                                        <div>
                                            <strong>Date & Time:</strong> {selectedApp.interviewDetails.date}, {selectedApp.interviewDetails.time}
                                        </div>
                                        <div>
                                            <strong>Platform:</strong> {selectedApp.interviewDetails.platform}
                                        </div>
                                        <div>
                                            <strong>Panel:</strong> {selectedApp.interviewDetails.interviewer}
                                        </div>
                                    </div>
                                    <a
                                        href={selectedApp.interviewDetails.meetLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-join-meeting"
                                    >
                                        <Video size={15} /> Join Interview Meeting
                                    </a>
                                </div>
                            )}

                            {/* Application Info Grid */}
                            <div className="modal-info-grid">
                                <div className="modal-info-card">
                                    <span>Application ID</span>
                                    <strong>{selectedApp.id}</strong>
                                </div>
                                <div className="modal-info-card">
                                    <span>Applied Date</span>
                                    <strong>{selectedApp.appliedDate}</strong>
                                </div>
                                <div className="modal-info-card">
                                    <span>Employment Type</span>
                                    <strong>{selectedApp.type}</strong>
                                </div>
                            </div>

                            {/* Attached Resume */}
                            <div>
                                <h4 className="modal-section-title">Submitted Resume</h4>
                                <div className="resume-display-card">
                                    <div className="resume-meta">
                                        <div className="resume-icon-badge">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h5>{selectedApp.resumeName || 'Abhishek_K_Resume.pdf'}</h5>
                                            <p>Submitted with this application</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                        onClick={() => alert(`Opening resume: ${selectedApp.resumeName || 'Abhishek_K_Resume.pdf'}`)}
                                    >
                                        <Eye size={13} /> View Resume
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer-custom" style={{ justifyContent: 'space-between' }}>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                onClick={() => handleWithdrawApplication(selectedApp.id)}
                            >
                                <Trash2 size={15} /> Withdraw Application
                            </button>

                            <button className="btn-secondary" onClick={() => setSelectedApp(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}