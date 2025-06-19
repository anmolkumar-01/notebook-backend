import {Router} from 'express';
import { isAdminLogin, isAdminOrSubadminLogin, verifyJWT } from '../middlewares/auth.js';


import{
    createNote,
    deleteNote,
    updateNote
} from '../controllers/notesController.js';

const router = Router();

router.post('/create', verifyJWT, createNote);
router.delete('/delete/:noteId',verifyJWT , isAdminLogin, deleteNote);
router.post('/update/:noteId',verifyJWT,isAdminOrSubadminLogin, updateNote);

export default router;