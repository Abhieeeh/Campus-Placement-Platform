import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Clock, ChevronRight, Building, MapPin, DollarSign, ArrowRight, Check } from 'lucide-react';
import { placementService } from '../../services/placementService';
import './Studentdashboard.css';

export default function Studentdashboard({ onNavigate }) {
    const [dashboardData, setDashboardData] = useState({
        stats: { totalApplications: 0, shortlisted: 0, interviews: 0 },
        recentApplications: [],
        recommendedJobs: []
    });
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await placementService.getDashboardData();
            setDashboardData(data);
        } catch (e) {
            // handle error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        window.addEventListener('student_applications_updated', loadData);
        window.addEventListener('dashboard_stats_updated', loadData);
        window.addEventListener('storage', loadData);
        return () => {
            window.removeEventListener('student_applications_updated', loadData);
            window.removeEventListener('dashboard_stats_updated', loadData);
            window.removeEventListener('storage', loadData);
        };
    }, []);

    // Stats dynamically computed
    const stats = [
        { label: 'Total Applications', value: dashboardData.stats.totalApplications, icon: Briefcase, color: 'blue' },
        { label: 'Shortlisted', value: dashboardData.stats.shortlisted, icon: CheckCircle, color: 'green' },
        { label: 'Upcoming Interviews', value: dashboardData.stats.interviews, icon: Clock, color: 'orange' }
    ];

    const appliedJobIds = new Set(dashboardData.recentApplications.map(a => a.jobId));

    return (
        <div className="dashboard-container">
            {/* 1. Stats Section */}
            <div className="stats-grid">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="stat-card">
                            <div className={`stat-icon-wrapper ${stat.color}`}>
                                <Icon size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>{stat.label}</h3>
                                <p>{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-grid">
                {/* 2. Recommended Jobs Section */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Recommended Placement Drives</h2>
                        <button className="view-all-btn" onClick={() => onNavigate('studentjobs')}>
                            View all jobs <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="jobs-list">
                        {dashboardData.recommendedJobs.length === 0 ? (
                            <p style={{ color: '#64748b', fontSize: '0.9rem', padding: '1rem' }}>No active job drives available.</p>
                        ) : (
                            dashboardData.recommendedJobs.map(job => (
                                <div key={job.id} className="job-card">
                                    <div className="job-header">
                                        <div>
                                            <h3 className="job-title">{job.role}</h3>
                                            <p className="job-company">
                                                <Building size={14} /> {job.company}
                                            </p>
                                        </div>
                                        {appliedJobIds.has(job.id) ? (
                                            <button className="apply-btn" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }} disabled>
                                                <Check size={13} /> Applied
                                            </button>
                                        ) : (
                                            <button className="apply-btn" onClick={() => onNavigate('studentjobs')}>
                                                Apply Now
                                            </button>
                                        )}
                                    </div>
                                    <div className="job-tags">
                                        <span className="job-tag">
                                            <MapPin size={12} /> {job.location}
                                        </span>
                                        <span className="job-tag">
                                            <DollarSign size={12} /> {job.salary}
                                        </span>
                                        <span className="job-tag">{job.type}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. Recent Applications Status Section */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Recent Applications</h2>
                        <button className="view-all-btn" onClick={() => onNavigate('studentapplications')}>
                            View all <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="applications-list">
                        {dashboardData.recentApplications.length === 0 ? (
                            <p style={{ color: '#64748b', fontSize: '0.9rem', padding: '1rem' }}>You have not submitted any applications yet.</p>
                        ) : (
                            dashboardData.recentApplications.map(app => (
                                <div key={app.id} className="application-item">
                                    <div className="app-info">
                                        <h4>{app.role}</h4>
                                        <p>{app.company}</p>
                                    </div>
                                    <div className="app-status">
                                        <span className={`status-badge ${app.status.toLowerCase()}`}>
                                            {app.status}
                                        </span>
                                        <span className="app-date">{app.appliedDate}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
