import { Router } from "express";
import {
  getGoalAchievements,
  getGoalSheetAchievements,
  previewProgressScore,
  upsertAchievement,
} from "../controllers/achievement.controller.js";
import { authorizeRoles, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/goals/:goalId")
  .get(getGoalAchievements)
  .post(authorizeRoles("employee"), upsertAchievement);

router.route("/goals/:goalId/preview-progress").post(previewProgressScore);

router.route("/goal-sheets/:goalSheetId").get(getGoalSheetAchievements);

export default router;
