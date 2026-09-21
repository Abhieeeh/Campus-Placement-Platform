import express from 'express';
import { 
    getDashboardStats, 
    getDashboardStatsByRecruiter, 
    getDashboardStatsByStudent 
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/stats/recruiter/:email', getDashboardStatsByRecruiter);
router.get('/stats/student/:email', getDashboardStatsByStudent);

export default router;
