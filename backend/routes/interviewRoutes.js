import express from 'express';
import { getInterviews, scheduleInterview, updateInterview, deleteInterview } from '../controllers/interviewController.js';

const router = express.Router();

router.get('/', getInterviews);
router.post('/', scheduleInterview);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

export default router;
