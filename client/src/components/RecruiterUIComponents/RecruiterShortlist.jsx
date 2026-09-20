import React, { useState, useEffect } from 'react';
import {
    UserCheck, Search, Filter, Calendar, Gift,
    XCircle, Eye, Briefcase, GraduationCap, Award
} from 'lucide-react';
import { recruiterService } from '../../services/recruiterService';
import RecruiterCandidateProfile from './RecruiterCandidateProfile';
import './RecruiterShortlist.css';

export default function RecruiterShortlist({ onScheduleInterview }) {
    const [shortlistedApps, setShortlistedApps] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const loadData = async () => {
        try {
            const [apps, jList] = await Promise.all([
                recruiterService.getShortlisted(),
                recruiterService.getJobs()
            ]);
            setShortlistedApps(apps);
            setJobs(jList);
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
    }, []);

    const handleViewCandidate = (app) => {
        const cand = recruiterService.getCandidateById(app.candidateId) || {
            id: app.candidateId,
            name: app.candidateName,
            email: `${app.candidateName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
            branch: app.candidateBranch,
            cgpa: app.candidateCgpa,
            skills: app.candidateSkills || ['General Aptitude'],
            resumeName: app.candidateResume || `${app.candidateName.replace(/\s+/g, '_')}_Resume.pdf`,
            projects: [],
            experience: []
        };
        setSelectedCandidate(cand);
        setSelectedApplication(app);
    };

    const handleStatusChange = async (appId, newStatus) => {
        await recruiterService.updateApplicationStatus(appId, newStatus);
        setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
        loadData();
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

    const totalShortlisted = shortlistedApps.length;
    const inInterview = shortlistedApps.filter(a => a.status === 'Interview').length;
    const offered = shortlistedApps.filter(a => a.status === 'Offered').length;

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
                        <div className="rsl-hstat-num">{totalShortlisted}</div>
                        <div className="rsl-hstat-lbl">In Shortlist</div>
                    </div>
                    <div className="rsl-hstat">
                        <div className="rsl-hstat-num">{inInterview}</div>
                        <div className="rsl-hstat-lbl">Interviewing</div>
                    </div>
                    <div className="rsl-hstat">
                        <div className="rsl-hstat-num">{offered}</div>
                        <div className="rsl-hstat-lbl">Offers Made</div>
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
                            <option key={j.id} value={j.id}>{j.role || j.title}</option>
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
                                            <tr key={app.id}>
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
                                                    <span className={`rec-badge ${app.status.toLowerCase()}`}>
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
                                                                onClick={() => {
                                                                    const cand = recruiterService.getCandidateById(app.candidateId) || {
                                                                        id: app.candidateId,
                                                                        name: app.candidateName,
                                                                        email: `${app.candidateName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
                                                                        branch: app.candidateBranch,
                                                                        cgpa: app.candidateCgpa
                                                                    };
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
                                                                onClick={() => handleStatusChange(app.id, 'Offered')}
                                                            >
                                                                <Gift size={13} /> Extend Offer
                                                            </button>
                                                        )}

                                                        <button
                                                            className="ra-btn-reject"
                                                            style={{ padding: '0.35rem 0.55rem' }}
                                                            title="Remove from shortlist"
                                                            onClick={() => handleStatusChange(app.id, 'Rejected')}
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
