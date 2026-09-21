import express from 'express';
import { 
    getInterviews, 
    getInterviewsByRecruiter, 
    getInterviewsByStudent, 
    getInterviewById, 
    scheduleInterview, 
    updateInterview, 
    deleteInterview 
} from '../controllers/interviewController.js';

const router = express.Router();

router.get('/', getInterviews);
router.get('/by-recruiter/:email', getInterviewsByRecruiter);
router.get('/by-student/:email', getInterviewsByStudent);
router.get('/:id', getInterviewById);
router.post('/', scheduleInterview);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

export default router;
