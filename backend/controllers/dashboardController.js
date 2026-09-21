import Job from "../models/job.js";
import Application from "../models/application.js";
import Interview from "../models/interview.js";

// Helper: Recruiter stats aggregator
async function fetchRecruiterStats(recruiterEmail, res) {
    const [jobs, apps, interviews] = await Promise.all([
        Job.find({ recruiterEmail }).sort({ createdAt: -1 }),
        Application.find({ recruiterEmail }).sort({ createdAt: -1 }),
        Interview.find({ recruiterEmail }).sort({ createdAt: -1 })
    ]);

    const activeJobs = jobs.filter(j => (j.status || '').toLowerCase() !== 'inactive' && (j.status || '').toLowerCase() !== 'closed').length;
    const totalApplicants = apps.length;
    const shortlisted = apps.filter(a => ['shortlisted', 'interview', 'offered'].includes((a.status || '').toLowerCase())).length;
    const upcomingInterviews = interviews.filter(i => (i.status || '').toLowerCase() === 'scheduled').length;
    const newApplications = apps.filter(a => (a.status || '').toLowerCase() === 'new').length;
    const offered = apps.filter(a => (a.status || '').toLowerCase() === 'offered').length;

    return res.status(200).json({
        activeJobs,
        totalApplicants,
        shortlisted,
        upcomingInterviews,
        newApplications,
        offered,
        recentApplications: apps.slice(0, 5),
        allJobs: jobs,
        allApplications: apps
    });
}

// Helper: Student stats aggregator
async function fetchStudentStats(studentEmail, res) {
    const appQuery = studentEmail ? { studentEmail } : {};
    const intQuery = studentEmail ? { studentEmail } : {};

    const [jobs, apps, interviews] = await Promise.all([
        Job.find({ status: { $nin: ['Inactive', 'Draft'] } }).sort({ createdAt: -1 }),
        Application.find(appQuery).sort({ createdAt: -1 }),
        Interview.find(intQuery).sort({ createdAt: -1 })
    ]);

    return res.status(200).json({
        stats: {
            totalApplications: apps.length,
            shortlisted: apps.filter(a => (a.status || '').toLowerCase() === 'shortlisted').length,
            interviews: interviews.filter(i => (i.status || '').toLowerCase() === 'scheduled').length
        },
        recentApplications: apps.slice(0, 5),
        recommendedJobs: jobs.filter(j => (j.status || '').toLowerCase() !== 'closed').slice(0, 5),
        allJobs: jobs,
        allApplications: apps
    });
}

// Query-param fallback
export const getDashboardStats = async (req, res) => {
    try {
        const { recruiterEmail, studentEmail } = req.query;

        if (recruiterEmail) {
            return await fetchRecruiterStats(recruiterEmail, res);
        }

        return await fetchStudentStats(studentEmail, res);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Failed to aggregate dashboard metrics', error: error.message });
    }
};

// Route-param: /stats/recruiter/:email
export const getDashboardStatsByRecruiter = async (req, res) => {
    try {
        const { email } = req.params;
        return await fetchRecruiterStats(email, res);
    } catch (error) {
        console.error('Error fetching recruiter dashboard stats:', error);
        res.status(500).json({ message: 'Failed to aggregate recruiter dashboard metrics', error: error.message });
    }
};

// Route-param: /stats/student/:email
export const getDashboardStatsByStudent = async (req, res) => {
    try {
        const { email } = req.params;
        return await fetchStudentStats(email, res);
    } catch (error) {
        console.error('Error fetching student dashboard stats:', error);
        res.status(500).json({ message: 'Failed to aggregate student dashboard metrics', error: error.message });
    }
};
