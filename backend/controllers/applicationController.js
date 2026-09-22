import Application from "../models/application.js";
import Job from "../models/job.js";
import Shortlist from "../models/shortlist.js";
import user from "../models/user.js";
import { createAndEmitNotification } from "./notificationController.js";

// Get applications by query parameters (fallback)
export const getApplications = async (req, res) => {
    try {
        const { status, search, jobId, recruiterEmail, studentEmail } = req.query;
        let query = {};

        if (recruiterEmail) query.recruiterEmail = recruiterEmail;
        if (studentEmail) query.studentEmail = studentEmail;
        if (jobId) query.jobId = jobId;

        if (status && status !== 'all' && status !== 'All') {
            query.status = { $regex: new RegExp(`^${status}$`, 'i') };
        }

        if (search) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { role: regex },
                { jobTitle: regex },
                { company: regex },
                { candidateName: regex },
                { candidateBranch: regex },
                { status: regex }
            ];
        }

        const apps = await Application.find(query).sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (error) {
        console.error('Error getting applications:', error);
        res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
    }
};

// Get applications for a specific recruiter (accepts email in body, query, or params)
export const getApplicationsByRecruiter = async (req, res) => {
    try {
        const email = req.body?.email || req.query?.email || req.params?.email;
        if (!email) {
            return res.status(400).json({ message: 'Recruiter email is required' });
        }
        const apps = await Application.find({ recruiterEmail: email }).sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (error) {
        console.error('Error fetching recruiter applications:', error);
        res.status(500).json({ message: 'Failed to fetch recruiter applications', error: error.message });
    }
};

// Get applications for a specific student (accepts email in body, query, or params)
export const getApplicationsByStudent = async (req, res) => {
    try {
        const email = req.body?.email || req.query?.email || req.params?.email;
        if (!email) {
            return res.status(400).json({ message: 'Student email is required' });
        }
        const apps = await Application.find({ studentEmail: email }).sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (error) {
        console.error('Error fetching student applications:', error);
        res.status(500).json({ message: 'Failed to fetch student applications', error: error.message });
    }
};

// Get applications for a specific job by route parameter
export const getApplicationsByJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const apps = await Application.find({ jobId }).sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (error) {
        console.error('Error fetching job applications:', error);
        res.status(500).json({ message: 'Failed to fetch applications for job', error: error.message });
    }
};

// Get single application by ID
export const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const app = await Application.findById(id);
        if (!app) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.status(200).json(app);
    } catch (error) {
        console.error('Error fetching application by id:', error);
        res.status(500).json({ message: 'Failed to fetch application', error: error.message });
    }
};

