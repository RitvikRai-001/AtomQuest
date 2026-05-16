import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
