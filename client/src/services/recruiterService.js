/**
 * Recruiter Platform Unified API Service (Recruiter Facing)
 * 
 * Direct REST API client communicating with Express/MongoDB backend endpoints.
 * Uses route parameters for clean, RESTful requests.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        const email = typeof params === 'string' ? params : params?.recruiterEmail;
        const endpoint = email ? `/jobs/by-recruiter/${encodeURIComponent(email)}` : '/jobs';
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

    async getCandidateProfile(email, fallbackApp = {}) {
        try {
            if (email) {
                const data = await apiRequest(`/auth/student-profile/${encodeURIComponent(email)}`);
                if (data?.profile) {
                    const prof = data.profile;
                    const personal = prof.personalInfo || {};
                    const academic = prof.academicInfo || {};
                    const resume = prof.resume || {};

                    return {
                        id: prof._id || prof.id || fallbackApp.candidateId || fallbackApp.id || fallbackApp._id,
                        name: personal.name || fallbackApp.candidateName || 'Student Candidate',
                        email: personal.email || email || fallbackApp.studentEmail || fallbackApp.candidateEmail,
                        phone: personal.phone || fallbackApp.candidatePhone || '',
                        github: personal.github || '',
                        linkedin: personal.linkedin || '',
                        branch: academic.branch || personal.dept || fallbackApp.candidateBranch || 'CSE',
                        cgpa: academic.cgpa !== undefined && academic.cgpa !== '' ? academic.cgpa : (fallbackApp.candidateCgpa || 0),
                        backlogs: academic.backlogs !== undefined ? academic.backlogs : 0,
                        graduationYear: academic.graduationYear || '2027',
                        skills: Array.isArray(prof.skills) && prof.skills.length > 0 ? prof.skills : (fallbackApp.candidateSkills || ['General Aptitude', 'Communication']),
                        resumeName: resume.name || fallbackApp.candidateResume || `${(personal.name || fallbackApp.candidateName || 'Student').replace(/\s+/g, '_')}_Resume.pdf`,
                        projects: Array.isArray(prof.projects) ? prof.projects : [],
                        experience: Array.isArray(prof.experience) ? prof.experience : []
                    };
                }
            }
        } catch (err) {
            console.warn('Failed to fetch detailed student profile, using application data:', err.message);
        }

        // Return unified structure from fallback application data
        const candName = fallbackApp.candidateName || 'Student Candidate';
        const candEmail = email || fallbackApp.studentEmail || fallbackApp.candidateEmail || `${candName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`;
        return {
            id: fallbackApp.candidateId || fallbackApp.id || fallbackApp._id,
            name: candName,
            email: candEmail,
            phone: fallbackApp.candidatePhone || '+91 98765 43210',
            github: '',
            linkedin: '',
            branch: fallbackApp.candidateBranch || 'CSE',
            cgpa: fallbackApp.candidateCgpa || 8.0,
            backlogs: 0,
            graduationYear: '2027',
            skills: fallbackApp.candidateSkills && fallbackApp.candidateSkills.length > 0 ? fallbackApp.candidateSkills : ['Problem Solving', 'Data Structures', 'Communication'],
            resumeName: fallbackApp.candidateResume || `${candName.replace(/\s+/g, '_')}_Resume.pdf`,
            projects: [],
            experience: []
        };
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
        const email = typeof params === 'string' ? params : params?.recruiterEmail;
        const endpoint = email ? `/applications/by-recruiter/${encodeURIComponent(email)}` : '/applications';
        try {
            const data = await apiRequest(endpoint);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    },

    async updateApplicationStatus(appId, newStatus) {
        const targetId = appId?._id || appId?.id || appId;
        const res = await apiRequest(`/applications/${targetId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        window.dispatchEvent(new Event('recruiter_applications_updated'));
        window.dispatchEvent(new Event('student_applications_updated'));
        window.dispatchEvent(new Event('storage'));
        return res;
    },

    // ── Shortlisted ──────────────────────────────────────────────────────
    async getShortlisted(params = {}) {
        try {
            const apps = await this.getApplications(params);
            return apps.filter(a => ['Shortlisted', 'Interview', 'Offered'].includes(a.status));
        } catch (e) {
            return [];
        }
    },

    async getShortlists(params = {}) {
        const email = typeof params === 'string' ? params : params?.recruiterEmail;
        const endpoint = email ? `/shortlists/by-recruiter/${encodeURIComponent(email)}` : '/shortlists';
        try {
            const data = await apiRequest(endpoint);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    },

    // ── Interviews ───────────────────────────────────────────────────────
    async getInterviews(params = {}) {
        const email = typeof params === 'string' ? params : params?.recruiterEmail;
        const endpoint = email ? `/interviews/by-recruiter/${encodeURIComponent(email)}` : '/interviews';
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
    async getCompanyProfile(email = '') {
        try {
            if (email) {
                const data = await apiRequest(`/auth/recruiter-profile/${encodeURIComponent(email)}`);
                if (data?.profile) return data.profile;
            }
            return await apiRequest('/recruiter/profile');
        } catch (e) {
            return {
                companyName: 'Company Profile',
                recruiterName: 'Recruiter',
                email: email || 'recruiter@company.com',
                phone: '+91 98765 43210',
                website: '',
                description: '',
                hiringBranches: ['CSE', 'IT', 'AI/DS', 'ECE'],
                minCgpa: 7.0
            };
        }
    },

    async updateCompanyProfile(updates, email = '') {
        try {
            const payload = {
                email: email || updates.email,
                companyProfile: updates
            };
            const data = await apiRequest('/auth/recruiter-profile', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            window.dispatchEvent(new Event('recruiter_profile_updated'));
            return data?.data?.companyProfile || updates;
        } catch (e) {
            // fallback
        }
        window.dispatchEvent(new Event('recruiter_profile_updated'));
        return updates;
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
    async getDashboardStats(params = {}) {
        const email = typeof params === 'string' ? params : params?.recruiterEmail;
        const endpoint = email ? `/dashboard/stats/recruiter/${encodeURIComponent(email)}` : '/dashboard/stats';
        try {
            const data = await apiRequest(endpoint);
            return data;
        } catch (e) {
            try {
                const [jobs, apps, interviews] = await Promise.all([
                    this.getJobs(params),
                    this.getApplications(params),
                    this.getInterviews(params)
                ]);

                return {
                    activeJobs: jobs.filter(j => j.status !== 'Inactive' && j.status !== 'Closed').length,
                    totalApplicants: apps.length,
                    shortlisted: apps.filter(a => ['shortlisted', 'interview', 'offered'].includes((a.status || '').toLowerCase())).length,
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
