import React, { useState, useEffect } from 'react';
import {
    Search, Filter, LayoutGrid, List, Eye,
    UserCheck, XCircle, Calendar, Download,
    GraduationCap, Award, Briefcase, ChevronRight,
    CheckCircle2, Clock, Check
} from 'lucide-react';
import RecruiterCandidateProfile from './RecruiterCandidateProfile';
import './RecruiterApplications.css';
import { authFetch } from '../../utils/api';

export default function RecruiterApplications({ user, onScheduleInterview }) {
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJobFilter, setSelectedJobFilter] = useState('All');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
    const [minCgpaFilter, setMinCgpaFilter] = useState(0);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

    // Candidate Detail Modal
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const loadData = async () => {
        try {
            if (!user?.email) return;
            const [appListRes, jListRes] = await Promise.all([
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
            const appList = appListRes.ok ? await appListRes.json() : [];
            const jList = jListRes.ok ? await jListRes.json() : [];
            setApplications(appList || []);
            setJobs(jList || []);
        } catch (e) {
            console.error('Failed to load applications:', e);
        }
    };

    useEffect(() => {
        loadData();

        window.addEventListener('recruiter_applications_updated', loadData);
        window.addEventListener('recruiter_jobs_updated', loadData);
        return () => {
            window.removeEventListener('recruiter_applications_updated', loadData);
            window.removeEventListener('recruiter_jobs_updated', loadData);
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
                if (data?.profile) {
                    const p = data.profile;
                    // Flatten nested personalInfo / academicInfo for RecruiterCandidateProfile
                    return {
                        name: p.personalInfo?.name || p.name || app.candidateName || email.split('@')[0],
                        email: p.personalInfo?.email || p.email || email,
                        phone: p.personalInfo?.phone || p.phone || app.candidatePhone || '',
                        branch: p.academicInfo?.branch || p.branch || app.candidateBranch || 'CSE',
                        cgpa: parseFloat(p.academicInfo?.cgpa || p.cgpa || app.candidateCgpa) || 0,
                        graduationYear: p.academicInfo?.graduationYear || p.graduationYear || '',
                        backlogs: p.academicInfo?.backlogs ?? p.backlogs ?? 0,
                        skills: p.skills || app.candidateSkills || [],
                        projects: p.projects || [],
                        experience: p.experience || [],
                        github: p.personalInfo?.github || p.github || '',
                        linkedin: p.personalInfo?.linkedin || p.linkedin || '',
                        resumeName: p.resume?.name || app.candidateResume || '',
                    };
                }
            }
        } catch (e) {
            console.error('Error fetching candidate profile:', e);
        }
        // Fallback: use what's stored in the application record
        return {
            name: app.candidateName || 'Candidate',
            email: app.studentEmail || app.candidateEmail || email,
            phone: app.candidatePhone || '',
            branch: app.candidateBranch || 'CSE',
            cgpa: app.candidateCgpa || 0,
            skills: app.candidateSkills || [],
            projects: [],
            experience: [],
            github: '',
            linkedin: '',
            resumeName: app.candidateResume || 'Resume.pdf',
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
            console.error('Failed to update application status:', err);
        }
    };

    // Pipeline counts
    const statusCounts = {
        All: applications.length,
        New: applications.filter(a => a.status === 'New').length,
        Shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
        Interview: applications.filter(a => a.status === 'Interview').length,
        Offered: applications.filter(a => a.status === 'Offered').length,
        Rejected: applications.filter(a => a.status === 'Rejected').length,
    };

    // Filtered candidates
    const filteredApplications = applications.filter(app => {
        const q = searchTerm.toLowerCase();
        const candName = (app.candidateName || '').toLowerCase();
        const candBranch = (app.candidateBranch || '').toLowerCase();
        const candSkills = (app.candidateSkills || []).some(s => s.toLowerCase().includes(q));
        const matchesSearch = candName.includes(q) || candBranch.includes(q) || candSkills;

        const matchesJob = selectedJobFilter === 'All' || app.jobId === selectedJobFilter || app.jobTitle === selectedJobFilter;
        const matchesStatus = selectedStatusFilter === 'All' || (app.status || '').toLowerCase() === selectedStatusFilter.toLowerCase();
        const matchesCgpa = !minCgpaFilter || (app.candidateCgpa >= minCgpaFilter);

        return matchesSearch && matchesJob && matchesStatus && matchesCgpa;
    });

    return (
        <div className="ra-container">
            {/* Pipeline Stage Pills */}
            <div className="ra-pipeline-stats">
                {Object.entries(statusCounts).map(([statusKey, count]) => (
                    <button
                        key={statusKey}
                        className={`ra-pstat-pill ${selectedStatusFilter === statusKey ? 'active' : ''}`}
                        onClick={() => setSelectedStatusFilter(statusKey)}
                    >
                        <span>{statusKey === 'All' ? 'All Candidates' : statusKey}</span>
                        <span className="ra-pstat-count">{count}</span>
                    </button>
                ))}
            </div>

            {/* Filter & Search Bar */}
            <div className="ra-controls-bar">
                <div className="ra-filters-left">
                    <div className="ra-search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            className="ra-search-input"
                            placeholder="Search applicant name, branch, or skills..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="ra-select"
                        value={selectedJobFilter}
                        onChange={e => setSelectedJobFilter(e.target.value)}
                    >
                        <option value="All">All Jobs & Drives</option>
                        {jobs.map(job => (
                            <option key={job._id || job.id} value={job._id || job.id}>
                                {job.role || job.title} ({job.company})
                            </option>
                        ))}
                    </select>

                    <select
                        className="ra-select"
                        value={minCgpaFilter}
                        onChange={e => setMinCgpaFilter(parseFloat(e.target.value) || 0)}
                    >
                        <option value={0}>Any CGPA</option>
                        <option value={7.0}>CGPA ≥ 7.0</option>
                        <option value={8.0}>CGPA ≥ 8.0</option>
                        <option value={8.5}>CGPA ≥ 8.5</option>
                        <option value={9.0}>CGPA ≥ 9.0</option>
                    </select>
                </div>

                <div className="ra-view-toggle">
                    <button
                        className={`ra-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid card view"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        className={`ra-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                        title="Table data view"
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Content: Grid or Table */}
            {filteredApplications.length === 0 ? (
                <div style={{ background: '#fff', padding: '3.5rem', borderRadius: '14px', textAlign: 'center', color: '#64748b' }}>
                    No applicant records match your criteria.
                </div>
            ) : viewMode === 'grid' ? (
                <div className="ra-cards-grid">
                    {filteredApplications.map(app => {
                        const targetId = app._id || app.id;
                        return (
                            <div key={targetId} className="ra-candidate-card">
                                <div className="ra-card-top">
                                    <div className="ra-cand-header">
                                        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                                            <div className="ra-cand-avatar">
                                                {app.candidateName ? app.candidateName[0] : 'C'}
                                            </div>
                                            <div className="ra-cand-info">
                                                <h3>{app.candidateName}</h3>
                                                <div className="ra-cand-sub">
                                                    <span>{app.candidateBranch}</span>
                                                    <span>•</span>
                                                    <span style={{ fontWeight: 700, color: '#0f766e' }}>
                                                        CGPA {app.candidateCgpa}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`rec-badge ${(app.status || 'new').toLowerCase()}`}>
                                            {app.status}
                                        </span>
                                    </div>

                                    <div className="ra-job-applied-box">
                                        <div className="ra-job-applied-title">
                                            Applied for: {app.jobTitle || app.role || 'Software Engineer'}
                                        </div>
                                        <div className="ra-job-applied-date">
                                            Submitted on {app.appliedDate || 'Recently'}
                                        </div>
                                    </div>

                                    {app.candidateSkills && app.candidateSkills.length > 0 && (
                                        <div className="ra-cand-skills">
                                            {app.candidateSkills.map((s, idx) => (
                                                <span key={idx} className="ra-skill-pill-sm">{s}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="ra-card-actions">
                                    <button
                                        className="ra-btn-outline"
                                        onClick={() => handleViewCandidate(app)}
                                    >
                                        <Eye size={13} /> Full Profile
                                    </button>

                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        {app.status !== 'Shortlisted' && app.status !== 'Offered' && (
                                            <button
                                                className="ra-btn-shortlist"
                                                onClick={() => handleStatusChange(targetId, 'Shortlisted')}
                                                title="Shortlist candidate"
                                            >
                                                <UserCheck size={13} /> Shortlist
                                            </button>
                                        )}

                                        {app.status !== 'Interview' && (
                                            <button
                                                className="ra-btn-primary"
                                                onClick={async () => {
                                                    const email = app.studentEmail || app.candidateEmail;
                                                    const cand = await getCandidateProfile(email, app);
                                                    if (onScheduleInterview) onScheduleInterview(cand, app);
                                                }}
                                                title="Schedule interview"
                                            >
                                                <Calendar size={13} /> Interview
                                            </button>
                                        )}

                                        {app.status !== 'Rejected' && (
                                            <button
                                                className="ra-btn-reject"
                                                onClick={() => handleStatusChange(targetId, 'Rejected')}
                                                title="Reject"
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Table View */
                <div className="ra-table-card">
                    <div className="ra-table-wrap">
                        <table className="rd-table">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Job Position</th>
                                    <th>CGPA</th>
                                    <th>Key Skills</th>
                                    <th>Applied Date</th>
                                    <th>Status</th>
                                    <th>Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map(app => {
                                    const targetId = app._id || app.id;
                                    return (
                                        <tr key={targetId}>
                                            <td>
                                                <div className="rd-candidate-cell">
                                                    <div className="rd-candidate-avatar">
                                                        {app.candidateName ? app.candidateName[0] : 'C'}
                                                    </div>
                                                    <div>
                                                        <div className="rd-cand-name">{app.candidateName}</div>
                                                        <div className="rd-cand-branch">{app.candidateBranch}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {app.jobTitle || app.role}
                                                </span>
                                            </td>
                                            <td>
                                                <strong style={{ color: '#0f766e', fontSize: '0.92rem' }}>
                                                    {app.candidateCgpa}
                                                </strong>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '200px' }}>
                                                    {(app.candidateSkills || []).slice(0, 3).map((s, i) => (
                                                        <span key={i} className="ra-skill-pill-sm">{s}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                                    {app.appliedDate}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`rec-badge ${(app.status || 'new').toLowerCase()}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                    <button
                                                        className="rd-action-btn-sm"
                                                        onClick={() => handleViewCandidate(app)}
                                                    >
                                                        <Eye size={13} /> View
                                                    </button>
                                                    {app.status !== 'Shortlisted' && app.status !== 'Offered' && (
                                                        <button
                                                            className="ra-btn-shortlist"
                                                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                                                            onClick={() => handleStatusChange(targetId, 'Shortlisted')}
                                                        >
                                                            <UserCheck size={12} />
                                                        </button>
                                                    )}
                                                    {app.status !== 'Rejected' && (
                                                        <button
                                                            className="ra-btn-reject"
                                                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                                                            onClick={() => handleStatusChange(targetId, 'Rejected')}
                                                        >
                                                            <XCircle size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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
