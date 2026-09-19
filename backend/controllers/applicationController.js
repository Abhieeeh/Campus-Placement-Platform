import { INITIAL_APPLICATIONS } from '../data/mockData.js';

let applications = [...INITIAL_APPLICATIONS];

export const getApplications = (req, res) => {
    try {
        const { status, search } = req.query;
        let filtered = [...applications];

        if (status && status !== 'all') {
            filtered = filtered.filter(a => a.status.toLowerCase() === status.toLowerCase());
        }

        if (search) {
            const q = search.toLowerCase().trim();
            filtered = filtered.filter(a =>
                a.role.toLowerCase().includes(q) ||
                a.company.toLowerCase().includes(q) ||
                a.location.toLowerCase().includes(q) ||
                a.status.toLowerCase().includes(q)
            );
        }

        res.status(200).json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
    }
};

export const applyToJob = (req, res) => {
    try {
        const { jobId, job, studentProfile, newResume } = req.body;
        
        const newApp = {
            id: `APP-${Date.now().toString().slice(-4)}`,
            jobId: jobId || job?.id,
            role: job?.role || 'Software Engineer',
            company: job?.company || 'Company',
            color: job?.color || 'linear-gradient(135deg, #2563eb, #7c3aed)',
            location: job?.location || 'India',
            type: job?.type || 'Full-time',
            salary: job?.salary || 'Best in Industry',
            appliedDate: 'Just now',
            appliedTimestamp: Date.now(),
            status: 'Applied',
            resumeName: newResume?.name || studentProfile?.resumeFileName || 'Abhishek_K_Resume.pdf',
            isSaved: false,
            stage: 1,
            timeline: [
                { step: 'Application Submitted', date: 'Just now', current: true },
                { step: 'Resume Screening', date: 'In Review', completed: false },
                { step: 'Online Assessment', date: 'Pending', completed: false },
                { step: 'Interview Rounds', date: 'Pending', completed: false },
                { step: 'Final Offer', date: 'Pending', completed: false }
            ]
        };

        applications = [newApp, ...applications.filter(a => a.jobId !== (jobId || job?.id))];
        res.status(201).json(newApp);
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit application', error: error.message });
    }
};

export const updateApplication = (req, res) => {
    try {
        const { id } = req.params;
        const index = applications.findIndex(a => a.id === id);
        if (index === -1) {
            return res.status(404).json({ message: 'Application not found' });
        }
        applications[index] = { ...applications[index], ...req.body };
        res.status(200).json(applications[index]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update application', error: error.message });
    }
};

export const deleteApplication = (req, res) => {
    try {
        const { id } = req.params;
        const exists = applications.some(a => a.id === id);
        if (!exists) {
            return res.status(404).json({ message: 'Application not found' });
        }
        applications = applications.filter(a => a.id !== id);
        res.status(200).json({ message: 'Application withdrawn successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to withdraw application', error: error.message });
    }
};
