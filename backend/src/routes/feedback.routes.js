import { Router } from "express";
import { requestFeedback } from "../controllers/feedback.controller.js";
import { authorizeRoles, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/request").post(authorizeRoles("employee"), requestFeedback);

export default router;
