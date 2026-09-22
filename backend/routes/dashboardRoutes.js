import express from 'express';
import { 
    getDashboardStats, 
    getDashboardStatsByRecruiter, 
    getDashboardStatsByStudent 
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/stats/recruiter/:email', getDashboardStatsByRecruiter);
router.post('/stats/recruiter', getDashboardStatsByRecruiter);
router.get('/stats/student/:email', getDashboardStatsByStudent);
router.post('/stats/student', getDashboardStatsByStudent);

export default router;
