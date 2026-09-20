// In-memory data store (ready to be replaced with MongoDB Mongoose model)
let applications = [];

export const getApplications = (req, res) => {
    try {
        const { status, search, jobId } = req.query;
        let filtered = [...applications];

        if (jobId) {
            filtered = filtered.filter(a => a.jobId === jobId);
        }

        if (status && status !== 'all') {
            filtered = filtered.filter(a => (a.status || '').toLowerCase() === status.toLowerCase());
        }

        if (search) {
            const q = search.toLowerCase().trim();
            filtered = filtered.filter(a =>
                (a.role || a.jobTitle || '').toLowerCase().includes(q) ||
                (a.company || '').toLowerCase().includes(q) ||
                (a.candidateName || '').toLowerCase().includes(q) ||
                (a.candidateBranch || '').toLowerCase().includes(q) ||
                (a.status || '').toLowerCase().includes(q)
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
            jobId: jobId || job?.id || job?._id,
            role: job?.role || job?.title || 'Software Engineer',
            jobTitle: job?.role || job?.title || 'Software Engineer',
            company: job?.company || 'Company',
            color: job?.color || 'linear-gradient(135deg, #0d9488, #059669)',
            location: job?.location || 'India',
            type: job?.type || 'Full-time',
            salary: job?.salary || 'Best in Industry',
            appliedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            appliedTimestamp: Date.now(),
            status: 'New',
            candidateId: studentProfile?.id || 'STU-001',
            candidateName: studentProfile?.name || 'Student Candidate',
            candidateBranch: studentProfile?.branch || studentProfile?.dept || 'CSE',
            candidateCgpa: parseFloat(studentProfile?.cgpa) || 8.0,
            candidateSkills: studentProfile?.skills || ['Problem Solving', 'Data Structures'],
            candidateResume: newResume?.name || studentProfile?.resumeFileName || 'Resume.pdf',
            isSaved: false,
            stage: 1
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
        const index = applications.findIndex(a => (a.id === id || a._id === id));
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
        const exists = applications.some(a => (a.id === id || a._id === id));
        if (!exists) {
            return res.status(404).json({ message: 'Application not found' });
        }
        applications = applications.filter(a => (a.id !== id && a._id !== id));
        res.status(200).json({ message: 'Application withdrawn successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to withdraw application', error: error.message });
    }
};
