export const getDashboardStats = (req, res) => {
    try {
        res.status(200).json({
            stats: {
                totalApplications: 0,
                shortlisted: 0,
                interviews: 0
            },
            recentApplications: [],
            recommendedJobs: [],
            allJobs: [],
            allApplications: []
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to aggregate dashboard metrics', error: error.message });
    }
};
