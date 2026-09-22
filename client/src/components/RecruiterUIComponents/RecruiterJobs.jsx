import React, { useState, useEffect } from 'react';
import {
    PlusCircle, Search, Filter, Building, MapPin,
    DollarSign, Calendar, Users, Edit, Trash2,
    ChevronDown, ChevronUp, Eye, CheckCircle, X,
    GraduationCap, Clock, Award
} from 'lucide-react';
import RecruiterCandidateProfile from './RecruiterCandidateProfile';
import './RecruiterJobs.css';
import { authFetch } from '../../utils/api';

export default function RecruiterJobs({ user, onScheduleInterview, openCreateModalOnMount, onPostJobModalHandled }) {
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedJobId, setExpandedJobId] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    // Form state for creating/editing job
    const [formData, setFormData] = useState({
        role: '',
        company: 'TechCorp Solutions',
        location: 'Bengaluru, India (Hybrid)',
        type: 'Full-time',
        salary: '₹14 - 18 LPA',
        deadline: '30 Sep 2026',
        minCgpa: 7.5,
        branches: ['CSE', 'IT', 'AI/DS'],
        skills: ['React', 'Node.js', 'SQL'],
        description: 'We are seeking passionate engineering talent to join our dynamic team building next-generation platforms.',
        responsibilities: 'Build scalable frontend/backend components.\nCollaborate with cross-functional teams.\nParticipate in code reviews and design architecture.',
        qualifications: 'B.Tech / B.E. in CSE, IT, or related fields.\nStrong foundation in Data Structures and Algorithms.\nDemonstrated passion through personal or academic projects.',
        status: 'Active'
    });

    const [skillInput, setSkillInput] = useState('');
    const [branchInput, setBranchInput] = useState('');

    // Candidate Profile modal state
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const loadData = async () => {
        try {
            if (!user?.email) return;
            const [jobsRes, appsRes] = await Promise.all([
                authFetch('http://localhost:5000/api/jobs/by-recruiter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                }),
                authFetch('http://localhost:5000/api/applications/by-recruiter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                })
            ]);
            const jList = jobsRes.ok ? await jobsRes.json() : [];
            const aList = appsRes.ok ? await appsRes.json() : [];
            setJobs(jList || []);
            setApplications(aList || []);
        } catch (e) {
            console.error('Failed to load jobs data:', e);
        }
    };

    useEffect(() => {
        loadData();

        window.addEventListener('recruiter_jobs_updated', loadData);
        window.addEventListener('recruiter_applications_updated', loadData);
        return () => {
            window.removeEventListener('recruiter_jobs_updated', loadData);
            window.removeEventListener('recruiter_applications_updated', loadData);
        };
    }, [user?.email]);

    useEffect(() => {
        if (openCreateModalOnMount) {
            handleOpenCreate();
            if (onPostJobModalHandled) onPostJobModalHandled();
        }
    }, [openCreateModalOnMount]);

    const handleOpenCreate = async () => {
        let companyProfile = {};
        if (user?.email) {
            try {
                const res = await authFetch('http://localhost:5000/api/auth/recruiter-profile/get', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.profile) companyProfile = data.profile;
                }
            } catch (e) { /* fallback */ }
        }

        setEditingJob(null);
        setFormData({
            role: '',
            company: companyProfile?.companyName || user?.name || 'Company',
            location: 'Bengaluru, India (Hybrid)',
            type: 'Full-time',
            salary: '₹14 - 18 LPA',
            deadline: '30 Oct 2026',
            minCgpa: companyProfile?.minCgpa ?? 7.0,
            branches: Array.isArray(companyProfile?.hiringBranches) ? companyProfile.hiringBranches : ['CSE', 'IT', 'AI/DS'],
            skills: ['React', 'Node.js', 'SQL'],
            description: 'We are seeking passionate engineering talent to join our dynamic product engineering group.',
            responsibilities: 'Design and build high-scale distributed systems.\nWrite clean, maintainable, and testable code.\nWork with modern cloud infrastructure.',
            qualifications: 'B.Tech / B.E. in relevant branches.\nProficiency in modern programming languages.\nStrong analytical and problem solving mindset.',
            status: 'Active'
        });
        setShowModal(true);
    };

    const handleOpenEdit = (job) => {
        setEditingJob(job);
        setFormData({
            role: job.role || job.title || '',
            company: job.company || '',
            location: job.location || '',
            type: job.type || 'Full-time',
            salary: job.salary || '',
            deadline: job.deadline || '',
            minCgpa: job.minCgpa || 7.0,
            branches: Array.isArray(job.branches) ? job.branches : ['CSE', 'IT', 'AI/DS'],
            skills: Array.isArray(job.skills) ? job.skills : [],
            description: job.description || '',
            responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : (job.responsibilities || ''),
            qualifications: Array.isArray(job.qualifications) ? job.qualifications.join('\n') : (job.qualifications || ''),
            status: job.status || 'Active'
        });
        setShowModal(true);
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const handleAddBranch = () => {
        if (branchInput.trim() && !formData.branches.includes(branchInput.trim().toUpperCase())) {
            setFormData(prev => ({ ...prev, branches: [...prev.branches, branchInput.trim().toUpperCase()] }));
            setBranchInput('');
        }
    };

    const handleRemoveBranch = (branch) => {
        setFormData(prev => ({ ...prev, branches: prev.branches.filter(b => b !== branch) }));
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!formData.role.trim() || !formData.company.trim()) {
            alert('Please fill in Job Title and Company.');
            return;
        }

        const payload = {
            ...formData,
            recruiterEmail: user?.email,
            title: formData.role, // ensure compatibility
            responsibilities: typeof formData.responsibilities === 'string'
                ? formData.responsibilities.split('\n').filter(r => r.trim())
                : formData.responsibilities,
            qualifications: typeof formData.qualifications === 'string'
                ? formData.qualifications.split('\n').filter(q => q.trim())
                : formData.qualifications,
            criteria: {
                minCgpa: formData.minCgpa || 0,
                maxBacklogs: 0,
                eligibleBranches: formData.branches || ['All Branches'],
                graduationYear: '2027'
            }
        };

        try {
            if (editingJob) {
                const targetId = editingJob._id || editingJob.id;
                await authFetch(`http://localhost:5000/api/jobs/${targetId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                await authFetch('http://localhost:5000/api/jobs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            setShowModal(false);
            loadData();
            window.dispatchEvent(new Event('recruiter_jobs_updated'));
        } catch (err) {
            console.error('Error submitting job form:', err);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await authFetch(`http://localhost:5000/api/jobs/${jobId}`, { method: 'DELETE' });
                loadData();
                window.dispatchEvent(new Event('recruiter_jobs_updated'));
            } catch (err) {
                console.error('Error deleting job:', err);
            }
        }
    };

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
            skills: app.candidateSkills || ['General Aptitude'],
            resume: { name: app.candidateResume || `${app.candidateName?.replace(/\s+/g, '_')}_Resume.pdf` }
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

    // Filtered jobs
    const filteredJobs = jobs.filter(job => {
        const title = (job.role || job.title || '').toLowerCase();
        const comp = (job.company || '').toLowerCase();
        const skillsMatch = (job.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSearch = title.includes(searchTerm.toLowerCase()) ||
            comp.includes(searchTerm.toLowerCase()) ||
            skillsMatch;

        const matchesType = typeFilter === 'All' || job.type?.toLowerCase().includes(typeFilter.toLowerCase());
        const jobStatus = job.status || 'Active';
        const matchesStatus = statusFilter === 'All' || jobStatus.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="rj-container">
            {/* Controls Bar */}
            <div className="rj-controls-bar">
                <div className="rj-search-filter-group">
                    <div className="rj-search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            className="rj-search-input"
                            placeholder="Search by job title, company, or skills..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="rj-select-filter"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                    </select>

                    <select
                        className="rj-select-filter"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>

                <button className="rj-post-btn" onClick={handleOpenCreate}>
                    <PlusCircle size={17} /> Post New Drive
                </button>
            </div>

            {/* Jobs List */}
            <div className="rj-jobs-grid">
                {filteredJobs.length === 0 ? (
                    <div style={{ background: '#fff', padding: '3rem', borderRadius: '14px', textAlign: 'center', color: '#64748b' }}>
                        No job postings found matching your filters.
                    </div>
                ) : (
                    filteredJobs.map(job => {
                        const jobId = job._id || job.id;
                        const jobApplicants = applications.filter(a => a.jobId === jobId);
                        const isExpanded = expandedJobId === jobId;
                        const jobStatus = job.status || 'Active';

                        return (
                            <div key={jobId} className="rj-job-card">
                                <div className="rj-card-main">
                                    <div className="rj-card-header">
                                        <div className="rj-header-left">
                                            <div className="rj-company-icon">
                                                {job.company ? job.company[0] : 'J'}
                                            </div>
                                            <div className="rj-title-wrap">
                                                <h3>{job.role || job.title}</h3>
                                                <div className="rj-company-sub">
                                                    <Building size={14} /> {job.company}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rj-header-right">
                                            <span className={`rec-badge ${jobStatus.toLowerCase()}`}>
                                                {jobStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Meta pills */}
                                    <div className="rj-meta-pills">
                                        <span className="rj-pill">
                                            <MapPin size={13} /> {job.location || 'Bengaluru'}
                                        </span>
                                        <span className="rj-pill salary">
                                            <DollarSign size={13} /> {job.salary || 'Competitive'}
                                        </span>
                                        <span className="rj-pill">
                                            {job.type || 'Full-time'}
                                        </span>
                                        <span className="rj-pill deadline">
                                            <Clock size={13} /> Closes: {job.deadline || 'Open'}
                                        </span>
                                        <span className="rj-pill" style={{ background: '#f0fdf4', color: '#15803d' }}>
                                            <GraduationCap size={13} /> Min CGPA: {job.minCgpa ?? '7.0'}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    {job.description && (
                                        <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0', lineHeight: 1.5 }}>
                                            {job.description}
                                        </p>
                                    )}

                                    {/* Skills required */}
                                    {job.skills && job.skills.length > 0 && (
                                        <div className="rj-skills-list">
                                            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Skills:</span>
                                            {job.skills.map((s, idx) => (
                                                <span key={idx} className="rj-skill-tag">{s}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer Bar */}
                                <div className="rj-card-footer">
                                    <div
                                        className="rj-applicants-count-badge"
                                        onClick={() => setExpandedJobId(isExpanded ? null : jobId)}
                                    >
                                        <Users size={16} />
                                        <span>
                                            <strong>{jobApplicants.length}</strong> Applicants
                                        </span>
                                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                    </div>

                                    <div className="rj-actions-group">
                                        <button
                                            className="rj-action-btn"
                                            onClick={() => handleOpenEdit(job)}
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            className="rj-action-btn delete"
                                            onClick={() => handleDeleteJob(jobId)}
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Applicants Panel */}
                                {isExpanded && (
                                    <div className="rj-expanded-applicants">
                                        <div className="rj-exp-header">
                                            <Users size={16} />
                                            <span>Candidates applied for this position ({jobApplicants.length})</span>
                                        </div>

                                        {jobApplicants.length === 0 ? (
                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                                                No candidates have applied yet.
                                            </p>
                                        ) : (
                                            <div className="rj-applicants-mini-grid">
                                                {jobApplicants.map(app => (
                                                    <div key={app._id || app.id} className="rj-applicant-mini-card">
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                                                                {app.candidateName}
                                                            </div>
                                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                                {app.candidateBranch} • CGPA: {app.candidateCgpa}
                                                            </div>
                                                            <span className={`rec-badge ${(app.status || 'new').toLowerCase()}`} style={{ marginTop: '0.35rem', fontSize: '0.7rem' }}>
                                                                {app.status}
                                                            </span>
                                                        </div>
                                                        <button
                                                            className="rj-action-btn"
                                                            onClick={() => handleViewCandidate(app)}
                                                        >
                                                            <Eye size={13} /> View
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Post / Edit Job Modal */}
            {showModal && (
                <div className="rec-modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="rj-modal" onClick={e => e.stopPropagation()}>
                        <div className="rj-modal-header">
                            <h2>{editingJob ? 'Edit Placement Drive' : 'Create New Placement Drive'}</h2>
                            <button className="rcp-close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                            <div className="rj-modal-body">
                                <div className="rj-form-row-2">
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Job Title *</label>
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            required
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            placeholder="e.g. Full Stack Developer (SDE-1)"
                                        />
                                    </div>

                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Company Name *</label>
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            required
                                            value={formData.company}
                                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="rj-form-row-2">
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Job Type</label>
                                        <select
                                            className="rj-form-select"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Internship">Internship (6 Months)</option>
                                            <option value="Internship + PPO">Internship + PPO</option>
                                        </select>
                                    </div>

                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Salary / CTC</label>
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            value={formData.salary}
                                            onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                            placeholder="e.g. ₹16 LPA or ₹50,000 / month"
                                        />
                                    </div>
                                </div>

                                <div className="rj-form-row-2">
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Job Location</label>
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g. Bengaluru / Hyderabad / Remote"
                                        />
                                    </div>

                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Application Deadline</label>
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            value={formData.deadline}
                                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                            placeholder="e.g. 15 Oct 2026"
                                        />
                                    </div>
                                </div>

                                <div className="rj-form-row-2">
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Minimum CGPA Required</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            className="rj-form-input"
                                            value={formData.minCgpa}
                                            onChange={e => setFormData({ ...formData, minCgpa: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Listing Status</label>
                                        <select
                                            className="rj-form-select"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Active">Active (Accepting Applications)</option>
                                            <option value="Closed">Closed</option>
                                            <option value="Draft">Draft</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Skills Tag Manager */}
                                <div className="rj-form-group">
                                    <label className="rj-form-label">Required Skills</label>
                                    <div className="rj-skills-list" style={{ marginBottom: '0.4rem' }}>
                                        {formData.skills.map((s, idx) => (
                                            <span key={idx} className="rcp-skill-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                                {s}
                                                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkill(s)} />
                                            </span>
                                        ))}
                                    </div>
                                    <div className="rj-tags-creator">
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            placeholder="Type a skill (e.g. TypeScript) and click Add"
                                            value={skillInput}
                                            onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                                        />
                                        <button type="button" className="rj-add-tag-btn" onClick={handleAddSkill}>
                                            + Add
                                        </button>
                                    </div>
                                </div>

                                {/* Eligible Branches */}
                                <div className="rj-form-group">
                                    <label className="rj-form-label">Eligible Branches</label>
                                    <div className="rj-skills-list" style={{ marginBottom: '0.4rem' }}>
                                        {formData.branches.map((b, idx) => (
                                            <span key={idx} className="rj-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                                {b}
                                                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveBranch(b)} />
                                            </span>
                                        ))}
                                    </div>
                                    <div className="rj-tags-creator">
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            placeholder="Add branch (e.g. MECH, EEE)"
                                            value={branchInput}
                                            onChange={e => setBranchInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBranch(); } }}
                                        />
                                        <button type="button" className="rj-add-tag-btn" onClick={handleAddBranch}>
                                            + Add Branch
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="rj-form-group">
                                    <label className="rj-form-label">Job Overview & Description</label>
                                    <textarea
                                        rows={3}
                                        className="rj-form-textarea"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {/* Key Responsibilities */}
                                <div className="rj-form-group">
                                    <label className="rj-form-label">Key Responsibilities (one per line)</label>
                                    <textarea
                                        rows={3}
                                        className="rj-form-textarea"
                                        value={formData.responsibilities}
                                        onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="rj-modal-footer">
                                <button
                                    type="button"
                                    className="rj-action-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rj-post-btn"
                                >
                                    {editingJob ? 'Save Changes' : 'Publish Job Drive'}
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
