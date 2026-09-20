import React, { useState, useEffect } from 'react';
import {
    Building, Mail, Phone, Globe, MapPin,
    GraduationCap, Award, Edit, Check, X,
    ShieldCheck, PlusCircle
} from 'lucide-react';
import { recruiterService } from '../../services/recruiterService';
import './RecruiterCompanyProfile.css';

const DEFAULT_PROFILE = {
    companyName: 'TechCorp Solutions',
    recruiterName: 'Recruiter Admin',
    email: 'recruiter@techcorp.com',
    phone: '+91 99887 76655',
    website: 'https://techcorp.com',
    description: 'TechCorp Solutions is an enterprise technology provider partnering with top universities for graduate recruitment drives.',
    hiringBranches: ['CSE', 'IT', 'AI/DS', 'ECE'],
    minCgpa: 7.0
};

export default function RecruiterCompanyProfile({ user }) {
    const [profile, setProfile] = useState(DEFAULT_PROFILE);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_PROFILE);
    const [newBranchInput, setNewBranchInput] = useState('');
    const [saveFeedback, setSaveFeedback] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const loaded = await recruiterService.getCompanyProfile();
                if (loaded && typeof loaded === 'object') {
                    const normalized = {
                        ...DEFAULT_PROFILE,
                        ...loaded,
                        hiringBranches: Array.isArray(loaded.hiringBranches) ? loaded.hiringBranches : DEFAULT_PROFILE.hiringBranches
                    };
                    setProfile(normalized);
                    setFormData(normalized);
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
            }
        };
        fetchProfile();
    }, []);

    const handleAddBranch = () => {
        const branches = Array.isArray(formData.hiringBranches) ? formData.hiringBranches : [];
        if (newBranchInput.trim() && !branches.includes(newBranchInput.trim().toUpperCase())) {
            setFormData(prev => ({
                ...prev,
                hiringBranches: [...branches, newBranchInput.trim().toUpperCase()]
            }));
            setNewBranchInput('');
        }
    };

    const handleRemoveBranch = (branch) => {
        const branches = Array.isArray(formData.hiringBranches) ? formData.hiringBranches : [];
        setFormData(prev => ({
            ...prev,
            hiringBranches: branches.filter(b => b !== branch)
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const updated = await recruiterService.updateCompanyProfile(formData);
            const normalized = {
                ...DEFAULT_PROFILE,
                ...(updated || formData)
            };
            setProfile(normalized);
            setIsEditing(false);
            setSaveFeedback(true);
            setTimeout(() => setSaveFeedback(false), 3000);
        } catch (err) {
            console.error('Failed to update company profile:', err);
        }
    };

    const handleCancel = () => {
        setFormData({ ...profile });
        setIsEditing(false);
    };

    const displayBranches = Array.isArray(profile?.hiringBranches) ? profile.hiringBranches : DEFAULT_PROFILE.hiringBranches;
    const formBranches = Array.isArray(formData?.hiringBranches) ? formData.hiringBranches : DEFAULT_PROFILE.hiringBranches;

    return (
        <div className="rcmp-container">
            {saveFeedback && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.85rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem' }}>
                    <Check size={16} /> Company profile updated successfully!
                </div>
            )}

            <div className="rcmp-card">
                {/* Header Banner */}
                <div className="rcmp-card-header">
                    <div className="rcmp-header-left">
                        <div className="rcmp-logo-box">
                            {profile.companyName ? profile.companyName[0] : 'C'}
                        </div>
                        <div className="rcmp-title-wrap">
                            <h2>{profile.companyName || 'Company Profile'}</h2>
                            <p>
                                <ShieldCheck size={15} style={{ color: '#2dd4bf' }} /> Verified Campus Recruitment Partner
                            </p>
                        </div>
                    </div>

                    {!isEditing && (
                        <button className="rcmp-edit-toggle-btn" onClick={() => setIsEditing(true)}>
                            <Edit size={15} /> Edit Profile
                        </button>
                    )}
                </div>

                {/* Body Content */}
                <div className="rcmp-card-body">
                    {isEditing ? (
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* General details */}
                            <div className="rcmp-section">
                                <div className="rcmp-sec-title">
                                    <Building size={16} /> General Organization Details
                                </div>
                                <div className="rcmp-grid-2">
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Company Name *</label>
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            required
                                            value={formData.companyName || ''}
                                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                        />
                                    </div>
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Website URL</label>
                                        <input
                                            type="url"
                                            className="rj-form-input"
                                            value={formData.website || ''}
                                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="rcmp-grid-2">
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Primary Recruiter Contact Name</label>
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            value={formData.recruiterName || ''}
                                            onChange={e => setFormData({ ...formData, recruiterName: e.target.value })}
                                        />
                                    </div>
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Work Email</label>
                                        <input
                                            type="email"
                                            className="rj-form-input"
                                            value={formData.email || ''}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="rj-form-group">
                                    <label className="rj-form-label">Company Overview / Description</label>
                                    <textarea
                                        rows={4}
                                        className="rj-form-textarea"
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Hiring Preferences */}
                            <div className="rcmp-section">
                                <div className="rcmp-sec-title">
                                    <GraduationCap size={16} /> Campus Hiring Criteria
                                </div>
                                <div className="rcmp-grid-2">
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Default Minimum CGPA Cutoff</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            className="rj-form-input"
                                            value={formData.minCgpa ?? 7.0}
                                            onChange={e => setFormData({ ...formData, minCgpa: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="rj-form-group">
                                        <label className="rj-form-label">Contact Phone</label>
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            value={formData.phone || ''}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="rj-form-group">
                                    <label className="rj-form-label">Target Campus Branches</label>
                                    <div className="rj-skills-list" style={{ marginBottom: '0.4rem' }}>
                                        {formBranches.map((b, idx) => (
                                            <span key={idx} className="rcp-skill-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                                {b}
                                                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveBranch(b)} />
                                            </span>
                                        ))}
                                    </div>
                                    <div className="rj-tags-creator">
                                        <input
                                            type="text"
                                            className="rj-form-input"
                                            placeholder="Add branch code (e.g. MECH, CIVIL)"
                                            value={newBranchInput}
                                            onChange={e => setNewBranchInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBranch(); } }}
                                        />
                                        <button type="button" className="rj-add-tag-btn" onClick={handleAddBranch}>
                                            + Add Branch
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="rcmp-save-bar">
                                <button type="button" className="rj-action-btn" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button type="submit" className="rj-post-btn">
                                    Save Profile Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {/* General View */}
                            <div className="rcmp-section">
                                <div className="rcmp-sec-title">
                                    <Building size={16} /> Company Details
                                </div>
                                <div className="rcmp-grid-2">
                                    <div className="rcmp-info-item">
                                        <span className="rcmp-info-lbl">Organization Name</span>
                                        <span className="rcmp-info-val">{profile.companyName}</span>
                                    </div>
                                    <div className="rcmp-info-item">
                                        <span className="rcmp-info-lbl">Official Website</span>
                                        <span className="rcmp-info-val">
                                            {profile.website ? (
                                                <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a>
                                            ) : (
                                                <span style={{ color: '#94a3b8' }}>Not specified</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="rcmp-info-item">
                                        <span className="rcmp-info-lbl">Lead Recruiter</span>
                                        <span className="rcmp-info-val">{profile.recruiterName || 'Campus Recruiter'}</span>
                                    </div>
                                    <div className="rcmp-info-item">
                                        <span className="rcmp-info-lbl">Work Email</span>
                                        <span className="rcmp-info-val">{profile.email || (user?.email || 'recruiter@company.com')}</span>
                                    </div>
                                    <div className="rcmp-info-item">
                                        <span className="rcmp-info-lbl">Contact Number</span>
                                        <span className="rcmp-info-val">{profile.phone || '+91 98765 43210'}</span>
                                    </div>
                                    <div className="rcmp-info-item">
                                        <span className="rcmp-info-lbl">Account Role</span>
                                        <span className="rcmp-info-val" style={{ color: '#0d9488' }}>Campus Hiring Administrator</span>
                                    </div>
                                </div>

                                <div className="rcmp-info-item" style={{ marginTop: '0.5rem' }}>
                                    <span className="rcmp-info-lbl">About Organization</span>
                                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.55 }}>
                                        {profile.description || 'No description provided yet.'}
                                    </p>
                                </div>
                            </div>

                            {/* Hiring criteria View */}
                            <div className="rcmp-section">
                                <div className="rcmp-sec-title">
                                    <GraduationCap size={16} /> Placement Standards & Preferences
                                </div>
                                <div className="rcmp-grid-2">
                                    <div className="rcmp-info-item">
                                        <span className="rcmp-info-lbl">Default Minimum CGPA Requirement</span>
                                        <span className="rcmp-info-val" style={{ color: '#059669', fontSize: '1.1rem' }}>
                                            {profile.minCgpa ?? '7.0'} / 10.0
                                        </span>
                                    </div>
                                    <div className="rcmp-info-item">
                                        <span className="rcmp-info-lbl">Verification Status</span>
                                        <span className="rec-badge active" style={{ width: 'fit-content', marginTop: '0.2rem' }}>
                                            Active Campus Partner
                                        </span>
                                    </div>
                                </div>

                                <div className="rcmp-info-item" style={{ marginTop: '0.5rem' }}>
                                    <span className="rcmp-info-lbl">Eligible Campus Branches</span>
                                    <div className="rj-skills-list" style={{ marginTop: '0.35rem' }}>
                                        {displayBranches.map((b, idx) => (
                                            <span key={idx} className="rcp-skill-pill">{b}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
