import {Router} from 'express';
import { isAdminLogin, isAdminOrSubadminLogin, verifyJWT } from '../middlewares/auth.js';


import{
    createNote,
    deleteNote,
    updateNote,
    assignUserToNote,
    updateAssignedUserRole,
    removeUserFromNote
} from '../controllers/notesController.js';

const router = Router();

router.post('/create', verifyJWT, createNote);
router.delete('/delete/:noteId',verifyJWT, deleteNote);
router.post('/update/:noteId',verifyJWT, updateNote);
router.post('/assign-user/:noteId', verifyJWT, assignUserToNote);
router.post('/update-user-role/:noteId', verifyJWT, updateAssignedUserRole);
router.delete('/remove-user/:noteId', verifyJWT, removeUserFromNote);

export default router;