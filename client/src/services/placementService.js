/**
 * Placement Platform Unified API Service (Student Facing)
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
        console.error(`API Error [${endpoint}]:`, err.message);
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
        const query = new URLSearchParams(params).toString();
        const endpoint = `/applications${query ? `?${query}` : ''}`;
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
            job,
            studentProfile,
            newResume
        };
        const res = await apiRequest('/applications', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        window.dispatchEvent(new Event('student_applications_updated'));
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
        return res;
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
    async getDashboardData() {
        try {
            const data = await apiRequest('/dashboard/stats');
            return data;
        } catch (e) {
            // Compute safely from endpoints if single aggregation endpoint not yet wired
            try {
                const [jobs, apps, interviews] = await Promise.all([
                    this.getJobs(),
                    this.getApplications(),
                    this.getInterviews()
                ]);

                return {
                    stats: {
                        totalApplications: apps.length,
                        shortlisted: apps.filter(a => (a.status || '').toLowerCase() === 'shortlisted').length,
                        interviews: interviews.filter(i => (i.status || '').toLowerCase() === 'upcoming' || (i.status || '').toLowerCase() === 'scheduled').length
                    },
                    recentApplications: apps.slice(0, 4),
                    recommendedJobs: jobs.slice(0, 4)
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
