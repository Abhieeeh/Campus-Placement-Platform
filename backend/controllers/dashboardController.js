import { INITIAL_JOBS, INITIAL_APPLICATIONS, INITIAL_INTERVIEWS } from '../data/mockData.js';

export const getDashboardStats = (req, res) => {
    try {
        const totalApplications = INITIAL_APPLICATIONS.length;
        const shortlisted = INITIAL_APPLICATIONS.filter(a => a.status.toLowerCase() === 'shortlisted').length;
        const upcomingInterviews = INITIAL_INTERVIEWS.filter(i => i.status === 'upcoming').length;

        const recentApplications = INITIAL_APPLICATIONS.slice(0, 4);
        const recommendedJobs = INITIAL_JOBS.slice(0, 3);

        res.status(200).json({
            stats: {
                totalApplications,
                shortlisted,
                interviews: upcomingInterviews
            },
            recentApplications,
            recommendedJobs,
            allJobs: INITIAL_JOBS,
            allApplications: INITIAL_APPLICATIONS
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to aggregate dashboard metrics', error: error.message });
    }
};
