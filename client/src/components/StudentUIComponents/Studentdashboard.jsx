import React from 'react';
import { Briefcase, CheckCircle, Clock, ChevronRight, Building, MapPin, DollarSign } from 'lucide-react';
import './Studentdashboard.css';

export default function Studentdashboard({ onNavigate }) {
    // Mock data for stats
    const stats = [
        { label: 'Total Applications', value: 12, icon: Briefcase, color: 'blue' },
        { label: 'Shortlisted', value: 4, icon: CheckCircle, color: 'green' },
        { label: 'Interviews', value: 2, icon: Clock, color: 'orange' }
    ];

    // Mock data for recommended jobs
    const recommendedJobs = [
        { id: 1, role: 'Software Engineer', company: 'Google', location: 'Bangalore', salary: '₹24 LPA', type: 'Full-time' },
        { id: 2, role: 'Frontend Developer', company: 'Microsoft', location: 'Hyderabad', salary: '₹20 LPA', type: 'Full-time' },
        { id: 3, role: 'Product Designer', company: 'Atlassian', location: 'Remote', salary: '₹18 LPA', type: 'Full-time' }
    ];

    // Mock data for recent applications
    const recentApplications = [
        { id: 101, role: 'Backend Developer', company: 'Amazon', status: 'applied', date: '2 days ago' },
        { id: 102, role: 'Data Scientist', company: 'Meta', status: 'shortlisted', date: '5 days ago' },
        { id: 103, role: 'UI/UX Designer', company: 'Apple', status: 'interview', date: '1 week ago' },
    ];

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
                        <h2>Recommended Jobs</h2>
                        <button className="view-all-btn" onClick={() => onNavigate('studentjobs')}>
                            View all jobs <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="jobs-list">
                        {recommendedJobs.map(job => (
                            <div key={job.id} className="job-card">
                                <div className="job-header">
                                    <div>
                                        <h3 className="job-title">{job.role}</h3>
                                        <p className="job-company">
                                            <Building size={14} /> {job.company}
                                        </p>
                                    </div>
                                    <button className="apply-btn">Apply Now</button>
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
                        ))}
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
                        {recentApplications.map(app => (
                            <div key={app.id} className="application-item">
                                <div className="app-info">
                                    <h4>{app.role}</h4>
                                    <p>{app.company}</p>
                                </div>
                                <div className="app-status">
                                    <span className={`status-badge ${app.status}`}>
                                        {app.status}
                                    </span>
                                    <span className="app-date">{app.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
