import Interview from "../models/interview.js";
import Application from "../models/application.js";

// Get interviews by query parameters (fallback)
export const getInterviews = async (req, res) => {
    try {
        const { status, date, recruiterEmail, studentEmail } = req.query;
        let query = {};

        if (recruiterEmail) query.recruiterEmail = recruiterEmail;
        if (studentEmail) query.studentEmail = studentEmail;

        if (status && status !== 'all' && status !== 'All') {
            query.status = { $regex: new RegExp(`^${status}$`, 'i') };
        }

        if (date) {
            query.date = date;
        }

        const interviews = await Interview.find(query).sort({ createdAt: -1 });
        res.status(200).json(interviews);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Failed to fetch interviews', error: error.message });
    }
};

// Get interviews for a recruiter by route parameter
export const getInterviewsByRecruiter = async (req, res) => {
    try {
        const { email } = req.params;
        const interviews = await Interview.find({ recruiterEmail: email }).sort({ createdAt: -1 });
        res.status(200).json(interviews);
    } catch (error) {
        console.error('Error fetching recruiter interviews:', error);
        res.status(500).json({ message: 'Failed to fetch recruiter interviews', error: error.message });
    }
};

// Get interviews for a student by route parameter
export const getInterviewsByStudent = async (req, res) => {
    try {
        const { email } = req.params;
        const interviews = await Interview.find({ studentEmail: email }).sort({ createdAt: -1 });
        res.status(200).json(interviews);
    } catch (error) {
        console.error('Error fetching student interviews:', error);
        res.status(500).json({ message: 'Failed to fetch student interviews', error: error.message });
    }
};

// Get single interview by ID
export const getInterviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.status(200).json(interview);
    } catch (error) {
        console.error('Error fetching interview:', error);
        res.status(500).json({ message: 'Failed to fetch interview', error: error.message });
    }
};

// Schedule new interview
export const scheduleInterview = async (req, res) => {
    try {
        let appDoc = null;
        if (req.body.applicationId) {
            try {
                appDoc = await Application.findById(req.body.applicationId);
            } catch (e) {
                // non-blocking
            }
        }

        const studentEmail = req.body.studentEmail || appDoc?.studentEmail || appDoc?.candidateEmail || req.body.candidateEmail;
        const candidateEmail = req.body.candidateEmail || studentEmail;
        const candidateName = req.body.candidateName || appDoc?.candidateName || 'Candidate';
        const candidateBranch = req.body.candidateBranch || appDoc?.candidateBranch || 'CSE';
        const candidateCgpa = req.body.candidateCgpa !== undefined ? req.body.candidateCgpa : (appDoc?.candidateCgpa || 0);
        const jobTitle = req.body.jobTitle || appDoc?.jobTitle || appDoc?.role || 'Software Engineer';
        const company = req.body.company || appDoc?.company || 'Company';
        const jobId = req.body.jobId || appDoc?.jobId;
        const applicationId = req.body.applicationId || appDoc?._id;

        const interviewData = {
            ...req.body,
            studentEmail,
            candidateEmail,
            candidateName,
            candidateBranch,
            candidateCgpa,
            jobTitle,
            company,
            jobId,
            applicationId,
            status: req.body.status || 'scheduled'
        };

        const newInterview = await Interview.create(interviewData);

        // Update application status to Interview if applicationId provided
        if (applicationId) {
            try {
                await Application.findByIdAndUpdate(applicationId, {
                    status: 'Interview',
                    stage: 3
                });
            } catch (err) {
                // non-blocking
            }
        }

        res.status(201).json(newInterview);
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ message: 'Failed to schedule interview', error: error.message });
    }
};

// Update interview by ID
export const updateInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Interview.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating interview:', error);
        res.status(500).json({ message: 'Failed to update interview', error: error.message });
    }
};

// Delete / cancel interview by ID
export const deleteInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Interview.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.status(200).json({ message: 'Interview cancelled successfully', id });
    } catch (error) {
        console.error('Error deleting interview:', error);
        res.status(500).json({ message: 'Failed to delete interview', error: error.message });
    }
};
