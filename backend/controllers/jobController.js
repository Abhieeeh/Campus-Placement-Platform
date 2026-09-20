// In-memory data store (ready to be replaced with MongoDB Mongoose model)
let jobs = [];

export const getJobs = (req, res) => {
    try {
        const { search, type } = req.query;
        let filtered = [...jobs];

        if (search) {
            const q = search.toLowerCase().trim();
            filtered = filtered.filter(j =>
                (j.role || j.title || '').toLowerCase().includes(q) ||
                (j.company || '').toLowerCase().includes(q) ||
                (j.location || '').toLowerCase().includes(q) ||
                (Array.isArray(j.skills) && j.skills.some(s => (s || '').toLowerCase().includes(q)))
            );
        }

        if (type && type !== 'all') {
            filtered = filtered.filter(j => (j.type || '').toLowerCase() === type.toLowerCase());
        }

        res.status(200).json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve jobs', error: error.message });
    }
};

export const getJobById = (req, res) => {
    try {
        const { id } = req.params;
        const job = jobs.find(j => (j.id === id || j._id === id));
        if (!job) {
            return res.status(404).json({ message: 'Job posting not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve job details', error: error.message });
    }
};

export const createJob = (req, res) => {
    try {
        const newJob = {
            id: `job-${Date.now()}`,
            postedDate: 'Just now',
            ...req.body
        };
        jobs.unshift(newJob);
        res.status(201).json(newJob);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create job posting', error: error.message });
    }
};

export const updateJob = (req, res) => {
    try {
        const { id } = req.params;
        const idx = jobs.findIndex(j => (j.id === id || j._id === id));
        if (idx === -1) {
            return res.status(404).json({ message: 'Job not found' });
        }
        jobs[idx] = { ...jobs[idx], ...req.body };
        res.status(200).json(jobs[idx]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update job posting', error: error.message });
    }
};

export const deleteJob = (req, res) => {
    try {
        const { id } = req.params;
        jobs = jobs.filter(j => (j.id !== id && j._id !== id));
        res.status(200).json({ message: 'Job posting removed successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete job posting', error: error.message });
    }
};
