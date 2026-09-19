import React, { useState, useMemo, useRef } from 'react';
import {
    Search, Briefcase, Building, MapPin, DollarSign, Calendar,
    CheckCircle, XCircle, AlertTriangle, Eye, Upload, Send, X,
    Sparkles, Filter, Check, Edit2, FileText, ExternalLink, ArrowRight,
    GraduationCap, Award, Info
} from 'lucide-react';
import './Studentjobs.css';

// Initial Mock Job Listings Data
const INITIAL_JOBS = [
    {
        id: 'job-1',
        role: 'Software Development Engineer (SDE-1)',
        company: 'Google',
        color: 'linear-gradient(135deg, #4285F4, #34A853)',
        location: 'Bangalore / Hyderabad',
        type: 'Full-time',
        salary: '₹28 - ₹34 LPA',
        deadline: '25 Sep 2026',
        postedDate: '2 days ago',
        description: 'Join Google’s core engineering team to design, test, deploy and maintain scalable software solutions that impact billions of worldwide users.',
        responsibilities: [
            'Design, develop, test, deploy, maintain and enhance software solutions.',
            'Collaborate with product managers, UX designers, and fellow engineers.',
            'Optimize system performance, scalability, and security across distributed cloud environments.'
        ],
        qualifications: [
            'B.Tech/B.E. in Computer Science, IT, or related technical field.',
            'Strong foundation in Data Structures, Algorithms, and System Design.',
            'Proficiency in Java, C++, Python, or Go.',
            'Hands-on experience with cloud platforms (GCP/AWS) is a plus.'
        ],
        skills: ['Data Structures', 'Java', 'Python', 'System Design', 'Cloud Computing'],
        criteria: {
            minCgpa: 7.5,
            eligibleBranches: ['CSE', 'IT', 'ECE', 'AI/DS'],
            maxBacklogs: 0,
            graduationYear: '2027'
        }
    }

];