// Apply to a job (Blocks closed jobs, uses DB job data, candidateId is student's user ObjectId)
export const applyToJob = async (req, res) => {
    try {
        const { jobId, studentProfile, newResume } = req.body;
        const actualJobId = jobId || req.body.job?.id || req.body.job?._id;

        if (!actualJobId) {
            return res.status(400).json({ message: 'Job ID is required' });
        }

        const studentEmail = studentProfile?.email || studentProfile?.personalInfo?.email;
        if (!studentEmail) {
            return res.status(400).json({ message: 'Student email is required' });
        }

        // 1. Fetch and validate job from DB
        const jobDoc = await Job.findById(actualJobId);
        if (!jobDoc) {
            return res.status(404).json({ message: 'Job posting not found' });
        }

        const jobStatus = (jobDoc.status || '').toLowerCase();
        if (jobStatus === 'closed') {
            return res.status(400).json({ message: 'This job posting is closed and is no longer accepting applications.' });
        }
        if (jobStatus === 'inactive' || jobStatus === 'draft') {
            return res.status(400).json({ message: 'This job posting is currently not active.' });
        }

        // 2. Fetch student user ObjectId from decoded token or users collection
        const studentUserDoc = !req.user?.userId ? await user.findOne({ email: studentEmail }) : null;
        const candidateUserId = req.user?.userId || (studentUserDoc ? studentUserDoc._id.toString() : (studentProfile?.userId || studentProfile?._id));

        // 3. Extract candidate information
        const candidateName = studentProfile?.name || 
            studentProfile?.personalInfo?.name || 
            studentEmail.split('@')[0];

        const candidateBranch = studentProfile?.branch || 
            studentProfile?.dept || 
            studentProfile?.academicInfo?.branch || 
            studentProfile?.personalInfo?.dept || 
            'CSE';

        const candidateCgpa = parseFloat(studentProfile?.cgpa || studentProfile?.academicInfo?.cgpa) || 0;
        const candidateSkills = Array.isArray(studentProfile?.skills) ? studentProfile.skills : [];
        const candidateResume = newResume?.name || studentProfile?.resume?.name || 'Resume.pdf';
        const candidatePhone = studentProfile?.phone || studentProfile?.personalInfo?.phone || '';

        // 4. Construct application document
        const appData = {
            jobId: actualJobId,
            recruiterEmail: jobDoc.recruiterEmail || 'recruiter@company.com',
            studentEmail,
            role: jobDoc.role || jobDoc.title || 'Software Engineer',
            jobTitle: jobDoc.role || jobDoc.title || 'Software Engineer',
            company: jobDoc.company || 'Company',
            color: jobDoc.color || 'linear-gradient(135deg, #0d9488, #059669)',
            location: jobDoc.location || 'India',
            type: jobDoc.type || 'Full-time',
            salary: jobDoc.salary || 'Competitive',
            appliedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            appliedTimestamp: Date.now(),
            status: 'New',
            candidateId: candidateUserId,
            candidateName,
            candidateEmail: studentEmail,
            candidateBranch,
            candidateCgpa,
            candidateSkills,
            candidateResume,
            candidatePhone,
            isSaved: false,
            stage: 1
        };

        // 5. Save or update application
        const application = await Application.findOneAndUpdate(
            { jobId: actualJobId, studentEmail },
            appData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 6. Notify the recruiter that a new application arrived
        try {
            const recruiterUserDoc = await user.findOne({ email: jobDoc.recruiterEmail });
            if (recruiterUserDoc) {
                await createAndEmitNotification({
                    senderId: candidateUserId,
                    receiverId: recruiterUserDoc._id.toString(),
                    senderRole: 'student',
                    receiverRole: 'recruiter',
                    message: `${candidateName} has applied for "${jobDoc.role || jobDoc.title}" at ${jobDoc.company}.`,
                    type: 'application'
                });
            }
        } catch (notifErr) {
            console.warn('[Notification] Could not send application notification:', notifErr.message);
        }

        res.status(201).json(application);
    } catch (error) {
        console.error('Error applying to job:', error);
        res.status(500).json({ message: 'Failed to submit application', error: error.message });
    }
};

// Status -> stage mapping helper
function statusToStage(status) {
    const s = (status || '').toLowerCase();
    if (s === 'shortlisted') return 2;
    if (s === 'assessment') return 3;
    if (s === 'interview') return 4;
    if (s === 'offered') return 5;
    return 1; // New / Applied / Rejected
}

// Update application by ID
export const updateApplication = async (req, res) => {
    try {
        const { id } = req.params;

        // Auto-set stage when status changes
        const updateData = { ...req.body };
        if (updateData.status && !updateData.stage) {
            updateData.stage = statusToStage(updateData.status);
        }

        const updated = await Application.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Sync with Shortlist collection based on new status
        if (req.body.status) {
            const statusLower = req.body.status.toLowerCase();

            if (statusLower === 'shortlisted' || statusLower === 'interview') {
                // Upsert shortlist record and update its status
                const shortlistStatus = statusLower === 'interview' ? 'Interview' : 'Shortlisted';
                await Shortlist.findOneAndUpdate(
                    { 
                        $or: [
                            { applicationId: updated._id },
                            { jobId: updated.jobId, studentEmail: updated.studentEmail }
                        ]
                    },
                    {
                        applicationId: updated._id,
                        jobId: updated.jobId,
                        recruiterEmail: updated.recruiterEmail,
                        studentEmail: updated.studentEmail,
                        candidateName: updated.candidateName,
                        candidateEmail: updated.candidateEmail || updated.studentEmail,
                        candidateBranch: updated.candidateBranch,
                        candidateCgpa: updated.candidateCgpa,
                        candidateSkills: updated.candidateSkills,
                        candidateResume: updated.candidateResume,
                        candidatePhone: updated.candidatePhone,
                        jobTitle: updated.jobTitle || updated.role,
                        company: updated.company,
                        status: shortlistStatus,
                        shortlistedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            } else if (statusLower === 'offered' || statusLower === 'rejected') {
                // Remove from shortlist pool when offered or rejected
                await Shortlist.deleteMany({
                    $or: [
                        { applicationId: updated._id },
                        { jobId: updated.jobId, studentEmail: updated.studentEmail }
                    ]
                });
            }

            // Notify the student when their application status changes
            const notifyStatuses = ['shortlisted', 'interview', 'offered', 'rejected'];
            if (notifyStatuses.includes(statusLower)) {
                try {
                    const studentUserDoc = await user.findOne({ email: updated.studentEmail });
                    const recruiterUserDoc = updated.recruiterEmail
                        ? await user.findOne({ email: updated.recruiterEmail })
                        : null;

                    if (studentUserDoc) {
                        const statusMessages = {
                            shortlisted: `Congratulations! You have been shortlisted for "${updated.jobTitle || updated.role}" at ${updated.company}.`,
                            interview: `You have been selected for an interview for "${updated.jobTitle || updated.role}" at ${updated.company}. Check your interviews tab for details.`,
                            offered: `🎉 You have received a job offer for "${updated.jobTitle || updated.role}" at ${updated.company}!`,
                            rejected: `Your application for "${updated.jobTitle || updated.role}" at ${updated.company} was not selected this time.`
                        };
                        await createAndEmitNotification({
                            senderId: recruiterUserDoc ? recruiterUserDoc._id.toString() : null,
                            receiverId: studentUserDoc._id.toString(),
                            senderRole: 'recruiter',
                            receiverRole: 'student',
                            message: statusMessages[statusLower],
                            type: statusLower === 'interview' ? 'interview' : statusLower === 'offered' ? 'offer' : 'shortlist'
                        });
                    }
                } catch (notifErr) {
                    console.warn('[Notification] Could not send status-change notification:', notifErr.message);
                }
            }
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ message: 'Failed to update application', error: error.message });
    }
};

// Delete / withdraw application by ID
export const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Application.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Application not found' });
        }
        await Shortlist.deleteMany({ applicationId: id });
        res.status(200).json({ message: 'Application withdrawn successfully', id });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ message: 'Failed to withdraw application', error: error.message });
    }
};
