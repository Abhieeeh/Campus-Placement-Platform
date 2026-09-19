import { INITIAL_INTERVIEWS } from '../data/mockData.js';

let interviews = [...INITIAL_INTERVIEWS];

export const getInterviews = (req, res) => {
    try {
        const { status, date } = req.query;
        let filtered = [...interviews];

        if (status && status !== 'all') {
            filtered = filtered.filter(i => i.status.toLowerCase() === status.toLowerCase());
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
            status: 'upcoming',
            ...req.body
        };
        interviews.unshift(newInterview);
        res.status(201).json(newInterview);
    } catch (error) {
        res.status(500).json({ message: 'Failed to schedule interview', error: error.message });
    }
};
