import Shortlist from "../models/shortlist.js";
import Application from "../models/application.js";

// Get all shortlists (with query params)
export const getShortlists = async (req, res) => {
    try {
        const { recruiterEmail, studentEmail, jobId } = req.query;
        let query = {};
        if (recruiterEmail) query.recruiterEmail = recruiterEmail;
        if (studentEmail) query.studentEmail = studentEmail;
        if (jobId) query.jobId = jobId;

        const list = await Shortlist.find(query).sort({ createdAt: -1 });
        res.status(200).json(list);
    } catch (error) {
        console.error('Error fetching shortlists:', error);
        res.status(500).json({ message: 'Failed to fetch shortlisted candidates', error: error.message });
    }
};

// Get shortlisted records for a student (accepts email in body, query, or params)
export const getShortlistsByStudent = async (req, res) => {
    try {
        const email = req.body?.email || req.query?.email || req.params?.email;
        if (!email) {
            return res.status(400).json({ message: 'Student email is required' });
        }
        const list = await Shortlist.find({ studentEmail: email }).sort({ createdAt: -1 });
        res.status(200).json(list);
    } catch (error) {
        console.error('Error fetching student shortlists:', error);
        res.status(500).json({ message: 'Failed to fetch student shortlist data', error: error.message });
    }
};

// Get shortlisted records for a recruiter (accepts email in body, query, or params)
export const getShortlistsByRecruiter = async (req, res) => {
    try {
        const email = req.body?.email || req.query?.email || req.params?.email;
        if (!email) {
            return res.status(400).json({ message: 'Recruiter email is required' });
        }
        const list = await Shortlist.find({ recruiterEmail: email }).sort({ createdAt: -1 });
        res.status(200).json(list);
    } catch (error) {
        console.error('Error fetching recruiter shortlists:', error);
        res.status(500).json({ message: 'Failed to fetch recruiter shortlist data', error: error.message });
    }
};

// Add or upsert a student to the shortlist
export const addToShortlist = async (req, res) => {
    try {
        const {
            applicationId,
            jobId,
            recruiterEmail,
            studentEmail,
            candidateName,
            candidateBranch,
            candidateCgpa,
            candidateSkills,
            candidateResume,
            candidatePhone,
            jobTitle,
            company,
            notes
        } = req.body;

        if (!recruiterEmail || !studentEmail) {
            return res.status(400).json({ message: 'recruiterEmail and studentEmail are required' });
        }

        const shortlistEntry = await Shortlist.findOneAndUpdate(
            { 
                ...(applicationId ? { applicationId } : { jobId, studentEmail }) 
            },
            {
                applicationId,
                jobId,
                recruiterEmail,
                studentEmail,
                candidateName: candidateName || 'Candidate',
                candidateEmail: studentEmail,
                candidateBranch: candidateBranch || 'CSE',
                candidateCgpa: candidateCgpa || 0,
                candidateSkills: candidateSkills || [],
                candidateResume: candidateResume || 'Resume.pdf',
                candidatePhone: candidatePhone || '',
                jobTitle: jobTitle || 'Software Engineer',
                company: company || 'Company',
                status: 'Shortlisted',
                shortlistedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                notes: notes || ''
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Also update application status if applicationId provided
        if (applicationId) {
            try {
                await Application.findByIdAndUpdate(applicationId, {
                    status: 'Shortlisted',
                    stage: 2
                });
            } catch (err) {
                // non-blocking
            }
        }

        res.status(201).json(shortlistEntry);
    } catch (error) {
        console.error('Error shortlisting student:', error);
        res.status(500).json({ message: 'Failed to shortlist student', error: error.message });
    }
};

// Remove student from shortlist
export const removeFromShortlist = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Shortlist.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Shortlist entry not found' });
        }
        res.status(200).json({ message: 'Removed from shortlist successfully', id });
    } catch (error) {
        console.error('Error removing from shortlist:', error);
        res.status(500).json({ message: 'Failed to remove from shortlist', error: error.message });
    }
};
