/**
 * Placement Platform Unified API Service (Student Facing)
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
        console.error(`Placement API Error [${endpoint}]:`, err.message);
        throw err;
    }
}

export const placementService = {
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

    // ── Applications ─────────────────────────────────────────────────────
    async getApplications(params = {}) {
        const email = typeof params === 'string' ? params : params?.studentEmail;
        const endpoint = email ? `/applications/by-student/${encodeURIComponent(email)}` : '/applications';
        try {
            const data = await apiRequest(endpoint);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    },

    async applyToJob(job, studentProfile, newResume) {
        const payload = {
            jobId: job?.id || job?._id,
            studentProfile,
            newResume
        };
        const res = await apiRequest('/applications', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        window.dispatchEvent(new Event('student_applications_updated'));
        window.dispatchEvent(new Event('recruiter_applications_updated'));
        return res;
    },

    async updateApplication(id, updates) {
        const res = await apiRequest(`/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        window.dispatchEvent(new Event('student_applications_updated'));
        return res;
    },

    async withdrawApplication(id) {
        const res = await apiRequest(`/applications/${id}`, {
            method: 'DELETE'
        });
        window.dispatchEvent(new Event('student_applications_updated'));
        window.dispatchEvent(new Event('recruiter_applications_updated'));
        return res;
    },

    // ── Shortlists ───────────────────────────────────────────────────────
    async getShortlists(params = {}) {
        const email = typeof params === 'string' ? params : params?.studentEmail;
        const endpoint = email ? `/shortlists/by-student/${encodeURIComponent(email)}` : '/shortlists';
        try {
            const data = await apiRequest(endpoint);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    },

    // ── Interviews ───────────────────────────────────────────────────────
    async getInterviews(params = {}) {
        const email = typeof params === 'string' ? params : params?.studentEmail;
        const endpoint = email ? `/interviews/by-student/${encodeURIComponent(email)}` : '/interviews';
        try {
            const data = await apiRequest(endpoint);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
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

    async markAllNotificationsRead() {
        const res = await apiRequest('/notifications/read-all', {
            method: 'PUT'
        }).catch(() => []);
        window.dispatchEvent(new Event('student_notifications_updated'));
        return res;
    },

    async deleteNotification(id) {
        const res = await apiRequest(`/notifications/${id}`, {
            method: 'DELETE'
        }).catch(() => []);
        window.dispatchEvent(new Event('student_notifications_updated'));
        return res;
    },

    async clearAllNotifications() {
        const res = await apiRequest('/notifications', {
            method: 'DELETE'
        }).catch(() => []);
        window.dispatchEvent(new Event('student_notifications_updated'));
        return res;
    },

    // ── Dashboard Aggregated Data ────────────────────────────────────────
    async getDashboardData(params = {}) {
        const email = typeof params === 'string' ? params : params?.studentEmail;
        const endpoint = email ? `/dashboard/stats/student/${encodeURIComponent(email)}` : '/dashboard/stats';
        try {
            const data = await apiRequest(endpoint);
            return data;
        } catch (e) {
            try {
                const [jobs, apps, interviews] = await Promise.all([
                    this.getJobs(),
                    this.getApplications(params),
                    this.getInterviews(params)
                ]);

                return {
                    stats: {
                        totalApplications: apps.length,
                        shortlisted: apps.filter(a => (a.status || '').toLowerCase() === 'shortlisted').length,
                        interviews: interviews.filter(i => (i.status || '').toLowerCase() === 'upcoming' || (i.status || '').toLowerCase() === 'scheduled').length
                    },
                    recentApplications: apps.slice(0, 4),
                    recommendedJobs: jobs.filter(j => j.status !== 'Inactive' && j.status !== 'Closed').slice(0, 4)
                };
            } catch (err) {
                return {
                    stats: { totalApplications: 0, shortlisted: 0, interviews: 0 },
                    recentApplications: [],
                    recommendedJobs: []
                };
            }
        }
    }
};
