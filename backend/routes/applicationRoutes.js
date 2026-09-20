import express from 'express';
import { getApplications, applyToJob, updateApplication, deleteApplication } from '../controllers/applicationController.js';

const router = express.Router();

router.get('/', getApplications);
router.post('/', applyToJob);
router.put('/:id', updateApplication);
router.patch('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
