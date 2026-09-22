import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, Video, User, Briefcase,
    CheckCircle, XCircle, PlusCircle, ExternalLink,
    Eye, Edit3, MessageSquare, AlertCircle, X, Check
} from 'lucide-react';
import RecruiterCandidateProfile from './RecruiterCandidateProfile';
import './RecruiterInterviews.css';
import { authFetch } from '../../utils/api';

export default function RecruiterInterviews({ user, initialScheduleTarget, onScheduleHandled }) {
    const [interviews, setInterviews] = useState([]);
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('scheduled'); // 'scheduled' | 'completed' | 'cancelled'

    // Schedule Modal
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({
        candidateId: '',
        candidateName: '',
        candidateBranch: 'CSE',
        candidateCgpa: 8.5,
        jobId: '',
        jobTitle: '',
        company: 'Company',
        date: '2026-09-28',
        displayDate: '28 Sep 2026',
        time: '11:00 AM - 12:00 PM IST',
        round: 'Technical Round 1',
        platform: 'Google Meet',
        meetLink: 'https://meet.google.com/xyz-recruiter-demo',
        applicationId: ''
    });

    // Complete / Evaluate Modal
    const [evaluatingInterview, setEvaluatingInterview] = useState(null);
    const [evalResult, setEvalResult] = useState('Selected');
    const [evalFeedback, setEvalFeedback] = useState('');

    // Candidate Profile
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const loadData = async () => {
        try {
            if (!user?.email) return;
            const [intRes, appRes, jobRes] = await Promise.all([
                authFetch('http://localhost:5000/api/interviews/by-recruiter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                }),
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
            const intList = intRes.ok ? await intRes.json() : [];
            const appList = appRes.ok ? await appRes.json() : [];
            const jList = jobRes.ok ? await jobRes.json() : [];
            setInterviews(intList || []);
            setApplications(appList || []);
            setJobs(jList || []);
        } catch (e) {
            console.error('Failed to load interviews:', e);
        }
    };

    useEffect(() => {
        loadData();

        window.addEventListener('recruiter_interviews_updated', loadData);
        window.addEventListener('recruiter_applications_updated', loadData);
        return () => {
            window.removeEventListener('recruiter_interviews_updated', loadData);
            window.removeEventListener('recruiter_applications_updated', loadData);
        };
    }, [user?.email]);

    // If passed target from another screen
    useEffect(() => {
        if (initialScheduleTarget) {
            const { candidate, application } = initialScheduleTarget;
            const sEmail = candidate?.email || application?.studentEmail || application?.candidateEmail || '';
            setScheduleForm(prev => ({
                ...prev,
                candidateId: candidate?.id || candidate?._id || application?.candidateId || 'STU-001',
                candidateName: candidate?.name || application?.candidateName || 'Student Candidate',
                candidateEmail: sEmail,
                studentEmail: sEmail,
                candidateBranch: candidate?.branch || application?.candidateBranch || 'CSE',
                candidateCgpa: candidate?.cgpa !== undefined ? candidate.cgpa : (application?.candidateCgpa || 8.0),
                jobId: application?.jobId || '',
                jobTitle: application?.jobTitle || application?.role || 'Software Engineer',
                company: application?.company || 'Company',
                applicationId: application?._id || application?.id || ''
            }));
            setShowScheduleModal(true);
            if (onScheduleHandled) onScheduleHandled();
        }
    }, [initialScheduleTarget]);

    const handleOpenScheduleModal = () => {
        const firstApp = applications[0];
        const sEmail = firstApp ? (firstApp.studentEmail || firstApp.candidateEmail || '') : '';
        setScheduleForm({
            candidateId: firstApp ? (firstApp.candidateId || firstApp._id || firstApp.id) : 'STU-001',
            candidateName: firstApp ? firstApp.candidateName : 'Student Candidate',
            candidateEmail: sEmail,
            studentEmail: sEmail,
            candidateBranch: firstApp ? firstApp.candidateBranch : 'CSE',
            candidateCgpa: firstApp ? firstApp.candidateCgpa : 8.5,
            jobId: firstApp ? firstApp.jobId : (jobs[0]?._id || jobs[0]?.id || ''),
            jobTitle: firstApp ? (firstApp.jobTitle || firstApp.role) : (jobs[0]?.role || 'Software Engineer'),
            company: firstApp?.company || jobs[0]?.company || 'Company',
            date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            displayDate: 'Upcoming',
            time: '11:00 AM - 12:00 PM IST',
            round: 'Technical Round 1 (DSA & Problem Solving)',
            platform: 'Google Meet',
            meetLink: 'https://meet.google.com/xyz-recruiter-demo',
            applicationId: firstApp ? (firstApp._id || firstApp.id) : ''
        });
        setShowScheduleModal(true);
    };

    const handleCandidateSelect = (candId) => {
        const app = applications.find(a => (a.candidateId === candId || a.id === candId || a._id === candId)) || applications[0];
        if (app) {
            const sEmail = app.studentEmail || app.candidateEmail || '';
            setScheduleForm(prev => ({
                ...prev,
                candidateId: app.candidateId || app._id || app.id,
                candidateName: app.candidateName,
                candidateEmail: sEmail,
                studentEmail: sEmail,
                candidateBranch: app.candidateBranch,
                candidateCgpa: app.candidateCgpa,
                jobId: app.jobId,
                jobTitle: app.jobTitle || app.role,
                company: app.company,
                applicationId: app._id || app.id
            }));
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        let displayDate = scheduleForm.date;
        try {
            const d = new Date(scheduleForm.date);
            displayDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (err) { /* ignore */ }

        try {
            const res = await authFetch('http://localhost:5000/api/interviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...scheduleForm,
                    recruiterEmail: user?.email || '',
                    displayDate
                })
            });
            if (res.ok) {
                setShowScheduleModal(false);
                loadData();
                window.dispatchEvent(new Event('recruiter_interviews_updated'));
            }
        } catch (err) {
            console.error('Error scheduling interview:', err);
        }
    };

    const handleCancelInterview = async (id) => {
        if (window.confirm('Are you sure you want to cancel this scheduled interview?')) {
            try {
                await authFetch(`http://localhost:5000/api/interviews/${id}`, { method: 'DELETE' });
                loadData();
                window.dispatchEvent(new Event('recruiter_interviews_updated'));
            } catch (err) {
                console.error('Error cancelling interview:', err);
            }
        }
    };

    const handleCompleteEvaluation = async (e) => {
        e.preventDefault();
        if (!evaluatingInterview) return;

        const targetId = evaluatingInterview._id || evaluatingInterview.id;
        try {
            await authFetch(`http://localhost:5000/api/interviews/${targetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'completed',
                    result: evalResult,
                    feedback: evalFeedback || (evalResult === 'Selected' ? 'Candidate performed exceptionally well.' : 'Candidate needs further improvement.')
                })
            });

            if (evaluatingInterview.applicationId) {
                await authFetch(`http://localhost:5000/api/applications/${evaluatingInterview.applicationId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: evalResult === 'Selected' ? 'Offered' : 'Rejected' })
                });
            }

            setEvaluatingInterview(null);
            setEvalFeedback('');
            loadData();
            window.dispatchEvent(new Event('recruiter_interviews_updated'));
        } catch (err) {
            console.error('Error recording interview evaluation:', err);
        }
    };

    const getCandidateProfile = async (email, interview) => {
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
            name: interview.candidateName || 'Candidate',
            email: interview.studentEmail || interview.candidateEmail || email,
            branch: interview.candidateBranch || 'CSE',
            cgpa: interview.candidateCgpa || 0,
            skills: ['Problem Solving', 'Data Structures', 'Communication'],
            resume: { name: `${interview.candidateName?.replace(/\s+/g, '_')}_Resume.pdf` }
        };
    };

    const handleViewCandidate = async (interview) => {
        const email = interview.studentEmail || interview.candidateEmail;
        const cand = await getCandidateProfile(email, interview);
        const app = applications.find(a => (a.candidateId === interview.candidateId || a._id === interview.applicationId)) || {
            _id: interview.applicationId || 'APP-01',
            jobTitle: interview.jobTitle,
            status: interview.status === 'completed' ? interview.result || 'Interview' : 'Interview'
        };
        setSelectedCandidate(cand);
        setSelectedApplication(app);
    };

    const filteredInterviews = interviews.filter(i => {
        if (activeTab === 'scheduled') return i.status === 'scheduled';
        if (activeTab === 'completed') return i.status === 'completed';
        if (activeTab === 'cancelled') return i.status === 'cancelled';
        return true;
    });

    const scheduledCount = interviews.filter(i => i.status === 'scheduled').length;
    const completedCount = interviews.filter(i => i.status === 'completed').length;
    const cancelledCount = interviews.filter(i => i.status === 'cancelled').length;

    return (
        <div className="ri-container">
            {/* Header & Navigation */}
            <div className="ri-header-row">
                <div className="ri-tabs-nav">
                    <button
                        className={`ri-tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('scheduled')}
                    >
                        <Clock size={16} /> Scheduled ({scheduledCount})
                    </button>
                    <button
                        className={`ri-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        <CheckCircle size={16} /> Completed ({completedCount})
                    </button>
                    <button
                        className={`ri-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cancelled')}
                    >
                        <XCircle size={16} /> Cancelled ({cancelledCount})
                    </button>
                </div>

                <button className="ri-schedule-cta" onClick={handleOpenScheduleModal}>
                    <PlusCircle size={17} /> + Schedule New Interview
                </button>
            </div>

            {/* Interviews List */}
            {filteredInterviews.length === 0 ? (
                <div style={{ background: '#fff', padding: '3.5rem', borderRadius: '14px', textAlign: 'center', color: '#64748b' }}>
                    No interviews found in the <strong>{activeTab}</strong> tab.
                </div>
            ) : (
                <div className="ri-cards-list">
                    {filteredInterviews.map(item => {
                        const targetId = item._id || item.id;
                        return (
                            <div key={targetId} className="ri-interview-card">
                                <div className="ri-card-top">
                                    <div className="ri-cand-main">
                                        <div className="ri-cand-avatar">
                                            {item.candidateName ? item.candidateName[0] : 'C'}
                                        </div>
                                        <div className="ri-cand-titles">
                                            <h3>{item.candidateName}</h3>
                                            <div className="ri-job-tag">
                                                <Briefcase size={14} />
                                                <span>{item.jobTitle}</span>
                                                <span>•</span>
                                                <span style={{ color: '#0f766e', fontWeight: 600 }}>{item.candidateBranch} (CGPA: {item.candidateCgpa})</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <span className={`rec-badge ${item.status === 'scheduled' ? 'interview' : item.status === 'completed' ? (item.result === 'Selected' ? 'offered' : 'rejected') : 'closed'}`}>
                                            {item.status === 'completed' ? `Completed • ${item.result || 'Done'}` : item.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="ri-details-grid">
                                    <div className="ri-detail-item">
                                        <Calendar size={15} />
                                        <span>Date: <strong>{item.displayDate || item.date}</strong></span>
                                    </div>
                                    <div className="ri-detail-item">
                                        <Clock size={15} />
                                        <span>Time: <strong>{item.time}</strong></span>
                                    </div>
                                    <div className="ri-detail-item">
                                        <CheckCircle size={15} />
                                        <span>Round: <strong>{item.round}</strong></span>
                                    </div>
                                    <div className="ri-detail-item">
                                        <Video size={15} />
                                        <span>Platform: <strong>{item.platform || 'Google Meet'}</strong></span>
                                    </div>
                                </div>

                                {/* Evaluation result box if completed */}
                                {item.status === 'completed' && (
                                    <div className={`ri-feedback-box ${item.result === 'Not Selected' ? 'not-selected' : ''}`}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
                                            Interviewer Assessment Result: {item.result}
                                        </div>
                                        <div style={{ fontSize: '0.84rem' }}>
                                            {item.feedback || 'No evaluation notes recorded.'}
                                        </div>
                                    </div>
                                )}

                                {/* Card Footer */}
                                <div className="ri-card-footer">
                                    <div>
                                        {item.status === 'scheduled' && (item.meetLink || item.meetingLink) && (
                                            <a
                                                href={item.meetLink || item.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ri-meet-link-btn"
                                            >
                                                <Video size={14} /> Join {item.platform || 'Meeting'} <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>

                                    <div className="ri-actions-btns">
                                        <button
                                            className="rd-action-btn-sm"
                                            onClick={() => handleViewCandidate(item)}
                                        >
                                            <Eye size={13} /> Candidate Profile
                                        </button>

                                        {item.status === 'scheduled' && (
                                            <>
                                                <button
                                                    className="ra-btn-primary"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                    onClick={() => {
                                                        setEvaluatingInterview(item);
                                                        setEvalResult('Selected');
                                                        setEvalFeedback('');
                                                    }}
                                                >
                                                    <CheckCircle size={13} /> Complete & Evaluate
                                                </button>
                                                <button
                                                    className="ra-btn-reject"
                                                    style={{ padding: '0.4rem 0.65rem' }}
                                                    onClick={() => handleCancelInterview(targetId)}
                                                    title="Cancel this interview"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Schedule Interview Modal */}
            {showScheduleModal && (
                <div className="rec-modal-backdrop" onClick={() => setShowScheduleModal(false)}>
                    <div className="rj-modal" onClick={e => e.stopPropagation()}>
                        <div className="rj-modal-header">
                            <h2>Schedule Candidate Interview</h2>
                            <button className="rcp-close-btn" onClick={() => setShowScheduleModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                            <div className="rj-modal-body">
                                <div className="rj-form-group">
                                    <label className="rj-form-label">Select Candidate *</label>
                                    <select
                                        className="rj-form-select"
                                        value={scheduleForm.candidateId}
                                        onChange={e => handleCandidateSelect(e.target.value)}
                                        required
                                    >
                                        {applications.map(app => (
                                            <option key={app._id || app.id} value={app.candidateId || app._id || app.id}>
                                                {app.candidateName} — {app.jobTitle || app.role} ({app.candidateBranch}, CGPA: {app.candidateCgpa})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="rj-form-row-2">
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Interview Date *</label>
                                        <input
                                            type="date"
                                            className="rj-form-input"
                                            required
                                            value={scheduleForm.date}
                                            onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                                        />
                                    </div>

                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Time Slot *</label>
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            required
                                            value={scheduleForm.time}
                                            onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                                            placeholder="e.g. 10:30 AM - 11:30 AM IST"
                                        />
                                    </div>
                                </div>

                                <div className="rj-form-row-2">
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Interview Round Type</label>
                                        <select
                                            className="rj-form-select"
                                            value={scheduleForm.round}
                                            onChange={e => setScheduleForm({ ...scheduleForm, round: e.target.value })}
                                        >
                                            <option value="Technical Round 1 (DSA & Problem Solving)">Technical Round 1 (DSA & Problem Solving)</option>
                                            <option value="Technical Round 2 (System Design & Core)">Technical Round 2 (System Design & Core)</option>
                                            <option value="Technical + Managerial Round">Technical + Managerial Round</option>
                                            <option value="Culture Fit & HR Round">Culture Fit & HR Round</option>
                                            <option value="Final Executive Round">Final Executive Round</option>
                                        </select>
                                    </div>

                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Platform</label>
                                        <select
                                            className="rj-form-select"
                                            value={scheduleForm.platform}
                                            onChange={e => setScheduleForm({ ...scheduleForm, platform: e.target.value })}
                                        >
                                            <option value="Google Meet">Google Meet</option>
                                            <option value="Microsoft Teams">Microsoft Teams</option>
                                            <option value="Zoom">Zoom</option>
                                            <option value="In-Person Campus Placement Cell">In-Person Campus Placement Cell</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="rj-form-group">
                                    <label className="rj-form-label">Meeting URL / Room Link</label>
                                    <input
                                        type="url"
                                        className="rj-form-input"
                                        value={scheduleForm.meetLink}
                                        onChange={e => setScheduleForm({ ...scheduleForm, meetLink: e.target.value })}
                                        placeholder="https://meet.google.com/..."
                                    />
                                </div>
                            </div>

                            <div className="rj-modal-footer">
                                <button
                                    type="button"
                                    className="rj-action-btn"
                                    onClick={() => setShowScheduleModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rj-post-btn"
                                >
                                    Confirm & Schedule Slot
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complete & Evaluate Modal */}
            {evaluatingInterview && (
                <div className="rec-modal-backdrop" onClick={() => setEvaluatingInterview(null)}>
                    <div className="rj-modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                        <div className="rj-modal-header">
                            <h2>Interview Evaluation: {evaluatingInterview.candidateName}</h2>
                            <button className="rcp-close-btn" onClick={() => setEvaluatingInterview(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCompleteEvaluation} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div className="rj-modal-body">
                                <div className="rj-form-group">
                                    <label className="rj-form-label">Outcome / Verdict</label>
                                    <select
                                        className="rj-form-select"
                                        value={evalResult}
                                        onChange={e => setEvalResult(e.target.value)}
                                    >
                                        <option value="Selected">Selected / Recommended for Offer</option>
                                        <option value="Next Round">Passed to Next Round</option>
                                        <option value="On Hold">On Hold / Waitlist</option>
                                        <option value="Not Selected">Not Selected / Reject</option>
                                    </select>
                                </div>

                                <div className="rj-form-group">
                                    <label className="rj-form-label">Feedback & Technical Assessment Notes</label>
                                    <textarea
                                        rows={4}
                                        className="rj-form-textarea"
                                        value={evalFeedback}
                                        onChange={e => setEvalFeedback(e.target.value)}
                                        placeholder="Enter observations on coding speed, system fundamentals, and cultural fit..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="rj-modal-footer">
                                <button
                                    type="button"
                                    className="rj-action-btn"
                                    onClick={() => setEvaluatingInterview(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rj-post-btn"
                                >
                                    Save Evaluation
                                </button>
                            </div>
                        </form>
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
                    onStatusChange={async (appId, status) => {
                        const targetId = appId?._id || appId?.id || appId;
                        try {
                            await authFetch(`http://localhost:5000/api/applications/${targetId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status })
                            });
                            loadData();
                        } catch (e) {
                            console.error('Error updating application status:', e);
                        }
                    }}
                />
            )}
        </div>
    );
}
