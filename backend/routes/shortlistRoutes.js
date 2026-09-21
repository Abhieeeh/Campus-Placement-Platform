import express from 'express';
import {
    getShortlists,
    getShortlistsByStudent,
    getShortlistsByRecruiter,
    addToShortlist,
    removeFromShortlist
} from '../controllers/shortlistController.js';

const router = express.Router();

router.get('/', getShortlists);
router.get('/by-student/:email', getShortlistsByStudent);
router.get('/by-recruiter/:email', getShortlistsByRecruiter);
router.post('/', addToShortlist);
router.delete('/:id', removeFromShortlist);

export default router;
