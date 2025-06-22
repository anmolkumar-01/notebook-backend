import { Router } from "express";
import {
  Register,
  loginUser,
  logoutUser,
  getLoggedInUser,
  getAnyUser,
} from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT, isAdminLogin } from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  Register
);

router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getLoggedInUser);
router.get("/user/:userId", getAnyUser);



export default router;
