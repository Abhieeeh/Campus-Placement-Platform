// In-memory data store (ready to be replaced with MongoDB Mongoose model)
let interviews = [];

export const getInterviews = (req, res) => {
    try {
        const { status, date } = req.query;
        let filtered = [...interviews];

        if (status && status !== 'all') {
            filtered = filtered.filter(i => (i.status || '').toLowerCase() === status.toLowerCase());
        }

        if (date) {
            filtered = filtered.filter(i => i.date === date);
        }

        res.status(200).json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch interviews', error: error.message });
    }
};

export const scheduleInterview = (req, res) => {
    try {
        const newInterview = {
            id: `INT-${Date.now().toString().slice(-4)}`,
            status: 'scheduled',
            ...req.body
        };
        interviews.unshift(newInterview);
        res.status(201).json(newInterview);
    } catch (error) {
        res.status(500).json({ message: 'Failed to schedule interview', error: error.message });
    }
};

export const updateInterview = (req, res) => {
    try {
        const { id } = req.params;
        const idx = interviews.findIndex(i => (i.id === id || i._id === id));
        if (idx === -1) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        interviews[idx] = { ...interviews[idx], ...req.body };
        res.status(200).json(interviews[idx]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update interview', error: error.message });
    }
};

export const deleteInterview = (req, res) => {
    try {
        const { id } = req.params;
        interviews = interviews.filter(i => (i.id !== id && i._id !== id));
        res.status(200).json({ message: 'Interview cancelled successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete interview', error: error.message });
    }
};
