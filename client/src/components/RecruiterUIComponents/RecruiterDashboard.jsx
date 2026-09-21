import React, { useState, useEffect } from 'react';
import {
    Briefcase, Users, UserCheck, Calendar,
    PlusCircle, ArrowRight, Eye, CheckCircle,
    Building, MapPin, Clock, Award, Sparkles, ChevronRight
} from 'lucide-react';
import { recruiterService } from '../../services/recruiterService';
import RecruiterCandidateProfile from './RecruiterCandidateProfile';
import './RecruiterDashboard.css';

export default function RecruiterDashboard({ user, onNavigate, onPostJob, onScheduleInterview }) {
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplicants: 0,
        shortlisted: 0,
        upcomingInterviews: 0,
        offered: 0,
        recentApplications: [],
        allJobs: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const loadData = async () => {
        try {
            const data = await recruiterService.getDashboardStats({ recruiterEmail: user?.email });
            setStats(data);
        } catch (e) {
            console.error('Failed to load recruiter stats:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        window.addEventListener('recruiter_jobs_updated', loadData);
        window.addEventListener('recruiter_applications_updated', loadData);
        window.addEventListener('recruiter_interviews_updated', loadData);
        return () => {
            window.removeEventListener('recruiter_jobs_updated', loadData);
            window.removeEventListener('recruiter_applications_updated', loadData);
            window.removeEventListener('recruiter_interviews_updated', loadData);
        };
    }, []);

    const handleViewCandidate = async (app) => {
        const email = app.studentEmail || app.candidateEmail;
        const cand = await recruiterService.getCandidateProfile(email, app);
        setSelectedCandidate(cand);
        setSelectedApplication(app);
    };

    const handleStatusChange = async (appId, newStatus) => {
        const targetId = appId?._id || appId?.id || appId;
        await recruiterService.updateApplicationStatus(targetId, newStatus);
        setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
        loadData();
    };

    const kpiCards = [
        { label: 'Active Job Openings', value: stats.activeJobs, icon: Briefcase, color: 'teal' },
        { label: 'Total Applications', value: stats.totalApplicants, icon: Users, color: 'blue' },
        { label: 'Shortlisted Pool', value: stats.shortlisted, icon: UserCheck, color: 'amber' },
        { label: 'Interviews Scheduled', value: stats.upcomingInterviews, icon: Calendar, color: 'purple' },
        { label: 'Offers Extended', value: stats.offered, icon: Award, color: 'green' },
    ];

    return (
        <div className="rd-container">
            {/* KPI Stats Grid */}
            <div className="rd-stats-grid">
                {kpiCards.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={idx} className="rd-stat-card">
                            <div className={`rd-stat-icon-wrapper ${kpi.color}`}>
                                <Icon size={24} />
                            </div>
                            <div className="rd-stat-info">
                                <h3>{kpi.label}</h3>
                                <p>{kpi.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions Hero Bar */}
            <div className="rd-quick-actions-bar">
                <div className="rd-qa-text">
                    <h3>Hiring Command Center</h3>
                    <p>Manage recruitment pipelines, evaluate applicants, and organize interview drives.</p>
                </div>
                <div className="rd-qa-btns">
                    <button
                        className="rd-action-btn-primary"
                        onClick={() => {
                            if (onPostJob) onPostJob();
                            else onNavigate('recruiterjobs');
                        }}
                    >
                        <PlusCircle size={16} /> Post New Job
                    </button>
                    <button
                        className="rd-action-btn-secondary"
                        onClick={() => onNavigate('recruiterapplications')}
                    >
                        <Users size={16} /> Candidate Pipeline
                    </button>
                    <button
                        className="rd-action-btn-secondary"
                        onClick={() => onNavigate('recruitershortlist')}
                    >
                        <UserCheck size={16} /> View Shortlist
                    </button>
                </div>
            </div>

            {/* 2-Column Section: Recent Applications & Active Drives */}
            <div className="rd-grid-2col">
                {/* Left: Recent Applications Table */}
                <div className="rd-card">
                    <div className="rd-card-header">
                        <h2>
                            <Users size={18} /> Recent Applicant Submissions
                        </h2>
                        <button
                            className="rd-card-view-all"
                            onClick={() => onNavigate('recruiterapplications')}
                        >
                            View all ({stats.totalApplicants}) <ChevronRight size={15} />
                        </button>
                    </div>

                    <div className="rd-table-wrap">
                        {stats.recentApplications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                No recent applications yet.
                            </div>
                        ) : (
                            <table className="rd-table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job Role</th>
                                        <th>CGPA</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentApplications.map(app => (
                                        <tr key={app.id}>
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
                                                <span style={{ fontWeight: 500, color: '#1e293b' }}>
                                                    {app.jobTitle || 'Software Engineer'}
                                                </span>
                                            </td>
                                            <td>
                                                <strong style={{ color: '#0f766e' }}>{app.candidateCgpa}</strong>
                                            </td>
                                            <td>
                                                <span className={`rec-badge ${app.status.toLowerCase()}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="rd-action-btn-sm"
                                                    onClick={() => handleViewCandidate(app)}
                                                >
                                                    <Eye size={13} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right: Active Job Postings */}
                <div className="rd-card">
                    <div className="rd-card-header">
                        <h2>
                            <Briefcase size={18} /> Active Placement Drives
                        </h2>
                        <button
                            className="rd-card-view-all"
                            onClick={() => onNavigate('recruiterjobs')}
                        >
                            Manage <ChevronRight size={15} />
                        </button>
                    </div>

                    <div className="rd-jobs-list">
                        {stats.allJobs.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                No active job drives found.
                            </div>
                        ) : (
                            stats.allJobs.slice(0, 5).map(job => (
                                <div key={job.id} className="rd-job-row">
                                    <div className="rd-job-info">
                                        <h4>{job.role || job.title}</h4>
                                        <div className="rd-job-meta">
                                            <span><Building size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {job.company}</span>
                                            <span>•</span>
                                            <span><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {job.location}</span>
                                            <span>•</span>
                                            <span>{job.salary}</span>
                                        </div>
                                    </div>
                                    <div className="rd-job-applicants-count">
                                        <div className="rd-job-count-num">
                                            {stats.allApplications.filter(a => a.jobId === job.id).length || job.applicantsCount || 0}
                                        </div>
                                        <div className="rd-job-count-lbl">Applicants</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

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
                        } else {
                            onNavigate('recruiterinterviews');
                        }
                    }}
                />
            )}
        </div>
    );
}
