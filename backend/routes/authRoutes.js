import express from 'express';
import { 
    loginUser, 
    registerUser, 
    saveStudentProfile, 
    saveRecruiterProfile 
} from '../controllers/authenticationController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/student-profile', saveStudentProfile);
router.post('/recruiter-profile', saveRecruiterProfile);

export default router;