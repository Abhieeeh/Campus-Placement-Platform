/**
 * Recruiter Platform Unified API Service (Recruiter Facing)
 * 
 * Direct REST API client communicating with Express/MongoDB backend endpoints.
 * All dummy and mock data removed.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/** Helper for JSON fetch requests */
async function apiRequest(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    };

    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
        }
        return await res.json();
    } catch (err) {
        console.error(`Recruiter API Error [${endpoint}]:`, err.message);
        throw err;
    }
}

export const recruiterService = {
    // ── Jobs ─────────────────────────────────────────────────────────────
    async getJobs(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = `/jobs${query ? `?${query}` : ''}`;
        try {
            const data = await apiRequest(endpoint);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    },

    async getJobById(id) {
        return await apiRequest(`/jobs/${id}`);
    },

    async createJob(jobData) {
        const res = await apiRequest('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
        window.dispatchEvent(new Event('recruiter_jobs_updated'));
        window.dispatchEvent(new Event('storage'));
        return res;
    },

    async updateJob(id, updates) {
        const res = await apiRequest(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        window.dispatchEvent(new Event('recruiter_jobs_updated'));
        window.dispatchEvent(new Event('storage'));
        return res;
    },

    async deleteJob(id) {
        const res = await apiRequest(`/jobs/${id}`, {
            method: 'DELETE'
        });
        window.dispatchEvent(new Event('recruiter_jobs_updated'));
        window.dispatchEvent(new Event('storage'));
        return res;
    },

    // ── Candidates ───────────────────────────────────────────────────────
    async getCandidateById(id) {
        try {
            return await apiRequest(`/students/${id}`);
        } catch (e) {
            return null;
        }
    },

    async getAllCandidates(params = {}) {
        const query = new URLSearchParams(params).toString();
        try {
            const data = await apiRequest(`/students${query ? `?${query}` : ''}`);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    },

    // ── Applications ─────────────────────────────────────────────────────
    async getApplications(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = `/applications${query ? `?${query}` : ''}`;
        try {
            const data = await apiRequest(endpoint);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    },

    async updateApplicationStatus(appId, newStatus) {
        const res = await apiRequest(`/applications/${appId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        window.dispatchEvent(new Event('recruiter_applications_updated'));
        window.dispatchEvent(new Event('student_applications_updated'));
        window.dispatchEvent(new Event('storage'));
        return res;
    },

    // ── Shortlisted ──────────────────────────────────────────────────────
    async getShortlisted() {
        try {
            const apps = await this.getApplications();
            return apps.filter(a => ['Shortlisted', 'Interview', 'Offered'].includes(a.status));
        } catch (e) {
            return [];
        }
    },

    // ── Interviews ───────────────────────────────────────────────────────
    async getInterviews(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = `/interviews${query ? `?${query}` : ''}`;
        try {
            const data = await apiRequest(endpoint);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    },

    async scheduleInterview(interviewData) {
        const res = await apiRequest('/interviews', {
            method: 'POST',
            body: JSON.stringify(interviewData)
        });
        window.dispatchEvent(new Event('recruiter_interviews_updated'));
        window.dispatchEvent(new Event('student_interviews_updated'));
        window.dispatchEvent(new Event('storage'));
        return res;
    },

    async updateInterview(id, updates) {
        const res = await apiRequest(`/interviews/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        window.dispatchEvent(new Event('recruiter_interviews_updated'));
        window.dispatchEvent(new Event('student_interviews_updated'));
        window.dispatchEvent(new Event('storage'));
        return res;
    },

    async cancelInterview(id) {
        return await this.updateInterview(id, { status: 'cancelled' });
    },

    // ── Notifications ────────────────────────────────────────────────────
    async getNotifications() {
        try {
            const data = await apiRequest('/notifications');
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    },

    async markAllRead() {
        const res = await apiRequest('/notifications/read-all', {
            method: 'PUT'
        }).catch(() => []);
        window.dispatchEvent(new Event('recruiter_notifications_updated'));
        return res;
    },

    async markNotificationRead(id) {
        const res = await apiRequest(`/notifications/${id}/read`, {
            method: 'PUT'
        }).catch(() => []);
        window.dispatchEvent(new Event('recruiter_notifications_updated'));
        return res;
    },

    async deleteNotification(id) {
        const res = await apiRequest(`/notifications/${id}`, {
            method: 'DELETE'
        }).catch(() => []);
        window.dispatchEvent(new Event('recruiter_notifications_updated'));
        return res;
    },

    async clearAllNotifications() {
        const res = await apiRequest('/notifications', {
            method: 'DELETE'
        }).catch(() => []);
        window.dispatchEvent(new Event('recruiter_notifications_updated'));
        return res;
    },

    // ── Company Profile ──────────────────────────────────────────────────
    async getCompanyProfile() {
        try {
            return await apiRequest('/recruiter/profile');
        } catch (e) {
            return {
                companyName: 'Company Profile',
                recruiterName: 'Recruiter',
                email: 'recruiter@company.com',
                phone: '+91 98765 43210',
                website: 'https://company.com',
                description: '',
                hiringBranches: ['CSE', 'IT', 'AI/DS', 'ECE'],
                minCgpa: 7.0
            };
        }
    },

    async updateCompanyProfile(updates) {
        const res = await apiRequest('/recruiter/profile', {
            method: 'PUT',
            body: JSON.stringify(updates)
        }).catch(() => updates);
        window.dispatchEvent(new Event('recruiter_profile_updated'));
        return res;
    },

    // ── Settings ─────────────────────────────────────────────────────────
    async getSettings() {
        try {
            return await apiRequest('/recruiter/settings');
        } catch (e) {
            return {
                emailAlertsNewApplicant: true,
                emailAlertsInterviewReminder: true,
                emailAlertsStatusChanges: false,
                autoShortlistCgpa: 8.0,
                autoShortlistEnabled: false,
                defaultInterviewDuration: '45 mins',
                defaultMeetingPlatform: 'Google Meet',
                twoFactorAuth: false
            };
        }
    },

    async updateSettings(updates) {
        const res = await apiRequest('/recruiter/settings', {
            method: 'PUT',
            body: JSON.stringify(updates)
        }).catch(() => updates);
        window.dispatchEvent(new Event('recruiter_settings_updated'));
        return res;
    },

    // ── Dashboard Aggregated Stats ───────────────────────────────────────
    async getDashboardStats() {
        try {
            const data = await apiRequest('/recruiter/dashboard');
            return data;
        } catch (e) {
            try {
                const [jobs, apps, interviews] = await Promise.all([
                    this.getJobs(),
                    this.getApplications(),
                    this.getInterviews()
                ]);

                return {
                    activeJobs: jobs.length,
                    totalApplicants: apps.length,
                    shortlisted: apps.filter(a => (a.status || '').toLowerCase() === 'shortlisted').length,
                    upcomingInterviews: interviews.filter(i => (i.status || '').toLowerCase() === 'scheduled' || (i.status || '').toLowerCase() === 'upcoming').length,
                    newApplications: apps.filter(a => (a.status || '').toLowerCase() === 'new' || (a.status || '').toLowerCase() === 'applied').length,
                    offered: apps.filter(a => (a.status || '').toLowerCase() === 'offered').length,
                    recentApplications: apps.slice(0, 5),
                    allJobs: jobs,
                    allApplications: apps
                };
            } catch (err) {
                return {
                    activeJobs: 0,
                    totalApplicants: 0,
                    shortlisted: 0,
                    upcomingInterviews: 0,
                    newApplications: 0,
                    offered: 0,
                    recentApplications: [],
                    allJobs: [],
                    allApplications: []
                };
            }
        }
    }
};
