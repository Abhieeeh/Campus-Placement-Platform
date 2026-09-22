import React, { useState, useEffect } from 'react';
import {
    UserCheck, Search, Filter, Calendar, Gift,
    XCircle, Eye, Briefcase, GraduationCap, Award
} from 'lucide-react';
import RecruiterCandidateProfile from './RecruiterCandidateProfile';
import './RecruiterShortlist.css';
import { authFetch } from '../../utils/api';

export default function RecruiterShortlist({ user, onScheduleInterview }) {
    const [shortlistedApps, setShortlistedApps] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const loadData = async () => {
        try {
            if (!user?.email) return;
            const [appsRes, jobsRes] = await Promise.all([
                authFetch('http://localhost:5000/api/applications/by-recruiter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                }),
                authFetch('http://localhost:5000/api/jobs/by-recruiter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                })
            ]);

            const apps = appsRes.ok ? await appsRes.json() : [];
            const jList = jobsRes.ok ? await jobsRes.json() : [];

            // Shortlist pool = Shortlisted + Interview only
            const shortlistPool = (apps || []).filter(a => ['Shortlisted', 'Interview'].includes(a.status));
            setShortlistedApps(shortlistPool);
            setJobs(jList || []);
        } catch (e) {
            console.error('Failed to load shortlist:', e);
        }
    };

    useEffect(() => {
        loadData();

        window.addEventListener('recruiter_applications_updated', loadData);
        window.addEventListener('recruiter_interviews_updated', loadData);
        return () => {
            window.removeEventListener('recruiter_applications_updated', loadData);
            window.removeEventListener('recruiter_interviews_updated', loadData);
        };
    }, [user?.email]);

    const getCandidateProfile = async (email, app) => {
        try {
            const res = await authFetch('http://localhost:5000/api/auth/student-profile/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                const data = await res.json();
                if (data?.profile) return data.profile;
            }
        } catch (e) {
            console.error('Error fetching candidate profile:', e);
        }
        return {
            name: app.candidateName || 'Candidate',
            email: app.studentEmail || app.candidateEmail || email,
            branch: app.candidateBranch || 'CSE',
            cgpa: app.candidateCgpa || '0',
            skills: app.candidateSkills || [],
            resume: { name: app.candidateResume || 'Resume.pdf' }
        };
    };

    const handleViewCandidate = async (app) => {
        const email = app.studentEmail || app.candidateEmail;
        const cand = await getCandidateProfile(email, app);
        setSelectedCandidate(cand);
        setSelectedApplication(app);
    };

    const handleStatusChange = async (appId, newStatus) => {
        const targetId = appId?._id || appId?.id || appId;
        try {
            const res = await authFetch(`http://localhost:5000/api/applications/${targetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
                loadData();
                window.dispatchEvent(new Event('recruiter_applications_updated'));
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const filtered = shortlistedApps.filter(app => {
        const matchesJob = selectedJob === 'All' || app.jobId === selectedJob || app.jobTitle === selectedJob;
        const matchesQuery = (app.candidateName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.candidateBranch || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesJob && matchesQuery;
    });

    // Group filtered applications by Job Title
    const groupedByJob = filtered.reduce((acc, app) => {
        const key = app.jobTitle || 'General Pool';
        if (!acc[key]) acc[key] = [];
        acc[key].push(app);
        return acc;
    }, {});

    const totalShortlisted = shortlistedApps.filter(a => a.status === 'Shortlisted').length;
    const inInterview = shortlistedApps.filter(a => a.status === 'Interview').length;
    const totalInPool = shortlistedApps.length; // Shortlisted + Interview

    return (
        <div className="rsl-container">
            {/* Hero Banner */}
            <div className="rsl-hero-banner">
                <div className="rsl-hero-text">
                    <h2>Shortlisted Talent Pool</h2>
                    <p>Track evaluated candidates moving through technical rounds and final offers.</p>
                </div>
                <div className="rsl-hero-stats">
                    <div className="rsl-hstat">
                        <div className="rsl-hstat-num">{totalInPool}</div>
                        <div className="rsl-hstat-lbl">In Pool</div>
                    </div>
                    <div className="rsl-hstat">
                        <div className="rsl-hstat-num">{totalShortlisted}</div>
                        <div className="rsl-hstat-lbl">Shortlisted</div>
                    </div>
                    <div className="rsl-hstat">
                        <div className="rsl-hstat-num">{inInterview}</div>
                        <div className="rsl-hstat-lbl">Interviewing</div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="rsl-controls">
                <div className="rj-search-box" style={{ maxWidth: '320px' }}>
                    <Search size={16} />
                    <input
                        type="text"
                        className="rj-search-input"
                        placeholder="Search candidate name or branch..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 500 }}>Filter by Drive:</span>
                    <select
                        className="ra-select"
                        value={selectedJob}
                        onChange={e => setSelectedJob(e.target.value)}
                    >
                    <option value="All">All Drives ({shortlistedApps.length})</option>
                        {jobs.map(j => (
                            <option key={j._id || j.id} value={j._id || j.id}>{j.role || j.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Groups */}
            {Object.keys(groupedByJob).length === 0 ? (
                <div style={{ background: '#fff', padding: '3.5rem', borderRadius: '14px', textAlign: 'center', color: '#64748b' }}>
                    No candidates currently in the shortlist matching your filter.
                </div>
            ) : (
                <div className="rsl-groups-list">
                    {Object.entries(groupedByJob).map(([jobTitle, candidates]) => (
                        <div key={jobTitle} className="rsl-job-section">
                            <div className="rsl-job-header">
                                <h3>
                                    <Briefcase size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem', color: '#0d9488' }} />
                                    {jobTitle}
                                </h3>
                                <span className="rec-badge new" style={{ fontSize: '0.75rem' }}>
                                    {candidates.length} Candidates
                                </span>
                            </div>

                            <div className="rd-table-wrap">
                                <table className="rsl-candidates-table">
                                    <thead>
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Branch</th>
                                            <th>CGPA</th>
                                            <th>Applied Date</th>
                                            <th>Current Stage</th>
                                            <th>Next Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {candidates.map(app => (
                                            <tr key={app._id || app.id}>
                                                <td>
                                                    <div className="rd-candidate-cell">
                                                        <div className="rd-candidate-avatar">
                                                            {app.candidateName ? app.candidateName[0] : 'C'}
                                                        </div>
                                                        <div className="rd-cand-name">{app.candidateName}</div>
                                                    </div>
                                                </td>
                                                <td>{app.candidateBranch}</td>
                                                <td>
                                                    <strong style={{ color: '#0f766e' }}>{app.candidateCgpa}</strong>
                                                </td>
                                                <td>{app.appliedDate}</td>
                                                <td>
                                                    <span className={`rec-badge ${(app.status || 'new').toLowerCase()}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                        <button
                                                            className="rd-action-btn-sm"
                                                            onClick={() => handleViewCandidate(app)}
                                                        >
                                                            <Eye size={13} /> View
                                                        </button>

                                                        {app.status !== 'Interview' && (
                                                            <button
                                                                className="ra-btn-primary"
                                                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                                                onClick={async () => {
                                                                    const email = app.studentEmail || app.candidateEmail;
                                                                    const cand = await getCandidateProfile(email, app);
                                                                    if (onScheduleInterview) onScheduleInterview(cand, app);
                                                                }}
                                                            >
                                                                <Calendar size={13} /> Schedule Interview
                                                            </button>
                                                        )}

                                                        {app.status !== 'Offered' && (
                                                            <button
                                                                className="rcp-btn offer"
                                                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                                                onClick={() => handleStatusChange(app._id || app.id, 'Offered')}
                                                            >
                                                                <Gift size={13} /> Extend Offer
                                                            </button>
                                                        )}

                                                        <button
                                                            className="ra-btn-reject"
                                                            style={{ padding: '0.35rem 0.55rem' }}
                                                            title="Remove from shortlist"
                                                            onClick={() => handleStatusChange(app._id || app.id, 'Rejected')}
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Candidate Profile Modal */}
            {selectedCandidate && (
                <RecruiterCandidateProfile
                    candidate={selectedCandidate}
                    application={selectedApplication}
                    onClose={() => {
                        setSelectedCandidate(null);
                        setSelectedApplication(null);
                    }}
                    onStatusChange={handleStatusChange}
                    onScheduleInterview={(cand, app) => {
                        setSelectedCandidate(null);
                        setSelectedApplication(null);
                        if (onScheduleInterview) {
                            onScheduleInterview(cand, app);
                        }
                    }}
                />
            )}
        </div>
    );
}
