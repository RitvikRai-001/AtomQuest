import { Router } from "express";
import {
  getEmployeeCheckins,
  getGoalCheckins,
  getGoalSheetCheckins,
  upsertCheckinComment,
} from "../controllers/checkin.controller.js";
import { authorizeRoles, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/goals/:goalId")
  .get(getGoalCheckins)
  .post(authorizeRoles("manager"), upsertCheckinComment);

router.route("/employees/:employeeId").get(getEmployeeCheckins);

router.route("/goal-sheets/:goalSheetId").get(getGoalSheetCheckins);

export default router;
