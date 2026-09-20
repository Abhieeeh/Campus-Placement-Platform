import React, { useState } from 'react';
import {
    Building2, Globe, Mail, Phone, GraduationCap,
    CheckCircle2, AlertTriangle, ArrowRight, Plus, X,
    Briefcase, ShieldCheck, MapPin, Users
} from 'lucide-react';
import { recruiterService } from '../services/recruiterService';
import './RecruiterProfileSetup.css';

const DEFAULT_BRANCH_OPTIONS = [
    'CSE', 'IT', 'AI/DS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MCA'
];

export default function RecruiterProfileSetup({ initialUser, onComplete }) {
    const userEmail = initialUser?.email || '';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        companyName: '',
        recruiterName: '',
        email: userEmail,
        phone: '',
        website: '',
        industry: 'Information Technology & Services',
        location: 'Bangalore, India',
        companySize: '100-500 employees',
        description: '',
        minCgpa: 7.0,
        hiringBranches: ['CSE', 'IT', 'AI/DS', 'ECE']
    });

    const [newBranchInput, setNewBranchInput] = useState('');

    const handleAddBranch = (branchToAdd) => {
        const branch = (branchToAdd || newBranchInput).trim().toUpperCase();
        if (branch && !formData.hiringBranches.includes(branch)) {
            setFormData(prev => ({
                ...prev,
                hiringBranches: [...prev.hiringBranches, branch]
            }));
            setNewBranchInput('');
        }
    };

    const handleRemoveBranch = (branchToRemove) => {
        setFormData(prev => ({
            ...prev,
            hiringBranches: prev.hiringBranches.filter(b => b !== branchToRemove)
        }));
    };

    const validate = () => {
        if (!formData.companyName.trim()) return 'Please enter your Company / Organization name.';
        if (!formData.recruiterName.trim()) return 'Please enter the primary Recruiter / Contact person name.';
        if (!formData.phone.trim()) return 'Please enter a contact phone number.';
        if (formData.hiringBranches.length === 0) return 'Please select at least 1 hiring branch.';
        if (formData.minCgpa === undefined || formData.minCgpa === null || formData.minCgpa < 0 || formData.minCgpa > 10) {
            return 'Please enter a valid Minimum CGPA cutoff between 0 and 10.';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setErrorMessage(err);
            return;
        }
        setErrorMessage('');
        setIsSubmitting(true);

        const payload = {
            email: userEmail || formData.email,
            companyProfile: formData
        };

        try {
            // 1. Send to backend endpoint for database persistence
            await fetch('http://localhost:5000/api/auth/recruiter-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // 2. Update recruiterService cache
            await recruiterService.updateCompanyProfile(formData);

            // 3. Complete onboarding and redirect to Login
            onComplete({
                role: 'recruiter',
                email: userEmail || formData.email,
                message: 'Company profile created successfully! Please sign in to access your recruitment portal.'
            });
        } catch (error) {
            console.error('Failed to save recruiter profile:', error);
            await recruiterService.updateCompanyProfile(formData);
            onComplete({
                role: 'recruiter',
                email: userEmail || formData.email,
                message: 'Company profile saved! Please sign in.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rps-page">
            <div className="rps-container">
                {/* Header card */}
                <div className="rps-header">
                    <div className="rps-badge">
                        <Building2 size={18} />
                        <span>Step 2 of 2: Organization & Drive Setup</span>
                    </div>
                    <h1>Complete Company Profile</h1>
                    <p>
                        Configure your corporate hiring profile and standard university placement criteria to begin hosting recruitment drives.
                    </p>
                </div>

                {errorMessage && (
                    <div className="rps-error-banner">
                        <AlertTriangle size={17} />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Form Card */}
                <div className="rps-card">
                    <form onSubmit={handleSubmit}>
                        {/* Section 1: Company details */}
                        <div className="rps-section-title">
                            <Building2 size={18} />
                            <span>Corporate & Recruiter Details</span>
                        </div>

                        <div className="rps-grid-2">
                            <div className="rps-form-group">
                                <label>Company / Organization Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Innovations Corp"
                                    required
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="rps-form-group">
                                <label>Official Website URL</label>
                                <input
                                    type="url"
                                    placeholder="https://acmecorp.com"
                                    value={formData.website}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="rps-grid-2">
                            <div className="rps-form-group">
                                <label>Lead Recruiter / Contact Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Sarah Jenkins (Talent Lead)"
                                    required
                                    value={formData.recruiterName}
                                    onChange={e => setFormData({ ...formData, recruiterName: e.target.value })}
                                />
                            </div>
                            <div className="rps-form-group">
                                <label>Contact Phone Number *</label>
                                <input
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="rps-grid-2">
                            <div className="rps-form-group">
                                <label>Corporate Registered Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    className="rps-input-readonly"
                                />
                            </div>
                            <div className="rps-form-group">
                                <label>Headquarters / Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bangalore, India"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="rps-form-group">
                            <label>Company Overview & Campus Mission</label>
                            <textarea
                                rows={3}
                                placeholder="Describe your company, work culture, and what roles you hire for."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Section 2: Hiring criteria */}
                        <div className="rps-section-title" style={{ marginTop: '1.75rem' }}>
                            <GraduationCap size={18} />
                            <span>Campus Eligibility Standards</span>
                        </div>

                        <div className="rps-grid-2">
                            <div className="rps-form-group">
                                <label>Default Minimum CGPA Cutoff (0 - 10) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    placeholder="7.0"
                                    required
                                    value={formData.minCgpa}
                                    onChange={e => setFormData({ ...formData, minCgpa: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="rps-form-group">
                                <label>Company Size</label>
                                <select
                                    value={formData.companySize}
                                    onChange={e => setFormData({ ...formData, companySize: e.target.value })}
                                >
                                    <option value="1-50 employees">1-50 employees (Early Stage)</option>
                                    <option value="50-200 employees">50-200 employees (Growing)</option>
                                    <option value="200-1000 employees">200-1000 employees (Mid-sized)</option>
                                    <option value="1000+ employees">1000+ employees (Enterprise)</option>
                                </select>
                            </div>
                        </div>

                        <div className="rps-form-group">
                            <label>Preferred Hiring Branches</label>
                            <div className="rps-branches-wrap">
                                {formData.hiringBranches.map((branch, idx) => (
                                    <span key={idx} className="rps-branch-chip">
                                        {branch}
                                        <button
                                            type="button"
                                            className="rps-chip-remove"
                                            onClick={() => handleRemoveBranch(branch)}
                                        >
                                            <X size={13} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="rps-branch-adder">
                                <input
                                    type="text"
                                    placeholder="Add branch code (e.g. MECH, CIVIL, BIO)"
                                    value={newBranchInput}
                                    onChange={e => setNewBranchInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddBranch();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="rps-btn rps-btn-secondary"
                                    onClick={() => handleAddBranch()}
                                >
                                    <Plus size={15} /> Add
                                </button>
                            </div>

                            <div className="rps-suggestions-row">
                                <span className="rps-sug-lbl">Quick Add:</span>
                                {DEFAULT_BRANCH_OPTIONS.filter(b => !formData.hiringBranches.includes(b)).map((b, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="rps-sug-btn"
                                        onClick={() => handleAddBranch(b)}
                                    >
                                        + {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rps-actions">
                            <div className="rps-shield-note">
                                <ShieldCheck size={16} /> Verified Campus Partner Program
                            </div>

                            <button
                                type="submit"
                                className="rps-btn rps-btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving Profile...' : 'Complete Profile & Continue to Login'}
                                {!isSubmitting && <CheckCircle2 size={16} />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
