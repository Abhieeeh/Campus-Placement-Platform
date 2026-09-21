import express from 'express';
import { 
    loginUser, 
    registerUser, 
    saveStudentProfile, 
    getStudentProfile,
    saveRecruiterProfile,
    getRecruiterProfile
} from '../controllers/authenticationController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/student-profile', saveStudentProfile);
router.get('/student-profile/:email', getStudentProfile);
router.post('/recruiter-profile', saveRecruiterProfile);
router.get('/recruiter-profile/:email', getRecruiterProfile);

export default router;