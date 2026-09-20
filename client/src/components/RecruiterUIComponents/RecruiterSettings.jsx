import React, { useState, useEffect } from 'react';
import {
    Settings, Bell, Cpu, Video, Shield,
    Check, Save, RefreshCw
} from 'lucide-react';
import { recruiterService } from '../../services/recruiterService';
import './RecruiterSettings.css';

const DEFAULT_SETTINGS = {
    emailAlertsNewApplicant: true,
    emailAlertsInterviewReminder: true,
    emailAlertsStatusChanges: false,
    autoShortlistCgpa: 8.0,
    autoShortlistEnabled: false,
    defaultInterviewDuration: '45 mins',
    defaultMeetingPlatform: 'Google Meet',
    twoFactorAuth: false
};

export default function RecruiterSettings() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saveFeedback, setSaveFeedback] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const loaded = await recruiterService.getSettings();
                if (loaded && typeof loaded === 'object') {
                    setSettings({ ...DEFAULT_SETTINGS, ...loaded });
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
            }
        };
        fetchSettings();
    }, []);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await recruiterService.updateSettings(settings);
            setSaveFeedback(true);
            setTimeout(() => setSaveFeedback(false), 3000);
        } catch (err) {
            console.error('Failed to update settings:', err);
        }
    };

    return (
        <div className="rset-container">
            {saveFeedback && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.85rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem' }}>
                    <Check size={16} /> Preferences and configuration saved successfully!
                </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* 1. Notification Preferences */}
                <div className="rset-section-card">
                    <div className="rset-section-header">
                        <Bell size={18} />
                        <h3>Email & Alert Preferences</h3>
                    </div>
                    <div className="rset-section-body">
                        <div className="rset-toggle-row">
                            <div className="rset-toggle-text">
                                <h4>New Application Notifications</h4>
                                <p>Receive instant notifications when students apply for your active job postings.</p>
                            </div>
                            <label className="rset-switch">
                                <input
                                    type="checkbox"
                                    checked={!!settings.emailAlertsNewApplicant}
                                    onChange={() => handleToggle('emailAlertsNewApplicant')}
                                />
                                <span className="rset-slider" />
                            </label>
                        </div>

                        <div className="rset-toggle-row">
                            <div className="rset-toggle-text">
                                <h4>Interview Reminders</h4>
                                <p>Get reminders 2 hours before scheduled candidate technical rounds.</p>
                            </div>
                            <label className="rset-switch">
                                <input
                                    type="checkbox"
                                    checked={!!settings.emailAlertsInterviewReminder}
                                    onChange={() => handleToggle('emailAlertsInterviewReminder')}
                                />
                                <span className="rset-slider" />
                            </label>
                        </div>

                        <div className="rset-toggle-row">
                            <div className="rset-toggle-text">
                                <h4>Candidate Offer Acceptance Alerts</h4>
                                <p>Receive notifications when candidates accept or decline job offers.</p>
                            </div>
                            <label className="rset-switch">
                                <input
                                    type="checkbox"
                                    checked={!!settings.emailAlertsStatusChanges}
                                    onChange={() => handleToggle('emailAlertsStatusChanges')}
                                />
                                <span className="rset-slider" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* 2. Automated Pipeline Rules */}
                <div className="rset-section-card">
                    <div className="rset-section-header">
                        <Cpu size={18} />
                        <h3>Recruitment Automation & Screening</h3>
                    </div>
                    <div className="rset-section-body">
                        <div className="rset-toggle-row">
                            <div className="rset-toggle-text">
                                <h4>Auto-Shortlist High Performers</h4>
                                <p>Automatically move applicants with high CGPA directly to the shortlisted pool.</p>
                            </div>
                            <label className="rset-switch">
                                <input
                                    type="checkbox"
                                    checked={!!settings.autoShortlistEnabled}
                                    onChange={() => handleToggle('autoShortlistEnabled')}
                                />
                                <span className="rset-slider" />
                            </label>
                        </div>

                        {settings.autoShortlistEnabled && (
                            <div className="rj-form-group" style={{ maxWidth: '300px', marginTop: '0.25rem' }}>
                                <label className="rj-form-label">Auto-Shortlist CGPA Threshold</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="7"
                                    max="10"
                                    className="rj-form-input"
                                    value={settings.autoShortlistCgpa ?? 8.0}
                                    onChange={e => handleChange('autoShortlistCgpa', parseFloat(e.target.value) || 8.0)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Interview Preferences */}
                <div className="rset-section-card">
                    <div className="rset-section-header">
                        <Video size={18} />
                        <h3>Interview Environment Defaults</h3>
                    </div>
                    <div className="rset-section-body">
                        <div className="rj-form-row-2">
                            <div className="rj-form-group">
                                <label className="rj-form-label">Default Meeting Platform</label>
                                <select
                                    className="rj-form-select"
                                    value={settings.defaultMeetingPlatform || 'Google Meet'}
                                    onChange={e => handleChange('defaultMeetingPlatform', e.target.value)}
                                >
                                    <option value="Google Meet">Google Meet</option>
                                    <option value="Microsoft Teams">Microsoft Teams</option>
                                    <option value="Zoom">Zoom</option>
                                    <option value="In-Person Placement Cell">In-Person Placement Cell</option>
                                </select>
                            </div>

                            <div className="rj-form-group">
                                <label className="rj-form-label">Default Slot Duration</label>
                                <select
                                    className="rj-form-select"
                                    value={settings.defaultInterviewDuration || '45 mins'}
                                    onChange={e => handleChange('defaultInterviewDuration', e.target.value)}
                                >
                                    <option value="30 mins">30 minutes</option>
                                    <option value="45 mins">45 minutes</option>
                                    <option value="60 mins">60 minutes</option>
                                    <option value="90 mins">90 minutes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Security */}
                <div className="rset-section-card">
                    <div className="rset-section-header">
                        <Shield size={18} />
                        <h3>Security & Authentication</h3>
                    </div>
                    <div className="rset-section-body">
                        <div className="rset-toggle-row">
                            <div className="rset-toggle-text">
                                <h4>Two-Factor Authentication (2FA)</h4>
                                <p>Require an authentication code when signing in to your recruiter console.</p>
                            </div>
                            <label className="rset-switch">
                                <input
                                    type="checkbox"
                                    checked={!!settings.twoFactorAuth}
                                    onChange={() => handleToggle('twoFactorAuth')}
                                />
                                <span className="rset-slider" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save CTA */}
                <div className="rset-save-footer">
                    <button type="submit" className="rj-post-btn">
                        <Save size={16} /> Save All Preferences
                    </button>
                </div>
            </form>
        </div>
    );
}
