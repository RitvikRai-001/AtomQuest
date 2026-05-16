import { Router } from "express";
import {
  getGoalAchievements,
  getGoalSheetAchievements,
  previewProgressScore,
  upsertAchievement,
} from "../controllers/achievement.controller.js";

const router = Router();

router.route("/goals/:goalId").get(getGoalAchievements).post(upsertAchievement);

router.route("/goals/:goalId/preview-progress").post(previewProgressScore);

router.route("/goal-sheets/:goalSheetId").get(getGoalSheetAchievements);

export default router;
