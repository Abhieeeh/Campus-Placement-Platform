import React, { useState } from 'react';
import {
    GraduationCap, User, Phone, Globe, BookOpen, Award,
    Calendar, AlertTriangle, Plus, Trash2, CheckCircle2,
    ArrowRight, Sparkles, FolderGit2, Code2, Link as LinkIcon
} from 'lucide-react';
import { authFetch } from '../utils/api';
import './StudentProfileSetup.css';

const SUGGESTED_SKILLS = [
    'React', 'JavaScript', 'Python', 'Node.js', 'Java',
    'C++', 'SQL', 'MongoDB', 'Data Structures', 'Machine Learning',
    'HTML/CSS', 'Git', 'AWS', 'Express.js', 'Docker'
];

export default function StudentProfileSetup({ initialUser, onComplete }) {
    const userEmail = initialUser?.email || '';

    // Step state: 1. Personal & Academics, 2. Skills & Projects
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Personal Info State
    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        dept: 'Computer Science & Engineering',
        email: userEmail,
        phone: '',
        github: '',
        linkedin: ''
    });

    // Academic Info State
    const [academicInfo, setAcademicInfo] = useState({
        branch: 'CSE',
        cgpa: '',
        graduationYear: new Date().getFullYear() + 1 + '',
        backlogs: '0'
    });

    // Skills State
    const [skills, setSkills] = useState(['JavaScript', 'React', 'Python']);
    const [customSkillInput, setCustomSkillInput] = useState('');

    // Projects State
    const [projects, setProjects] = useState([
        {
            id: 1,
            title: '',
            github: '',
            description: ''
        }
    ]);

    // Validation
    const validateStep1 = () => {
        if (!personalInfo.name.trim()) return 'Please enter your Full Name.';
        if (!personalInfo.phone.trim()) return 'Please enter a contact phone number.';
        if (!academicInfo.branch) return 'Please select your Branch / Specialization.';
        if (!academicInfo.cgpa || isNaN(academicInfo.cgpa) || Number(academicInfo.cgpa) < 0 || Number(academicInfo.cgpa) > 10) {
            return 'Please enter a valid CGPA between 0 and 10.';
        }
        if (!academicInfo.graduationYear) return 'Please enter your Graduation Year.';
        return '';
    };

    const validateStep2 = () => {
        if (skills.length === 0) return 'Please add at least 1 technical skill.';
        return '';
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        const err = validateStep1();
        if (err) {
            setErrorMessage(err);
            return;
        }
        setErrorMessage('');
        setCurrentStep(2);
    };

    // Skill handlers
    const handleAddSkill = (skillToAdd) => {
        const skill = (skillToAdd || customSkillInput).trim();
        if (skill && !skills.includes(skill)) {
            setSkills(prev => [...prev, skill]);
            setCustomSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkills(prev => prev.filter(s => s !== skillToRemove));
    };

    // Project handlers
    const handleAddProject = () => {
        setProjects(prev => [
            ...prev,
            {
                id: Date.now(),
                title: '',
                github: '',
                description: ''
            }
        ]);
    };

    const handleUpdateProject = (id, field, value) => {
        setProjects(prev =>
            prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    const handleRemoveProject = (id) => {
        if (projects.length === 1) {
            setProjects([{ id: Date.now(), title: '', github: '', description: '' }]);
        } else {
            setProjects(prev => prev.filter(p => p.id !== id));
        }
    };

    // Final Submission
    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        const err = validateStep2();
        if (err) {
            setErrorMessage(err);
            return;
        }
        setErrorMessage('');
        setIsSubmitting(true);

        const cleanProjects = projects.filter(p => p.title.trim() !== '');

        const payload = {
            email: userEmail || personalInfo.email,
            personalInfo,
            academicInfo,
            skills,
            projects: cleanProjects
        };

        try {
            await authFetch('http://localhost:5000/api/auth/student-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            window.dispatchEvent(new Event('student_profile_updated'));

            onComplete({
                role: 'student',
                email: userEmail || personalInfo.email
            });
        } catch (error) {
            onComplete({
                role: 'student',
                email: userEmail || personalInfo.email
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sps-page">
            <div className="sps-container">
                {/* Header card */}
                <div className="sps-header">
                    <div className="sps-badge">
                        <GraduationCap size={20} />
                        <span>Step 2 of 2: Student Profile Setup</span>
                    </div>
                    <h1>Complete Your Placement Profile</h1>
                    <p>
                        Fill in your academic and skill details so campus recruitment teams can match you with eligible placement drives.
                    </p>

                    {/* Stepper indicator */}
                    <div className="sps-stepper">
                        <div className={`sps-step ${currentStep >= 1 ? 'active' : ''}`}>
                            <div className="sps-step-num">{currentStep > 1 ? <CheckCircle2 size={16} /> : '1'}</div>
                            <span>Personal & Academics</span>
                        </div>
                        <div className="sps-step-divider"></div>
                        <div className={`sps-step ${currentStep >= 2 ? 'active' : ''}`}>
                            <div className="sps-step-num">2</div>
                            <span>Skills & Projects</span>
                        </div>
                    </div>
                </div>

                {errorMessage && (
                    <div className="sps-error-banner">
                        <AlertTriangle size={17} />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Form Body */}
                <div className="sps-card">
                    {currentStep === 1 && (
                        <form onSubmit={handleNextStep}>
                            <div className="sps-section-title">
                                <User size={18} />
                                <span>Personal Details</span>
                            </div>

                            <div className="sps-grid-2">
                                <div className="sps-form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        required
                                        value={personalInfo.name}
                                        onChange={e => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                                    />
                                </div>
                                <div className="sps-form-group">
                                    <label>Registered Email</label>
                                    <input
                                        type="email"
                                        value={personalInfo.email}
                                        readOnly
                                        className="sps-input-readonly"
                                    />
                                </div>
                            </div>

                            <div className="sps-grid-2">
                                <div className="sps-form-group">
                                    <label>Contact Phone *</label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. +91 98765 43210"
                                        required
                                        value={personalInfo.phone}
                                        onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                    />
                                </div>
                                <div className="sps-form-group">
                                    <label>Department / Faculty</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. School of Computer Engineering"
                                        value={personalInfo.dept}
                                        onChange={e => setPersonalInfo({ ...personalInfo, dept: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="sps-grid-2">
                                <div className="sps-form-group">
                                    <label>GitHub Profile URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://github.com/username"
                                        value={personalInfo.github}
                                        onChange={e => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                                    />
                                </div>
                                <div className="sps-form-group">
                                    <label>LinkedIn Profile URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/in/username"
                                        value={personalInfo.linkedin}
                                        onChange={e => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="sps-section-title" style={{ marginTop: '1.75rem' }}>
                                <BookOpen size={18} />
                                <span>Academic Details & Eligibility Criteria</span>
                            </div>

                            <div className="sps-grid-2">
                                <div className="sps-form-group">
                                    <label>Primary Branch / Specialization *</label>
                                    <select
                                        value={academicInfo.branch}
                                        onChange={e => setAcademicInfo({ ...academicInfo, branch: e.target.value })}
                                    >
                                        <option value="CSE">CSE - Computer Science & Engineering</option>
                                        <option value="IT">IT - Information Technology</option>
                                        <option value="AI/DS">AI/DS - Artificial Intelligence & Data Science</option>
                                        <option value="ECE">ECE - Electronics & Communication</option>
                                        <option value="EEE">EEE - Electrical & Electronics</option>
                                        <option value="MECH">MECH - Mechanical Engineering</option>
                                        <option value="CIVIL">CIVIL - Civil Engineering</option>
                                        <option value="MCA">MCA / Master of Computer Applications</option>
                                        <option value="OTHER">Other Discipline</option>
                                    </select>
                                </div>
                                <div className="sps-form-group">
                                    <label>Cumulative CGPA (out of 10) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        placeholder="e.g. 8.45"
                                        required
                                        value={academicInfo.cgpa}
                                        onChange={e => setAcademicInfo({ ...academicInfo, cgpa: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="sps-grid-2">
                                <div className="sps-form-group">
                                    <label>Graduation Year *</label>
                                    <input
                                        type="number"
                                        min="2024"
                                        max="2032"
                                        placeholder="2027"
                                        required
                                        value={academicInfo.graduationYear}
                                        onChange={e => setAcademicInfo({ ...academicInfo, graduationYear: e.target.value })}
                                    />
                                </div>
                                <div className="sps-form-group">
                                    <label>Active Standing Backlogs</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        placeholder="0"
                                        value={academicInfo.backlogs}
                                        onChange={e => setAcademicInfo({ ...academicInfo, backlogs: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="sps-actions">
                                <div></div>
                                <button type="submit" className="sps-btn sps-btn-primary">
                                    Next: Skills & Projects <ArrowRight size={16} />
                                </button>
                            </div>
                        </form>
                    )}

                    {currentStep === 2 && (
                        <form onSubmit={handleFinalSubmit}>
                            <div className="sps-section-title">
                                <Code2 size={18} />
                                <span>Technical Skills & Tools</span>
                            </div>
                            <p className="sps-sec-sub">Select quick suggestions or type your custom skill and hit enter.</p>

                            <div className="sps-skills-wrap">
                                {skills.map((skill, index) => (
                                    <span key={index} className="sps-skill-chip active">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="sps-chip-remove"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="sps-skill-input-row">
                                <input
                                    type="text"
                                    placeholder="Add custom skill (e.g. GraphQL, Tailwind, Flutter)"
                                    value={customSkillInput}
                                    onChange={e => setCustomSkillInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSkill();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleAddSkill()}
                                    className="sps-btn sps-btn-secondary"
                                >
                                    <Plus size={16} /> Add Skill
                                </button>
                            </div>

                            <div className="sps-suggested-title">
                                <Sparkles size={14} /> Quick Suggestions:
                            </div>
                            <div className="sps-suggestions-cloud">
                                {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="sps-sug-btn"
                                        onClick={() => handleAddSkill(item)}
                                    >
                                        + {item}
                                    </button>
                                ))}
                            </div>

                            {/* Projects Section */}
                            <div className="sps-section-title" style={{ marginTop: '2rem' }}>
                                <FolderGit2 size={18} />
                                <span>Featured Projects (Optional)</span>
                            </div>
                            <p className="sps-sec-sub">Showcase key academic or personal projects to stand out to recruiters.</p>

                            <div className="sps-projects-list">
                                {projects.map((proj, idx) => (
                                    <div key={proj.id} className="sps-project-card">
                                        <div className="sps-project-head">
                                            <span className="sps-project-num">Project #{idx + 1}</span>
                                            {projects.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="sps-btn-remove-proj"
                                                    onClick={() => handleRemoveProject(proj.id)}
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="sps-grid-2">
                                            <div className="sps-form-group">
                                                <label>Project Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. AI-Powered Healthcare Assistant"
                                                    value={proj.title}
                                                    onChange={e => handleUpdateProject(proj.id, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div className="sps-form-group">
                                                <label>GitHub / Demo Link</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://github.com/..."
                                                    value={proj.github}
                                                    onChange={e => handleUpdateProject(proj.id, 'github', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="sps-form-group">
                                            <label>Project Summary / Technologies Used</label>
                                            <textarea
                                                rows={2}
                                                placeholder="Briefly describe what you built, architecture, or key challenges solved."
                                                value={proj.description}
                                                onChange={e => handleUpdateProject(proj.id, 'description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="sps-add-proj-btn"
                                onClick={handleAddProject}
                            >
                                <Plus size={16} /> Add Another Project
                            </button>

                            <div className="sps-actions" style={{ marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    className="sps-btn sps-btn-ghost"
                                    onClick={() => setCurrentStep(1)}
                                    disabled={isSubmitting}
                                >
                                    Back to Academics
                                </button>

                                <button
                                    type="submit"
                                    className="sps-btn sps-btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving Profile...' : 'Complete Profile & Launch Dashboard'}
                                    {!isSubmitting && <CheckCircle2 size={16} />}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
