import React, { useState, useEffect, useRef } from 'react';
import {
    Edit2, Mail, Phone, BookOpen, Award, Calendar, AlertTriangle,
    CheckCircle, FileText, Upload, Eye, X, Plus, Briefcase, GitBranch, Trash2,
    ExternalLink, Globe
} from 'lucide-react';
import './Studentprofile.css';

function nameFromEmail(email = '') {
    return email
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

export default function Studentprofile({ user }) {
    const [isEditing, setIsEditing] = useState(false);

    const getInitialPersonal = () => ({
        name: user?.name || nameFromEmail(user?.email) || 'Student',
        dept: 'Computer Science & Engineering',
        email: user?.email || '',
        phone: '',
        github: '',
        linkedin: ''
    });

    const getInitialAcademic = () => ({
        branch: 'CSE',
        cgpa: '',
        graduationYear: String(new Date().getFullYear() + 1),
        backlogs: '0'
    });

    const [personalInfo, setPersonalInfo] = useState(getInitialPersonal);
    const [academicInfo, setAcademicInfo] = useState(getInitialAcademic);
    const [skills, setSkills] = useState(['React', 'JavaScript', 'Python', 'Node.js', 'SQL']);
    const [projects, setProjects] = useState([]);
    const [resumeData, setResumeData] = useState({
        name: 'No resume uploaded',
        size: '0 KB',
        lastUpdated: 'Not uploaded yet'
    });
    const [newSkill, setNewSkill] = useState('');
    const [showAddProject, setShowAddProject] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', github: '', description: '' });
    const [projectError, setProjectError] = useState('');
    const resumeInputRef = useRef(null);

    // Fetch from MongoDB studentprofile collection
    const fetchStudentProfile = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/auth/student-profile/${encodeURIComponent(user.email)}`);
            if (res.ok) {
                const data = await res.json();
                if (data?.profile) {
                    const prof = data.profile;
                    if (prof.personalInfo) {
                        setPersonalInfo({
                            ...getInitialPersonal(),
                            ...prof.personalInfo,
                            email: user.email
                        });
                    }
                    if (prof.academicInfo) {
                        setAcademicInfo(prof.academicInfo);
                    }
                    if (Array.isArray(prof.skills) && prof.skills.length > 0) {
                        setSkills(prof.skills);
                    }
                    if (Array.isArray(prof.projects)) {
                        setProjects(prof.projects);
                    }
                    if (prof.resume && prof.resume.name) {
                        setResumeData(prof.resume);
                    }
                }
            } else {
                setPersonalInfo(getInitialPersonal());
                setAcademicInfo(getInitialAcademic());
            }
        } catch (e) {
            // offline fallback
        }
    };

    useEffect(() => {
        fetchStudentProfile();
        window.addEventListener('student_profile_updated', fetchStudentProfile);
        return () => {
            window.removeEventListener('student_profile_updated', fetchStudentProfile);
        };
    }, [user?.email]);

    const saveProfileToBackend = async (personal, academic, updatedSkills, updatedProjects, updatedResume) => {
        try {
            await fetch('http://localhost:5000/api/auth/student-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email || personal.email,
                    personalInfo: personal,
                    academicInfo: academic,
                    skills: updatedSkills,
                    projects: updatedProjects,
                    resume: updatedResume
                })
            });
            window.dispatchEvent(new Event('student_profile_updated'));
        } catch (err) {
            // Ignore offline/server errors
        }
    };

    const handleToggleEdit = async () => {
        if (isEditing) {
            await saveProfileToBackend(personalInfo, academicInfo, skills, projects, resumeData);
        }
        setIsEditing(!isEditing);
    };

    const isEligible = Number(academicInfo.cgpa) >= 6.0 && Number(academicInfo.backlogs) === 0;
    const skilllen = skills.length;
    const projectlen = projects.length;

    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const updated = {
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                lastUpdated: 'Just now'
            };
            setResumeData(updated);
            await saveProfileToBackend(personalInfo, academicInfo, skills, projects, updated);
        }
    };

    const handleAddSkill = async (e) => {
        if (e.key === 'Enter' && newSkill.trim() !== '') {
            if (!skills.includes(newSkill.trim())) {
                const updated = [...skills, newSkill.trim()];
                setSkills(updated);
                await saveProfileToBackend(personalInfo, academicInfo, updated, projects, resumeData);
            }
            setNewSkill('');
        }
    };

    const removeSkill = async (skillToRemove) => {
        const updated = skills.filter(s => s !== skillToRemove);
        setSkills(updated);
        await saveProfileToBackend(personalInfo, academicInfo, updated, projects, resumeData);
    };

    const removeProject = async (id) => {
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        await saveProfileToBackend(personalInfo, academicInfo, skills, updated, resumeData);
    };

    const handleAddProject = async () => {
        if (!newProject.title.trim()) { setProjectError('Project name is required.'); return; }
        if (!newProject.github.trim()) { setProjectError('GitHub URL is required.'); return; }
        const updated = [...projects, { id: Date.now(), ...newProject }];
        setProjects(updated);
        setNewProject({ title: '', github: '', description: '' });
        setProjectError('');
        setShowAddProject(false);
        await saveProfileToBackend(personalInfo, academicInfo, skills, updated, resumeData);
    };

    const closeModal = () => {
        setShowAddProject(false);
        setNewProject({ title: '', github: '', description: '' });
        setProjectError('');
    };

    const displayName = personalInfo.name || nameFromEmail(user?.email) || 'Student';

    return (
        <div className="profile-container">
            {/* Header */}
            <div className="profile-header">
                <div className="profile-title">
                    <div className="avatar-large">{displayName.charAt(0).toUpperCase()}</div>
                    <div>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={personalInfo.name}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                                /><br />
                            </>
                        ) :
                            <h2>{displayName}</h2>
                        }
                        {isEditing ? (
                            <input
                                type="text"
                                value={personalInfo.dept}
                                onChange={(e) => setPersonalInfo({ ...personalInfo, dept: e.target.value })}
                            />
                        ) : (
                            <p>{personalInfo.dept}</p>
                        )}
                    </div>
                </div>
                <button
                    className={`edit-btn ${isEditing ? 'active' : ''}`}
                    onClick={handleToggleEdit}
                >
                    {isEditing ? 'Save Profile' : <><Edit2 size={16} /> Edit Profile</>}
                </button>
            </div>

            <div className="profile-grid">
                {/* Left Column */}
                <div className="profile-left">
                    {/* Personal Information */}
                    <div className="profile-section">
                        <h3>Personal Information</h3>
                        <div className="info-list">
                            <div className="info-item">
                                <Mail size={18} className="info-icon" />
                                <div className="info-content">
                                    <label>Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={personalInfo.email}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                        />
                                    ) : (
                                        <p>{personalInfo.email || user?.email}</p>
                                    )}
                                </div>
                            </div>
                            <div className="info-item">
                                <Phone size={18} className="info-icon" />
                                <div className="info-content">
                                    <label>Phone Number</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            placeholder="+91 98765 43210"
                                            value={personalInfo.phone}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                        />
                                    ) : (
                                        <p>{personalInfo.phone || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="info-item">
                                <GitBranch size={18} className="info-icon" />
                                <div className="info-content">
                                    <label>GitHub Profile</label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            placeholder="https://github.com/username"
                                            value={personalInfo.github || ''}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                                        />
                                    ) : (
                                        <p>
                                            {personalInfo.github ? (
                                                <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {personalInfo.github} <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                'Not provided'
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="info-item">
                                <Globe size={18} className="info-icon" />
                                <div className="info-content">
                                    <label>LinkedIn Profile</label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            placeholder="https://linkedin.com/in/username"
                                            value={personalInfo.linkedin || ''}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                                        />
                                    ) : (
                                        <p>
                                            {personalInfo.linkedin ? (
                                                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {personalInfo.linkedin} <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                'Not provided'
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="profile-section">
                        <h3>Academic Information</h3>
                        <div className="academic-grid">
                            <div className="academic-stat">
                                <BookOpen size={20} className="ac-icon blue" />
                                <div>
                                    <label>Branch</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="academic-input"
                                            value={academicInfo.branch}
                                            onChange={(e) => setAcademicInfo({ ...academicInfo, branch: e.target.value })}
                                        />
                                    ) : (
                                        <p>{academicInfo.branch || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="academic-stat">
                                <Award size={20} className="ac-icon yellow" />
                                <div>
                                    <label>CGPA</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            className="academic-input"
                                            value={academicInfo.cgpa}
                                            onChange={(e) => setAcademicInfo({ ...academicInfo, cgpa: e.target.value })}
                                        />
                                    ) : (
                                        <p>{academicInfo.cgpa || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="academic-stat">
                                <Calendar size={20} className="ac-icon purple" />
                                <div>
                                    <label>Graduation year</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="academic-input"
                                            value={academicInfo.graduationYear}
                                            onChange={(e) => setAcademicInfo({ ...academicInfo, graduationYear: e.target.value })}
                                        />
                                    ) : (
                                        <p>{academicInfo.graduationYear || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="academic-stat">
                                <AlertTriangle size={20} className={`ac-icon ${Number(academicInfo.backlogs) > 0 ? 'red' : 'green'}`} />
                                <div>
                                    <label>Backlogs</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="0"
                                            className="academic-input"
                                            value={academicInfo.backlogs}
                                            onChange={(e) => setAcademicInfo({ ...academicInfo, backlogs: e.target.value })}
                                        />
                                    ) : (
                                        <p>{academicInfo.backlogs ?? '0'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility Status */}
                    <div className={`eligibility-banner ${isEligible ? 'eligible' : 'not-eligible'}`}>
                        {isEligible ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                        <div className="eligibility-text">
                            <h4>Placement Eligibility</h4>
                            <p>{academicInfo.cgpa !== "" ? isEligible ? 'You are eligible for campus placements.' : 'You do not meet the minimum criteria for placements.' : 'Please fill the academic information to check eligibility'}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="profile-right">
                    {/* Resume Section */}
                    <div className="profile-section resume-section">
                        <h3>Resume</h3>
                        <div className="resume-card">
                            <div className="resume-info">
                                <div className="resume-icon">
                                    <FileText size={24} color="#ef4444" />
                                </div>
                                <div>
                                    <h4>{resumeData.name}</h4>
                                    <p>{resumeData.size} • {resumeData.lastUpdated}</p>
                                </div>
                            </div>
                            <div className="resume-actions">
                                <button className="resume-btn view" onClick={() => alert(`Previewing: ${resumeData.name}`)}>
                                    <Eye size={16} /> View
                                </button>
                                <input
                                    type="file"
                                    ref={resumeInputRef}
                                    style={{ display: 'none' }}
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleResumeUpload}
                                />
                                <button className="resume-btn replace" onClick={() => resumeInputRef.current?.click()}>
                                    <Upload size={16} /> Upload / Replace
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="profile-section">
                        <div className="section-header">
                            <h3>Skills</h3>
                            {isEditing && <span className="edit-hint">Press Enter to add</span>}
                        </div>
                        <div className="skills-container">
                            {skilllen === 0 && !isEditing ? (
                                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Add your skills by clicking on Edit Profile</p>
                            ) : (
                                skills.map((skill, idx) => (
                                    <div key={idx} className="skill-tag">
                                        {skill}
                                        {isEditing && (
                                            <button className="remove-skill" onClick={() => removeSkill(skill)}>
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                            {isEditing && (
                                <input
                                    type="text"
                                    className="skill-input"
                                    placeholder="Add skill..."
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                />
                            )}
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div className="profile-section">
                        <div className="section-header">
                            <h3>Projects</h3>
                            {isEditing && (
                                <button className="add-project-btn" onClick={() => setShowAddProject(true)}>
                                    <Plus size={16} /> Add Project
                                </button>
                            )}
                        </div>
                        <div className="projects-list">
                            {projectlen === 0 && !isEditing ? (
                                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Add your projects by clicking on Edit Profile</p>
                            ) : (
                                projects.map(project => (
                                    <div key={project.id} className="project-card">
                                        <div className="project-header">
                                            <div className="project-title-wrapper">
                                                <Briefcase size={18} className="project-icon" />
                                                <h4>{project.title}</h4>
                                            </div>
                                            <div className="project-actions">
                                                {project.github && (
                                                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="github-link">
                                                        <GitBranch size={18} /> Repo
                                                    </a>
                                                )}
                                                {isEditing && (
                                                    <button className="delete-project-btn" onClick={() => removeProject(project.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {project.description && <p className="project-desc">{project.description}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Project Modal */}
            {showAddProject && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Project</h3>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-field">
                                <label>Project Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. E-commerce App"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                />
                            </div>
                            <div className="modal-field">
                                <label>GitHub Repository URL <span className="required">*</span></label>
                                <input
                                    type="url"
                                    placeholder="https://github.com/username/repo"
                                    value={newProject.github}
                                    onChange={(e) => setNewProject({ ...newProject, github: e.target.value })}
                                />
                            </div>
                            <div className="modal-field">
                                <label>About Project</label>
                                <textarea
                                    placeholder="Describe your project briefly..."
                                    rows={4}
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                />
                            </div>
                            {projectError && <p className="modal-error">{projectError}</p>}
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel-btn" onClick={closeModal}>Cancel</button>
                            <button className="modal-submit-btn" onClick={handleAddProject}>
                                <Plus size={16} /> Add Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}