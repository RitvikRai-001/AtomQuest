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
import { authorizeRoles, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(authorizeRoles("employee"), createGoalSheet);

router.route("/manager/approval-queue").get(authorizeRoles("manager"), getManagerApprovalQueue);

router.route("/manager/:managerId/approval-queue").get(authorizeRoles("manager"), getManagerApprovalQueue);

router.route("/:goalSheetId").get(getGoalSheet);

router.route("/:goalSheetId/goals").post(authorizeRoles("employee"), addGoal);

router
  .route("/:goalSheetId/goals/:goalId")
  .patch(authorizeRoles("employee"), updateGoal)
  .delete(authorizeRoles("employee"), deleteGoal);

router.route("/:goalSheetId/submit").post(authorizeRoles("employee"), submitGoalSheet);

router.route("/:goalSheetId/approve").post(authorizeRoles("manager"), approveGoalSheet);

router.route("/:goalSheetId/return").post(authorizeRoles("manager"), returnGoalSheet);

export default router;
