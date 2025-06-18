import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.js';


import{
    createNote
} from '../controllers/notesController.js';

const router = Router();

router.post('/create', verifyJWT, createNote);

export default router;