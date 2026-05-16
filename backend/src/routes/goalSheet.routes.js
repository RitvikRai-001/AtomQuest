import { Router } from "express";
import {
  addGoal,
  approveGoalSheet,
  createGoalSheet,
  deleteGoal,
  getGoalSheet,
  getManagerApprovalQueue,
  returnGoalSheet,
  submitGoalSheet,
  updateGoal,
} from "../controllers/goalSheet.controller.js";

const router = Router();

router.route("/").post(createGoalSheet);

router.route("/manager/:managerId/approval-queue").get(getManagerApprovalQueue);

router.route("/:goalSheetId").get(getGoalSheet);

router.route("/:goalSheetId/goals").post(addGoal);

router.route("/:goalSheetId/goals/:goalId").patch(updateGoal).delete(deleteGoal);

router.route("/:goalSheetId/submit").post(submitGoalSheet);

router.route("/:goalSheetId/approve").post(approveGoalSheet);

router.route("/:goalSheetId/return").post(returnGoalSheet);

export default router;