export default function Studentjobs({ user }) {
    // Helper to read profile from localStorage
    const getStoredProfile = () => {
        let academic = { branch: '', cgpa: '', graduationYear: '', backlogs: '' };
        let personal = {
            name: '',
            dept: '',
            email: '',
            phone: '',
            github: '',
            linkedin: ''
        };

        let resume = {
            name: '',
            size: '',
            lastUpdated: ''
        };

        try {
            const savedAcademic = localStorage.getItem('student_academic_info');
            if (savedAcademic) academic = { ...academic, ...JSON.parse(savedAcademic) };

            const savedPersonal = localStorage.getItem('student_personal_info');
            if (savedPersonal) personal = { ...personal, ...JSON.parse(savedPersonal) };

            const savedResume = localStorage.getItem('student_resume');
            if (savedResume) resume = { ...resume, ...JSON.parse(savedResume) };
        } catch (e) {
            // fallback
        }

        return {
            name: personal.name || user?.name || (user?.email ? user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Abhishek Kumar'),
            email: personal.email || user?.email || 'abhishek.student@campus.edu',
            phone: personal.phone || '+91 98765 43210',
            branch: academic.branch || personal.dept || 'CSE',
            cgpa: academic.cgpa !== undefined && academic.cgpa !== '' ? String(academic.cgpa) : '8.4',
            backlogs: academic.backlogs !== undefined && academic.backlogs !== '' ? String(academic.backlogs) : '0',
            graduationYear: academic.graduationYear || '2028',
            github: personal.github || 'https://github.com/abhieeeh',
            linkedin: personal.linkedin || 'https://linkedin.com/in/abhishekk',
            resumeFileName: resume.name || 'Abhishek_K_Resume.pdf',
            resumeFileSize: resume.size || '1.4 MB',
            resumeLastUpdated: resume.lastUpdated || 'Uploaded on Sep 12, 2026'
        };
    };

    // Student profile info (synced with profile section)
    const [studentProfile, setStudentProfile] = useState(getStoredProfile);

    // Sync when profile updates in Profile section
    React.useEffect(() => {
        const syncProfile = () => {
            setStudentProfile(getStoredProfile());
        };
        window.addEventListener('student_profile_updated', syncProfile);
        window.addEventListener('storage', syncProfile);
        return () => {
            window.removeEventListener('student_profile_updated', syncProfile);
            window.removeEventListener('storage', syncProfile);
        };
    }, []);

    // Job posts state (track applied jobs)
    const [jobs, setJobs] = useState(INITIAL_JOBS);
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'full-time' | 'internship' | 'eligible'

    // Modals state
    const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
    const [selectedJobForApply, setSelectedJobForApply] = useState(null);
    const [isEditingProfileInModal, setIsEditingProfileInModal] = useState(false);
    const [applySuccessState, setApplySuccessState] = useState(false);
    const [uploadedNewFile, setUploadedNewFile] = useState(null);
    const fileInputRef = useRef(null);

    // Form inputs during application
    const [applicationForm, setApplicationForm] = useState({
        name: studentProfile.name,
        email: studentProfile.email,
        phone: studentProfile.phone,
        branch: studentProfile.branch,
        cgpa: studentProfile.cgpa,
        graduationYear: studentProfile.graduationYear,
        note: '',
        github: studentProfile.github || 'https://github.com/abhieeeh',
        linkedin: studentProfile.linkedin || 'https://linkedin.com/in/abhishekk'
    });

    // Helper: Check student eligibility for a job
    const checkEligibility = (jobCriteria) => {
        const studentCgpaNum = parseFloat(studentProfile.cgpa) || 0;
        const studentBacklogsNum = parseInt(studentProfile.backlogs, 10) || 0;

        const cgpaOk = studentCgpaNum >= jobCriteria.minCgpa;
        const backlogsOk = studentBacklogsNum <= jobCriteria.maxBacklogs;
        const branchOk =
            jobCriteria.eligibleBranches.includes('All Branches') ||
            jobCriteria.eligibleBranches.includes(studentProfile.branch);

        const isEligible = cgpaOk && backlogsOk && branchOk;

        return {
            isEligible,
            cgpaOk,
            backlogsOk,
            branchOk,
            reason: !backlogsOk
                ? `Cannot apply: ${studentBacklogsNum} active backlog${studentBacklogsNum > 1 ? 's' : ''} present (Max allowed: ${jobCriteria.maxBacklogs})`
                : !cgpaOk
                    ? `CGPA too low (Requires min ${jobCriteria.minCgpa})`
                    : !branchOk
                        ? `Branch ${studentProfile.branch} not listed`
                        : 'Meets all criteria'
        };
    };

    // Calculate total eligible count across all current jobs
    const eligibleJobsCount = useMemo(() => {
        return jobs.filter(job => checkEligibility(job.criteria).isEligible).length;
    }, [jobs, studentProfile]);

    // Filter and Search logic
    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            // Search query match
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                q === '' ||
                job.role.toLowerCase().includes(q) ||
                job.company.toLowerCase().includes(q) ||
                job.location.toLowerCase().includes(q) ||
                job.skills.some(skill => skill.toLowerCase().includes(q));

            if (!matchesSearch) return false;

            // Filter pills match
            if (activeFilter === 'full-time') return job.type.toLowerCase() === 'full-time';
            if (activeFilter === 'internship') return job.type.toLowerCase() === 'internship';
            if (activeFilter === 'eligible') return checkEligibility(job.criteria).isEligible;

            return true;
        });
    }, [jobs, searchQuery, activeFilter, studentProfile]);

    // Handlers
    const handleOpenApplyModal = (job) => {
        const eligibility = checkEligibility(job.criteria);
        if (!eligibility.backlogsOk) {
            alert(`Application Blocked: You have ${studentProfile.backlogs} active backlog(s). Students with active backlogs cannot apply for this drive.`);
            return;
        }
        if (!eligibility.isEligible) {
            alert(`Cannot apply: ${eligibility.reason}`);
            return;
        }

        setSelectedJobForApply(job);
        setApplySuccessState(false);
        setUploadedNewFile(null);
        setIsEditingProfileInModal(false);
        setApplicationForm({
            name: studentProfile.name,
            email: studentProfile.email,
            phone: studentProfile.phone,
            branch: studentProfile.branch,
            cgpa: studentProfile.cgpa,
            graduationYear: studentProfile.graduationYear,
            note: '',
            github: studentProfile.github || '',
            linkedin: studentProfile.linkedin || ''
        });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedNewFile({
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                lastUpdated: 'Just now'
            });
        }
    };

    const handleSubmitApplication = (e) => {
        e.preventDefault();
        // Update student profile state if edited
        const updatedPersonal = {
            name: applicationForm.name,
            email: applicationForm.email,
            phone: applicationForm.phone,
            dept: applicationForm.branch,
            github: applicationForm.github,
            linkedin: applicationForm.linkedin
        };
        const updatedAcademic = {
            branch: applicationForm.branch,
            cgpa: applicationForm.cgpa,
            graduationYear: applicationForm.graduationYear,
            backlogs: studentProfile.backlogs
        };

        localStorage.setItem('student_personal_info', JSON.stringify(updatedPersonal));
        localStorage.setItem('student_academic_info', JSON.stringify(updatedAcademic));
        if (uploadedNewFile) {
            localStorage.setItem('student_resume', JSON.stringify(uploadedNewFile));
        }
        window.dispatchEvent(new Event('student_profile_updated'));

        setStudentProfile(prev => ({
            ...prev,
            name: applicationForm.name,
            email: applicationForm.email,
            phone: applicationForm.phone,
            branch: applicationForm.branch,
            cgpa: applicationForm.cgpa,
            graduationYear: applicationForm.graduationYear,
            github: applicationForm.github,
            linkedin: applicationForm.linkedin,
            ...(uploadedNewFile && {
                resumeFileName: uploadedNewFile.name,
                resumeFileSize: uploadedNewFile.size,
                resumeLastUpdated: 'Uploaded today'
            })
        }));

        if (selectedJobForApply) {
            setAppliedJobIds(prev => new Set(prev).add(selectedJobForApply.id));
        }

        setApplySuccessState(true);
    };

    return (
        <div className="jobs-container">
            {/* ── 1. Heading & Search Header ─────────────────────────────────── */}
            <section className="jobs-header">
                <div className="jobs-header-title-area">
                    <h1>
                        <Sparkles size={28} color="#60a5fa" />
                        Find Your Jobs and Internships
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="jobs-search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        className="jobs-search-input"
                        placeholder="Search by job title, company name, skills (e.g. React, Python), or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="search-clear-btn"
                            onClick={() => setSearchQuery('')}
                            title="Clear search"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </section>

            {/* ── 2. Filters Bar ────────────────────────────────────────────── */}
            <div className="jobs-filters-row">
                <div className="filter-pills">
                    <button
                        className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All Opportunities
                        <span className="filter-count-badge">{jobs.length}</span>
                    </button>
                    <button
                        className={`filter-pill ${activeFilter === 'full-time' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('full-time')}
                    >
                        <Briefcase size={14} /> Full Time
                        <span className="filter-count-badge">
                            {jobs.filter(j => j.type.toLowerCase() === 'full-time').length}
                        </span>
                    </button>
                    <button
                        className={`filter-pill ${activeFilter === 'internship' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('internship')}
                    >
                        <GraduationCap size={14} /> Internship
                        <span className="filter-count-badge">
                            {jobs.filter(j => j.type.toLowerCase() === 'internship').length}
                        </span>
                    </button>
                    <button
                        className={`filter-pill eligible-pill ${activeFilter === 'eligible' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('eligible')}
                    >
                        <CheckCircle size={14} /> Eligible Only
                        <span className="filter-count-badge">{eligibleJobsCount}</span>
                    </button>
                </div>

                {/* Active filter helper text */}
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Showing <strong>{filteredJobs.length}</strong> of {jobs.length} roles
                </span>
            </div>

            {/* ── 3. Eligibility Summary Count Banner ───────────────────────── */}
            <div className="eligibility-summary-card">
                <div className="eligibility-summary-left">
                    <div className="eligibility-icon-badge">
                        <Award size={20} />
                    </div>
                    <div>
                        <h4>Your Eligibility Status ({studentProfile.branch} | CGPA: {studentProfile.cgpa})</h4>
                        <p>Based on your current academic record, you meet the criteria for majority of campus drives.</p>
                    </div>
                </div>
                <div className="eligibility-counter-pill">
                    🎯 Eligible for {eligibleJobsCount} of {jobs.length} Opportunities
                </div>
            </div>

            {/* ── 4. Job Posts Grid ─────────────────────────────────────────── */}
            <div className="jobs-grid">
                {filteredJobs.length === 0 ? (
                    <div className="no-jobs-found">
                        <AlertTriangle size={40} color="#94a3b8" />
                        <h3>No matching jobs or internships found</h3>
                        <p>Try refining your search terms or clearing active filters to view all listings.</p>
                        <button
                            className="no-jobs-reset-btn"
                            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    filteredJobs.map((job) => {
                        const eligibility = checkEligibility(job.criteria);
                        const isApplied = appliedJobIds.has(job.id);

                        return (
                            <div key={job.id} className="job-card-wrapper">
                                <div>
                                    {/* Top: Brand & Badge */}
                                    <div className="job-card-top">
                                        <div className="job-company-brand">
                                            <div className="company-logo-avatar" style={{ background: job.color }}>
                                                {job.company.charAt(0)}
                                            </div>
                                            <div className="company-name-meta">
                                                <h3>{job.role}</h3>
                                                <span className="company-sub">
                                                    <Building size={13} /> {job.company}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`job-type-badge ${job.type.toLowerCase() === 'full-time' ? 'full-time' : 'internship'}`}>
                                            {job.type}
                                        </span>
                                    </div>

                                    {/* Meta Snippets (Salary, Location, Deadline) */}
                                    <div className="job-details-snippet">
                                        <div className="snippet-item salary">
                                            <DollarSign size={14} /> {job.salary}
                                        </div>
                                        <div className="snippet-item">
                                            <MapPin size={14} /> {job.location}
                                        </div>
                                        <div className="snippet-item">
                                            <Calendar size={14} /> Deadline: {job.deadline}
                                        </div>
                                    </div>

                                    {/* Skills chips */}
                                    <div className="job-skills-wrap">
                                        {job.skills.map((skill, idx) => (
                                            <span key={idx} className="skill-chip">{skill}</span>
                                        ))}
                                    </div>

                                    {/* Eligibility status on card */}
                                    <div className={`job-card-eligibility ${eligibility.isEligible ? 'eligible' : 'not-eligible'}`}>
                                        {eligibility.isEligible ? (
                                            <>
                                                <CheckCircle size={14} />
                                                <span>You are eligible to apply (Min CGPA: {job.criteria.minCgpa})</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={14} />
                                                <span>{eligibility.reason}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* 2 Action Buttons: View Details & Apply Now */}
                                <div className="job-card-actions">
                                    <button
                                        className="btn-view-details"
                                        onClick={() => setSelectedJobForDetails(job)}
                                    >
                                        <Eye size={15} /> View Details
                                    </button>

                                    {isApplied ? (
                                        <button className="btn-apply-job applied" disabled>
                                            <Check size={15} /> Applied
                                        </button>
                                    ) : !eligibility.backlogsOk ? (
                                        <button
                                            className="btn-apply-job not-eligible-btn"
                                            disabled
                                            title={`Cannot apply: ${studentProfile.backlogs} active backlog(s) recorded in your profile.`}
                                        >
                                            <XCircle size={14} /> Backlog Present
                                        </button>
                                    ) : !eligibility.isEligible ? (
                                        <button
                                            className="btn-apply-job not-eligible-btn"
                                            disabled
                                            title={eligibility.reason}
                                        >
                                            <XCircle size={14} /> Not Eligible
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-apply-job"
                                            onClick={() => handleOpenApplyModal(job)}
                                        >
                                            <Send size={14} /> Apply Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── 5. VIEW DETAILS MODAL ─────────────────────────────────────── */}
            {selectedJobForDetails && (() => {
                const job = selectedJobForDetails;
                const eligibility = checkEligibility(job.criteria);
                const isApplied = appliedJobIds.has(job.id);

                return (
                    <div className="modal-backdrop" onClick={() => setSelectedJobForDetails(null)}>
                        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-custom">
                                <h2>Job & Internship Details</h2>
                                <button className="modal-close-icon-btn" onClick={() => setSelectedJobForDetails(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-scrollable-body">
                                {/* Company Banner */}
                                <div className="modal-company-hero">
                                    <div className="company-logo-avatar" style={{ background: job.color, width: 52, height: 52 }}>
                                        {job.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h3>{job.role}</h3>
                                        <p>{job.company} • {job.location}</p>
                                    </div>
                                </div>

                                {/* Quick Info Grid */}
                                <div className="modal-info-grid">
                                    <div className="modal-info-card">
                                        <span>Employment Type</span>
                                        <strong>{job.type}</strong>
                                    </div>
                                    <div className="modal-info-card">
                                        <span>Package / Stipend</span>
                                        <strong style={{ color: '#059669' }}>{job.salary}</strong>
                                    </div>
                                    <div className="modal-info-card">
                                        <span>Application Deadline</span>
                                        <strong style={{ color: '#ef4444' }}>{job.deadline}</strong>
                                    </div>
                                </div>

                                {/* Student Eligibility Checker Box */}
                                <div className={`modal-eligibility-box ${eligibility.isEligible ? 'passed' : 'failed'}`}>
                                    <div className="eligibility-box-title">
                                        {eligibility.isEligible ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                        <span>{eligibility.isEligible ? 'You are Fully Eligible to Apply!' : 'Eligibility Criteria Check Failed'}</span>
                                    </div>
                                    <div className="eligibility-criteria-grid">
                                        <div className={`criteria-item ${eligibility.cgpaOk ? 'ok' : 'fail'}`}>
                                            {eligibility.cgpaOk ? <Check size={14} /> : <X size={14} />}
                                            <span>CGPA: <strong>{studentProfile.cgpa}</strong> (Req: &ge; {job.criteria.minCgpa})</span>
                                        </div>
                                        <div className={`criteria-item ${eligibility.branchOk ? 'ok' : 'fail'}`}>
                                            {eligibility.branchOk ? <Check size={14} /> : <X size={14} />}
                                            <span>Branch: <strong>{studentProfile.branch}</strong> ({job.criteria.eligibleBranches.join(', ')})</span>
                                        </div>
                                        <div className={`criteria-item ${eligibility.backlogsOk ? 'ok' : 'fail'}`}>
                                            {eligibility.backlogsOk ? <Check size={14} /> : <X size={14} />}
                                            <span>Backlogs: <strong>{studentProfile.backlogs}</strong> (Max allowed: {job.criteria.maxBacklogs})</span>
                                        </div>
                                        <div className="criteria-item ok">
                                            <Check size={14} />
                                            <span>Batch: <strong>{job.criteria.graduationYear} Graduates</strong></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Description */}
                                <div>
                                    <h4 className="modal-section-title">About the Role</h4>
                                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>{job.description}</p>
                                </div>

                                {/* Key Responsibilities */}
                                <div>
                                    <h4 className="modal-section-title">Key Responsibilities</h4>
                                    <ul className="modal-bullet-list">
                                        {job.responsibilities.map((resp, i) => (
                                            <li key={i}>{resp}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Qualifications & Requirements */}
                                <div>
                                    <h4 className="modal-section-title">Qualifications & Skill Requirements</h4>
                                    <ul className="modal-bullet-list">
                                        {job.qualifications.map((qual, i) => (
                                            <li key={i}>{qual}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Skills Tags */}
                                <div>
                                    <h4 className="modal-section-title">Required Technical Skills</h4>
                                    <div className="job-skills-wrap">
                                        {job.skills.map((skill, idx) => (
                                            <span key={idx} className="skill-chip">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer-custom">
                                <button className="btn-secondary" onClick={() => setSelectedJobForDetails(null)}>
                                    Close
                                </button>
                                {isApplied ? (
                                    <button className="btn-apply-job applied" disabled>
                                        <Check size={16} /> Already Applied
                                    </button>
                                ) : !eligibility.backlogsOk ? (
                                    <button className="btn-apply-job not-eligible-btn" disabled>
                                        <XCircle size={15} /> Cannot Apply ({studentProfile.backlogs} Backlog Active)
                                    </button>
                                ) : !eligibility.isEligible ? (
                                    <button className="btn-apply-job not-eligible-btn" disabled>
                                        <XCircle size={15} /> Not Eligible ({eligibility.reason})
                                    </button>
                                ) : (
                                    <button
                                        className="btn-primary"
                                        onClick={() => {
                                            setSelectedJobForDetails(null);
                                            handleOpenApplyModal(job);
                                        }}
                                    >
                                        <Send size={15} /> Apply Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── 6. APPLY NOW MODAL ────────────────────────────────────────── */}
            {selectedJobForApply && (
                <div className="modal-backdrop" onClick={() => setSelectedJobForApply(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h2>Submit Job Application</h2>
                            <button className="modal-close-icon-btn" onClick={() => setSelectedJobForApply(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        {applySuccessState ? (
                            <div className="modal-scrollable-body">
                                <div className="apply-success-view">
                                    <div className="apply-success-icon">
                                        <CheckCircle size={38} />
                                    </div>
                                    <h3>Application Successfully Submitted!</h3>
                                    <p>
                                        Your application for <strong>{selectedJobForApply.role}</strong> at <strong>{selectedJobForApply.company}</strong> has been received with your updated profile details and resume.
                                    </p>
                                    <button
                                        className="btn-primary"
                                        style={{ marginTop: '1rem' }}
                                        onClick={() => setSelectedJobForApply(null)}
                                    >
                                        Done & Back to Jobs
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitApplication} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                <div className="modal-scrollable-body">
                                    {/* Application Target Banner */}
                                    <div className="apply-summary-banner">
                                        <div>
                                            <h4>{selectedJobForApply.role}</h4>
                                            <p>{selectedJobForApply.company} • {selectedJobForApply.type} • {selectedJobForApply.salary}</p>
                                        </div>
                                        <span className="job-type-badge full-time">Drive Active</span>
                                    </div>

                                    {/* 6.1 Student Details Section with Edit Option */}
                                    <div className="apply-section-card">
                                        <div className="apply-section-header">
                                            <h4>
                                                <GraduationCap size={17} color="#2563eb" />
                                                Applicant Student Information
                                            </h4>
                                            <button
                                                type="button"
                                                className="edit-toggle-btn"
                                                onClick={() => setIsEditingProfileInModal(!isEditingProfileInModal)}
                                            >
                                                <Edit2 size={13} />
                                                {isEditingProfileInModal ? 'Done Editing' : 'Edit Details'}
                                            </button>
                                        </div>

                                        <div className="student-fields-grid">
                                            <div className="student-field-item">
                                                <label>Full Name</label>
                                                {isEditingProfileInModal ? (
                                                    <input
                                                        type="text"
                                                        value={applicationForm.name}
                                                        onChange={(e) => setApplicationForm({ ...applicationForm, name: e.target.value })}
                                                        required
                                                    />
                                                ) : (
                                                    <div className="student-field-val">{applicationForm.name}</div>
                                                )}
                                            </div>

                                            <div className="student-field-item">
                                                <label>Email Address</label>
                                                {isEditingProfileInModal ? (
                                                    <input
                                                        type="email"
                                                        value={applicationForm.email}
                                                        onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                                                        required
                                                    />
                                                ) : (
                                                    <div className="student-field-val">{applicationForm.email}</div>
                                                )}
                                            </div>

                                            <div className="student-field-item">
                                                <label>Phone Number</label>
                                                {isEditingProfileInModal ? (
                                                    <input
                                                        type="tel"
                                                        value={applicationForm.phone}
                                                        onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                                                        required
                                                    />
                                                ) : (
                                                    <div className="student-field-val">{applicationForm.phone}</div>
                                                )}
                                            </div>

                                            <div className="student-field-item">
                                                <label>Branch / Department</label>
                                                {isEditingProfileInModal ? (
                                                    <input
                                                        type="text"
                                                        value={applicationForm.branch}
                                                        onChange={(e) => setApplicationForm({ ...applicationForm, branch: e.target.value })}
                                                        required
                                                    />
                                                ) : (
                                                    <div className="student-field-val">{applicationForm.branch} Engineering</div>
                                                )}
                                            </div>

                                            <div className="student-field-item">
                                                <label>Current CGPA</label>
                                                {isEditingProfileInModal ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="10"
                                                        value={applicationForm.cgpa}
                                                        onChange={(e) => setApplicationForm({ ...applicationForm, cgpa: e.target.value })}
                                                        required
                                                    />
                                                ) : (
                                                    <div className="student-field-val">{applicationForm.cgpa} / 10.0</div>
                                                )}
                                            </div>

                                            <div className="student-field-item">
                                                <label>Graduation Batch Year</label>
                                                {isEditingProfileInModal ? (
                                                    <input
                                                        type="text"
                                                        value={applicationForm.graduationYear}
                                                        onChange={(e) => setApplicationForm({ ...applicationForm, graduationYear: e.target.value })}
                                                        required
                                                    />
                                                ) : (
                                                    <div className="student-field-val">Class of {applicationForm.graduationYear}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6.2 Current Resume Attached & Upload New Option */}
                                    <div className="apply-section-card">
                                        <div className="apply-section-header">
                                            <h4>
                                                <FileText size={17} color="#ef4444" />
                                                Resume Attachment
                                            </h4>
                                        </div>

                                        {/* Current Attached Resume Display */}
                                        <div className="resume-display-card">
                                            <div className="resume-meta">
                                                <div className="resume-icon-badge">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h5>{uploadedNewFile ? uploadedNewFile.name : studentProfile.resumeFileName}</h5>
                                                    <p>{uploadedNewFile ? `${uploadedNewFile.size} • ${uploadedNewFile.lastUpdated}` : `${studentProfile.resumeFileSize} • ${studentProfile.resumeLastUpdated}`}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                onClick={() => alert(`Previewing: ${uploadedNewFile ? uploadedNewFile.name : studentProfile.resumeFileName}`)}
                                            >
                                                <Eye size={13} /> View
                                            </button>
                                        </div>

                                        {/* Upload New Resume Drag/File Input */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileUpload}
                                        />
                                        <div
                                            className="upload-new-resume-box"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload size={20} color="#2563eb" />
                                            <p><strong>Click to upload</strong> or replace with a new resume</p>
                                            <span>Supported formats: PDF, DOCX (Max 5MB)</span>
                                        </div>
                                    </div>

                                    {/* 6.3 Optional Links & Note */}
                                    <div className="apply-section-card">
                                        <div className="apply-section-header">
                                            <h4>
                                                <ExternalLink size={16} color="#475569" />
                                                Portfolio & Profiles (Optional)
                                            </h4>
                                        </div>
                                        <div className="student-fields-grid">
                                            <div className="student-field-item">
                                                <label>GitHub Profile</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://github.com/username"
                                                    value={applicationForm.github}
                                                    onChange={(e) => setApplicationForm({ ...applicationForm, github: e.target.value })}
                                                />
                                            </div>
                                            <div className="student-field-item">
                                                <label>LinkedIn Profile</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://linkedin.com/in/username"
                                                    value={applicationForm.linkedin}
                                                    onChange={(e) => setApplicationForm({ ...applicationForm, linkedin: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer-custom">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setSelectedJobForApply(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                    >
                                        <Send size={15} /> Confirm & Apply
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}