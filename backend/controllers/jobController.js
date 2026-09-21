import Job from "../models/job.js";

// Get all jobs (with optional query filters)
export const getJobs = async (req, res) => {
    try {
        const { search, type, recruiterEmail } = req.query;
        let query = {};

        if (recruiterEmail) {
            query.recruiterEmail = recruiterEmail;
        }

        if (type && type !== 'all' && type !== 'All') {
            query.type = { $regex: new RegExp(type, 'i') };
        }

        if (search) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { role: regex },
                { title: regex },
                { company: regex },
                { location: regex },
                { skills: regex }
            ];
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Failed to retrieve jobs', error: error.message });
    }
};

// Get jobs posted by a specific recruiter via route parameter
export const getJobsByRecruiter = async (req, res) => {
    try {
        const { email } = req.params;
        const jobs = await Job.find({ recruiterEmail: email }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching recruiter jobs:', error);
        res.status(500).json({ message: 'Failed to retrieve jobs for recruiter', error: error.message });
    }
};

// Get single job by ID
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job posting not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).json({ message: 'Failed to retrieve job details', error: error.message });
    }
};

// Create a new job posting
export const createJob = async (req, res) => {
    try {
        const jobData = {
            ...req.body,
            role: req.body.role || req.body.title || 'Software Engineer',
            postedDate: 'Just now'
        };
        const newJob = await Job.create(jobData);
        res.status(201).json(newJob);
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Failed to create job posting', error: error.message });
    }
};

// Update job posting by ID
export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(updatedJob);
    } catch (error) {
        console.error('Error updating job posting:', error);
        res.status(500).json({ message: 'Failed to update job posting', error: error.message });
    }
};

// Delete job posting by ID
export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Job.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json({ message: 'Job posting removed successfully', id });
    } catch (error) {
        console.error('Error deleting job posting:', error);
        res.status(500).json({ message: 'Failed to delete job posting', error: error.message });
    }
};
