import { Router } from "express";
import {
  getEmployeeCheckins,
  getGoalCheckins,
  getGoalSheetCheckins,
  upsertCheckinComment,
} from "../controllers/checkin.controller.js";

const router = Router();

router.route("/goals/:goalId").get(getGoalCheckins).post(upsertCheckinComment);

router.route("/employees/:employeeId").get(getEmployeeCheckins);

router.route("/goal-sheets/:goalSheetId").get(getGoalSheetCheckins);

export default router;
