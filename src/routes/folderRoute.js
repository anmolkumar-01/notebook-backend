import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";

import{
    createFolder,
    updateFolder,
    deleteFolder    
} from "../controllers/folderController.js";

const router = Router();

router.post("/create", verifyJWT, createFolder);
router.post("/update/:folderId", verifyJWT, updateFolder);  
router.delete("/delete/:folderId", verifyJWT, deleteFolder);

export default router;