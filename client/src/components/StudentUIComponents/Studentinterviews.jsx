import React, { useState, useMemo, useEffect } from 'react';
import {
    Calendar, Video, Clock, Building, MapPin, DollarSign,
    CheckCircle, XCircle, AlertCircle, Eye, ExternalLink,
    Filter, X, User, Sparkles, Award, Star, ArrowRight, ShieldCheck
} from 'lucide-react';
import { placementService } from '../../services/placementService';
import './Studentinterviews.css';

export default function Studentinterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadInterviews = async () => {
        try {
            const data = await placementService.getInterviews();
            setInterviews(data);
        } catch (e) {
            // handle error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInterviews();
        window.addEventListener('student_interviews_updated', loadInterviews);
        window.addEventListener('storage', loadInterviews);
        return () => {
            window.removeEventListener('student_interviews_updated', loadInterviews);
            window.removeEventListener('storage', loadInterviews);
        };
    }, []);

    // Filters: status ('all' | 'upcoming' | 'completed') and date ('YYYY-MM-DD' | '')
    const [activeTab, setActiveTab] = useState('upcoming');
    const [filterDate, setFilterDate] = useState('');

    // Modal state
    const [selectedInterview, setSelectedInterview] = useState(null);

    // Counts
    const upcomingCount = useMemo(() => interviews.filter(i => i.status === 'upcoming').length, [interviews]);
    const completedCount = useMemo(() => interviews.filter(i => i.status === 'completed').length, [interviews]);

    // Filter logic
    const filteredInterviews = useMemo(() => {
        return interviews.filter(item => {
            // Tab filter
            if (activeTab === 'upcoming' && item.status !== 'upcoming') return false;
            if (activeTab === 'completed' && item.status !== 'completed') return false;

            // Date filter
            if (filterDate && item.date !== filterDate) return false;

            return true;
        });
    }, [interviews, activeTab, filterDate]);

    return (
        <div className="interviews-container">
            {/* ── 1. Hero Header ─────────────────────────────────────────────── */}
            <section className="interviews-header">
                <div className="interviews-header-top">
                    <h1>
                        <Calendar size={28} color="#a5b4fc" />
                        Interview Schedule & Evaluation Hub
                    </h1>
                    <p>Manage your upcoming technical rounds, connect to live meetings, and review past interview feedback.</p>
                </div>
            </section>

            {/* ── 2. Filters Bar with Status Tabs & Date Picker ─────────────── */}
            <div className="interviews-filter-bar">
                <div className="interviews-tabs-group">
                    <button
                        className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        <Clock size={15} /> Upcoming Interviews
                        <span className="tab-count">{upcomingCount}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        <CheckCircle size={15} /> Completed & Evaluated
                        <span className="tab-count">{completedCount}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Interviews
                        <span className="tab-count">{interviews.length}</span>
                    </button>
                </div>

                {/* Filter interview by Date */}
                <div className="date-filter-control">
                    <label>
                        <Calendar size={15} color="#4f46e5" /> Filter by Date:
                    </label>
                    <input
                        type="date"
                        className="date-filter-input"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                    {filterDate && (
                        <button
                            className="date-clear-btn"
                            title="Clear date filter"
                            onClick={() => setFilterDate('')}
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── 3. Interview Cards Grid ───────────────────────────────────── */}
            <div className="interviews-grid">
                {filteredInterviews.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
                        <AlertCircle size={40} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>No interviews found</h3>
                        <p style={{ margin: '0.35rem 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                            {filterDate ? `No interviews scheduled on ${filterDate}. Try clearing the date filter.` : 'No interviews currently matching your selected criteria.'}
                        </p>
                        <button
                            className="btn-primary"
                            style={{ margin: '0 auto' }}
                            onClick={() => { setFilterDate(''); setActiveTab('all'); }}
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    filteredInterviews.map((interview) => {
                        const isUpcoming = interview.status === 'upcoming';
                        const isPassed = interview.result && (interview.result.includes('Selected') || interview.result.includes('Cleared') || interview.result.includes('Passed'));

                        return (
                            <div key={interview.id} className="interview-card">
                                <div>
                                    {/* Company & Status / Round */}
                                    <div className="interview-card-top">
                                        <div className="interview-brand">
                                            <div className="company-avatar-box" style={{ background: interview.color }}>
                                                {interview.company.charAt(0)}
                                            </div>
                                            <div className="interview-title-meta">
                                                <h3>{interview.role}</h3>
                                                <span>
                                                    <Building size={13} /> {interview.company} • {interview.location}
                                                </span>
                                            </div>
                                        </div>

                                        {isUpcoming ? (
                                            <span className="status-pill interview">Upcoming</span>
                                        ) : (
                                            <span className={`result-badge ${isPassed ? 'passed' : 'rejected'}`}>
                                                {isPassed ? <CheckCircle size={13} /> : <XCircle size={13} />}
                                                {interview.result}
                                            </span>
                                        )}
                                    </div>

                                    {/* Round description badge */}
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <span className="round-pill">
                                            {interview.round}
                                        </span>
                                    </div>

                                    {/* Timing / Schedule Callout Box */}
                                    <div className="interview-timing-banner">
                                        <div className="timing-row">
                                            <Calendar size={14} color="#4f46e5" />
                                            <span>Date: <strong>{interview.displayDate}</strong></span>
                                        </div>
                                        <div className="timing-row">
                                            <Clock size={14} color="#ea580c" />
                                            <span>Time: <strong>{interview.time}</strong> ({interview.duration})</span>
                                        </div>
                                        <div className="timing-row">
                                            <User size={14} color="#64748b" />
                                            <span>Interviewer: <strong>{interview.interviewer}</strong></span>
                                        </div>
                                    </div>

                                    {/* Completed Feedback Snippet */}
                                    {!isUpcoming && interview.feedback && (
                                        <div className={`feedback-snippet-box ${isPassed ? '' : 'rejected'}`}>
                                            <p>
                                                <strong>Feedback: </strong> {interview.feedback}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="interview-actions">
                                    {isUpcoming ? (
                                        <>
                                            <a
                                                href={interview.meetLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-join-live"
                                            >
                                                <Video size={15} /> Join Live Call
                                            </a>
                                            <button
                                                className="btn-view-feedback"
                                                onClick={() => setSelectedInterview(interview)}
                                            >
                                                <Eye size={15} /> Details
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="btn-view-feedback"
                                                style={{ gridColumn: '1 / -1' }}
                                                onClick={() => setSelectedInterview(interview)}
                                            >
                                                <Eye size={15} /> View Evaluation & Feedback
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── 4. Interview Details & Evaluation Modal ───────────────────── */}
            {selectedInterview && (
                <div className="modal-backdrop" onClick={() => setSelectedInterview(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h2>{selectedInterview.status === 'upcoming' ? 'Interview Schedule & Instructions' : 'Evaluation Feedback & Results'}</h2>
                            <button className="modal-close-icon-btn" onClick={() => setSelectedInterview(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-scrollable-body">
                            {/* Company Banner */}
                            <div className="modal-company-hero">
                                <div className="company-avatar-box" style={{ background: selectedInterview.color, width: 52, height: 52 }}>
                                    {selectedInterview.company.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3>{selectedInterview.role}</h3>
                                    <p>{selectedInterview.company} • {selectedInterview.location} • {selectedInterview.salary}</p>
                                </div>
                                <span className={`status-pill ${selectedInterview.status === 'upcoming' ? 'interview' : 'shortlisted'}`}>
                                    {selectedInterview.round}
                                </span>
                            </div>

                            {/* Key Schedule Information */}
                            <div className="modal-info-grid">
                                <div className="modal-info-card">
                                    <span>Interview Date</span>
                                    <strong>{selectedInterview.displayDate}</strong>
                                </div>
                                <div className="modal-info-card">
                                    <span>Time & Duration</span>
                                    <strong>{selectedInterview.time}</strong>
                                </div>
                                <div className="modal-info-card">
                                    <span>Platform</span>
                                    <strong style={{ color: '#4f46e5' }}>{selectedInterview.platform}</strong>
                                </div>
                            </div>

                            {/* Interviewer Details */}
                            <div className="interview-timing-banner">
                                <div className="timing-row">
                                    <User size={16} color="#4f46e5" />
                                    <span>Interview Panel: <strong>{selectedInterview.interviewer}</strong></span>
                                </div>
                            </div>

                            {/* Instructions (for upcoming) or Evaluation Details (for completed) */}
                            {selectedInterview.status === 'upcoming' ? (
                                <>
                                    {selectedInterview.instructions && (
                                        <div>
                                            <h4 className="modal-section-title">Candidate Guidelines</h4>
                                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                                                {selectedInterview.instructions}
                                            </p>
                                        </div>
                                    )}

                                    {selectedInterview.topics && (
                                        <div>
                                            <h4 className="modal-section-title">Key Assessment Focus Areas</h4>
                                            <div className="job-skills-wrap">
                                                {selectedInterview.topics.map((t, idx) => (
                                                    <span key={idx} className="skill-chip">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div>
                                        <h4 className="modal-section-title">Panelist Feedback Summary</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                            "{selectedInterview.feedback}"
                                        </p>
                                    </div>

                                    {selectedInterview.strengths && (
                                        <div>
                                            <h4 className="modal-section-title">Noted Key Strengths</h4>
                                            <div className="job-skills-wrap">
                                                {selectedInterview.strengths.map((s, idx) => (
                                                    <span key={idx} className="skill-chip" style={{ background: '#ecfdf5', color: '#047857' }}>
                                                        ✓ {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="modal-footer-custom">
                            <button className="btn-secondary" onClick={() => setSelectedInterview(null)}>
                                Close
                            </button>
                            {selectedInterview.status === 'upcoming' && (
                                <a
                                    href={selectedInterview.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                    style={{ background: '#4f46e5' }}
                                >
                                    <Video size={15} /> Join Meeting Room
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
