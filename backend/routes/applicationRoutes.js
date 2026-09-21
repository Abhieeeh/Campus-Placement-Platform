import express from 'express';
import { 
    getApplications, 
    getApplicationsByRecruiter, 
    getApplicationsByStudent, 
    getApplicationsByJob, 
    getApplicationById, 
    applyToJob, 
    updateApplication, 
    deleteApplication 
} from '../controllers/applicationController.js';

const router = express.Router();

router.get('/', getApplications);
router.get('/by-recruiter/:email', getApplicationsByRecruiter);
router.get('/by-student/:email', getApplicationsByStudent);
router.get('/by-job/:jobId', getApplicationsByJob);
router.get('/:id', getApplicationById);
router.post('/', applyToJob);
router.put('/:id', updateApplication);
router.patch('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
