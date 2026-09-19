import { INITIAL_JOBS } from '../data/mockData.js';

// In-memory data store (can be replaced with MongoDB/PostgreSQL model)
let jobs = [...INITIAL_JOBS];

export const getJobs = (req, res) => {
    try {
        const { search, type, eligibleOnly } = req.query;
        let filtered = [...jobs];

        if (search) {
            const q = search.toLowerCase().trim();
            filtered = filtered.filter(j =>
                j.role.toLowerCase().includes(q) ||
                j.company.toLowerCase().includes(q) ||
                j.location.toLowerCase().includes(q) ||
                j.skills.some(s => s.toLowerCase().includes(q))
            );
        }

        if (type && type !== 'all') {
            filtered = filtered.filter(j => j.type.toLowerCase() === type.toLowerCase());
        }

        res.status(200).json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve jobs', error: error.message });
    }
};

export const getJobById = (req, res) => {
    try {
        const { id } = req.params;
        const job = jobs.find(j => j.id === id);
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
