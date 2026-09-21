import React from 'react';
import {
    X, Mail, Phone, MapPin, GraduationCap, Award,
    Briefcase, Code2, Download, FileText, ExternalLink,
    CheckCircle, Calendar, XCircle, Gift, UserCheck
} from 'lucide-react';
import './RecruiterCandidateProfile.css';

export default function RecruiterCandidateProfile({
    candidate,
    application,
    onClose,
    onStatusChange,
    onScheduleInterview
}) {
    if (!candidate) return null;

    const initial = candidate.name ? candidate.name[0].toUpperCase() : 'C';

    const handleStatusUpdate = (newStatus) => {
        if (application && onStatusChange) {
            // Prefer _id (MongoDB ObjectId) over virtual id field
            onStatusChange(application._id || application.id, newStatus);
        }
    };

    const handleDownloadResume = () => {
        // Create simulation download for student's resume
        const blob = new Blob([
            `RESUME: ${candidate.name}\nEmail: ${candidate.email}\nBranch: ${candidate.branch} | CGPA: ${candidate.cgpa}\nSkills: ${candidate.skills?.join(', ')}\n\nProjects:\n${candidate.projects?.map(p => `- ${p.title}: ${p.description}`).join('\n')}\n\nExperience:\n${candidate.experience?.map(e => `- ${e.role} at ${e.company} (${e.duration})`).join('\n')}`
        ], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = candidate.resumeName || `${candidate.name.replace(/\s+/g, '_')}_Resume.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const currentStatus = application?.status || 'New';

    return (
        <div className="rec-modal-backdrop" onClick={onClose}>
            <div className="rcp-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="rcp-header">
                    <div className="rcp-header-left">
                        <div className="rcp-avatar-large">{initial}</div>
                        <div className="rcp-title-group">
                            <h2>{candidate.name}</h2>
                            <div className="rcp-meta-badges">
                                <span className="rcp-meta-tag">
                                    <GraduationCap size={14} /> {candidate.branch} ({candidate.graduationYear || '2027'})
                                </span>
                                <span className="rcp-meta-tag cgpa">
                                    <Award size={14} /> CGPA: {candidate.cgpa} / 10.0
                                </span>
                                <span className="rcp-meta-tag">
                                    Backlogs: {candidate.backlogs ?? 0}
                                </span>
                                {application?.jobTitle && (
                                    <span className="rcp-meta-tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                                        Applied: {application.jobTitle}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button className="rcp-close-btn" onClick={onClose} aria-label="Close modal">
                        <X size={22} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="rcp-body">
                    {/* Contact & Links */}
                    <div className="rcp-section">
                        <div className="rcp-section-title">
                            <Mail size={16} /> Contact & Profiles
                        </div>
                        <div className="rcp-contact-grid">
                            <div className="rcp-contact-item">
                                <Mail size={15} />
                                <span>{candidate.email}</span>
                            </div>
                            <div className="rcp-contact-item">
                                <Phone size={15} />
                                <span>{candidate.phone || '+91 98765 43210'}</span>
                            </div>
                            {candidate.github && (
                                <div className="rcp-contact-item">
                                    <ExternalLink size={15} />
                                    <a href={candidate.github} target="_blank" rel="noopener noreferrer">GitHub Profile</a>
                                </div>
                            )}
                            {candidate.linkedin && (
                                <div className="rcp-contact-item">
                                    <ExternalLink size={15} />
                                    <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn Profile</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resume Document */}
                    <div className="rcp-section">
                        <div className="rcp-section-title">
                            <FileText size={16} /> Resume Document
                        </div>
                        <div className="rcp-resume-box">
                            <div className="rcp-resume-left">
                                <FileText size={26} className="rcp-pdf-icon" />
                                <div>
                                    <div className="rcp-resume-name">{candidate.resumeName || `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf`}</div>
                                    <div className="rcp-resume-size">Verified Student Document • Updated recently</div>
                                </div>
                            </div>
                            <button className="rcp-download-btn" onClick={handleDownloadResume}>
                                <Download size={14} /> Download Resume
                            </button>
                        </div>
                    </div>

                    {/* Technical Skills */}
                    <div className="rcp-section">
                        <div className="rcp-section-title">
                            <Code2 size={16} /> Technical Skills & Competencies
                        </div>
                        <div className="rcp-skills-wrap">
                            {candidate.skills && candidate.skills.length > 0 ? (
                                candidate.skills.map((skill, idx) => (
                                    <span key={idx} className="rcp-skill-pill">{skill}</span>
                                ))
                            ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No skills listed</span>
                            )}
                        </div>
                    </div>

                    {/* Experience Section */}
                    {candidate.experience && candidate.experience.length > 0 && (
                        <div className="rcp-section">
                            <div className="rcp-section-title">
                                <Briefcase size={16} /> Work Experience / Internships
                            </div>
                            <div className="rcp-card-list">
                                {candidate.experience.map((exp, idx) => (
                                    <div key={idx} className="rcp-entry-card">
                                        <div className="rcp-entry-header">
                                            <span className="rcp-entry-title">{exp.role}</span>
                                            <span className="rcp-entry-duration">{exp.duration}</span>
                                        </div>
                                        <div className="rcp-entry-company">{exp.company}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects Section */}
                    {candidate.projects && candidate.projects.length > 0 && (
                        <div className="rcp-section">
                            <div className="rcp-section-title">
                                <Award size={16} /> Notable Academic & Personal Projects
                            </div>
                            <div className="rcp-card-list">
                                {candidate.projects.map((proj, idx) => (
                                    <div key={idx} className="rcp-entry-card">
                                        <div className="rcp-entry-header">
                                            <span className="rcp-entry-title">{proj.title}</span>
                                        </div>
                                        <p className="rcp-entry-desc">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action Bar */}
                {application && (
                    <div className="rcp-footer">
                        <div className="rcp-status-curr">
                            <span>Status:</span>
                            <span className={`rec-badge ${currentStatus.toLowerCase()}`}>
                                {currentStatus}
                            </span>
                        </div>
                        <div className="rcp-action-buttons">
                            {currentStatus !== 'Rejected' && (
                                <button
                                    className="rcp-btn reject"
                                    onClick={() => handleStatusUpdate('Rejected')}
                                    title="Reject candidate"
                                >
                                    <XCircle size={15} /> Reject
                                </button>
                            )}

                            {currentStatus !== 'Shortlisted' && currentStatus !== 'Offered' && (
                                <button
                                    className="rcp-btn shortlist"
                                    onClick={() => handleStatusUpdate('Shortlisted')}
                                    title="Shortlist for interviews"
                                >
                                    <UserCheck size={15} /> Shortlist
                                </button>
                            )}

                            <button
                                className="rcp-btn interview"
                                onClick={() => {
                                    if (onScheduleInterview) {
                                        onScheduleInterview(candidate, application);
                                    }
                                }}
                                title="Schedule an interview"
                            >
                                <Calendar size={15} /> Schedule Interview
                            </button>

                            {currentStatus !== 'Offered' && (
                                <button
                                    className="rcp-btn offer"
                                    onClick={() => handleStatusUpdate('Offered')}
                                    title="Extend job offer"
                                >
                                    <Gift size={15} /> Extend Offer
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
