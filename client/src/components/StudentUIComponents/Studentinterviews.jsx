import React, { useState, useMemo, useEffect } from 'react';
import {
    Calendar, Video, Clock, Building, MapPin, DollarSign,
    CheckCircle, XCircle, AlertCircle, Eye, ExternalLink,
    Filter, X, User, Sparkles, Award, Star, ArrowRight, ShieldCheck
} from 'lucide-react';
import { placementService } from '../../services/placementService';
import './Studentinterviews.css';

export default function Studentinterviews({ user }) {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadInterviews = async () => {
        try {
            const params = user?.email ? { studentEmail: user.email } : {};
            const data = await placementService.getInterviews(params);
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
        window.addEventListener('recruiter_interviews_updated', loadInterviews);
        window.addEventListener('storage', loadInterviews);
        return () => {
            window.removeEventListener('student_interviews_updated', loadInterviews);
            window.removeEventListener('recruiter_interviews_updated', loadInterviews);
            window.removeEventListener('storage', loadInterviews);
        };
    }, [user?.email]);

    // Filters: status ('all' | 'upcoming' | 'completed') and date ('YYYY-MM-DD' | '')
    const [activeTab, setActiveTab] = useState('upcoming');
    const [filterDate, setFilterDate] = useState('');

    // Modal state
    const [selectedInterview, setSelectedInterview] = useState(null);

    const isUpcoming = (status) => ['scheduled', 'upcoming', 'in-progress'].includes((status || '').toLowerCase());
    const isCompleted = (status) => ['completed', 'evaluated', 'passed', 'failed', 'cancelled'].includes((status || '').toLowerCase());

    // Counts
    const upcomingCount = useMemo(() => interviews.filter(i => isUpcoming(i.status)).length, [interviews]);
    const completedCount = useMemo(() => interviews.filter(i => isCompleted(i.status)).length, [interviews]);

    // Filter logic
    const filteredInterviews = useMemo(() => {
        return interviews.filter(item => {
            // Tab filter
            if (activeTab === 'upcoming' && !isUpcoming(item.status)) return false;
            if (activeTab === 'completed' && !isCompleted(item.status)) return false;

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
                        const upcoming = isUpcoming(interview.status);
                        const isPassed = interview.result && (interview.result.includes('Selected') || interview.result.includes('Cleared') || interview.result.includes('Passed'));
                        const role = interview.jobTitle || interview.role || 'Software Engineer';
                        const company = interview.company || 'Company';
                        const color = interview.color || 'linear-gradient(135deg, #4f46e5, #3b82f6)';
                        const displayDate = interview.displayDate || interview.date || 'TBD';
                        const time = interview.time || '11:00 AM IST';
                        const meetLink = interview.meetLink || interview.meetingLink || 'https://meet.google.com';

                        return (
                            <div key={interview._id || interview.id} className="interview-card">
                                <div>
                                    {/* Company & Status / Round */}
                                    <div className="interview-card-top">
                                        <div className="interview-brand">
                                            <div className="company-avatar-box" style={{ background: color }}>
                                                {company.charAt(0)}
                                            </div>
                                            <div className="interview-title-meta">
                                                <h3>{role}</h3>
                                                <span>
                                                    <Building size={13} /> {company} • {interview.location || 'India'}
                                                </span>
                                            </div>
                                        </div>

                                        {upcoming ? (
                                            <span className="status-pill interview">Scheduled</span>
                                        ) : (
                                            <span className={`result-badge ${isPassed ? 'passed' : 'rejected'}`}>
                                                {isPassed ? <CheckCircle size={13} /> : <XCircle size={13} />}
                                                {interview.result || 'Completed'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Round description badge */}
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <span className="round-pill">
                                            {interview.round || 'Technical Round'}
                                        </span>
                                    </div>

                                    {/* Timing / Schedule Callout Box */}
                                    <div className="interview-timing-banner">
                                        <div className="timing-row">
                                            <Calendar size={14} color="#4f46e5" />
                                            <span>Date: <strong>{displayDate}</strong></span>
                                        </div>
                                        <div className="timing-row">
                                            <Clock size={14} color="#ea580c" />
                                            <span>Time: <strong>{time}</strong></span>
                                        </div>
                                        <div className="timing-row">
                                            <User size={14} color="#64748b" />
                                            <span>Interviewer: <strong>{interview.interviewer || 'Recruiter Team'}</strong></span>
                                        </div>
                                    </div>

                                    {/* Completed Feedback Snippet */}
                                    {!upcoming && interview.feedback && (
                                        <div className={`feedback-snippet-box ${isPassed ? '' : 'rejected'}`}>
                                            <p>
                                                <strong>Feedback: </strong> {interview.feedback}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="interview-actions">
                                    {upcoming ? (
                                        <>
                                            <a
                                                href={meetLink}
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
            {/* ── 4. Interview Details & Evaluation Modal ───────────────────── */}
            {selectedInterview && (() => {
                const upcoming = isUpcoming(selectedInterview.status);
                const role = selectedInterview.jobTitle || selectedInterview.role || 'Software Engineer';
                const company = selectedInterview.company || 'Company';
                const color = selectedInterview.color || 'linear-gradient(135deg, #4f46e5, #3b82f6)';
                const displayDate = selectedInterview.displayDate || selectedInterview.date || 'TBD';
                const time = selectedInterview.time || '11:00 AM IST';
                const meetLink = selectedInterview.meetLink || selectedInterview.meetingLink || 'https://meet.google.com';

                return (
                    <div className="modal-backdrop" onClick={() => setSelectedInterview(null)}>
                        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-custom">
                                <h2>{upcoming ? 'Interview Schedule & Instructions' : 'Evaluation Feedback & Results'}</h2>
                                <button className="modal-close-icon-btn" onClick={() => setSelectedInterview(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-scrollable-body">
                                {/* Company Banner */}
                                <div className="modal-company-hero">
                                    <div className="company-avatar-box" style={{ background: color, width: 52, height: 52 }}>
                                        {company.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3>{role}</h3>
                                        <p>{company} • {selectedInterview.location || 'India'} • {selectedInterview.salary || 'Competitive'}</p>
                                    </div>
                                    <span className={`status-pill ${upcoming ? 'interview' : 'shortlisted'}`}>
                                        {selectedInterview.round || 'Technical Round'}
                                    </span>
                                </div>

                                {/* Key Schedule Information */}
                                <div className="modal-info-grid">
                                    <div className="modal-info-card">
                                        <span>Interview Date</span>
                                        <strong>{displayDate}</strong>
                                    </div>
                                    <div className="modal-info-card">
                                        <span>Time & Duration</span>
                                        <strong>{time}</strong>
                                    </div>
                                    <div className="modal-info-card">
                                        <span>Platform</span>
                                        <strong style={{ color: '#4f46e5' }}>{selectedInterview.platform || 'Google Meet'}</strong>
                                    </div>
                                </div>

                                {/* Interviewer Details */}
                                <div className="interview-timing-banner">
                                    <div className="timing-row">
                                        <User size={16} color="#4f46e5" />
                                        <span>Interview Panel: <strong>{selectedInterview.interviewer || 'Recruiter Team'}</strong></span>
                                    </div>
                                </div>

                                {/* Instructions (for upcoming) or Evaluation Details (for completed) */}
                                {upcoming ? (
                                    <>
                                        <div>
                                            <h4 className="modal-section-title">Candidate Guidelines</h4>
                                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                                                {selectedInterview.instructions || 'Please ensure you have a stable internet connection, a functioning camera, and join 5 minutes prior to the scheduled time.'}
                                            </p>
                                        </div>

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
                                                "{selectedInterview.feedback || 'Candidate demonstrated strong problem-solving skills and effective communication.'}"
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
                                {upcoming && (
                                    <a
                                        href={meetLink}
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
                );
            })()}
        </div>
    );
}
