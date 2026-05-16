import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Achievement } from "../models/achievement.model.js";
import { AuditLog } from "../models/auditLog.model.js";
import { CheckinWindow } from "../models/checkinWindow.model.js";
import { Goal } from "../models/goal.model.js";
import { GoalSheet } from "../models/goalSheet.model.js";
import { SharedGoal } from "../models/sharedGoal.model.js";

const validateObjectId = (id, fieldName) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`${fieldName} is invalid`);
    error.statusCode = 400;
    throw error;
  }
};

const roundScore = (score) => {
  if (Number.isNaN(score) || !Number.isFinite(score)) {
    return 0;
  }

  const cappedScore = Math.max(0, Math.min(score, 100));
  return Math.round(cappedScore * 100) / 100;
};

const getNumber = (value) => {
  const numberValue = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isNaN(numberValue) ? 0 : numberValue;
};

const calculateProgressScore = ({ scoringType, target, actual }) => {
  if (scoringType === "Min") {
    const targetValue = getNumber(target);
    const actualValue = getNumber(actual);

    if (targetValue <= 0) return 0;
    return roundScore((actualValue / targetValue) * 100);
  }

  if (scoringType === "Max") {
    const targetValue = getNumber(target);
    const actualValue = getNumber(actual);

    if (targetValue <= 0 || actualValue <= 0) return 0;
    return roundScore((targetValue / actualValue) * 100);
  }

  if (scoringType === "Zero") {
    const actualValue = getNumber(actual);
    return actualValue === 0 ? 100 : 0;
  }

  if (scoringType === "Timeline") {
    const deadline = new Date(target);
    const completionDate = new Date(actual);

    if (Number.isNaN(deadline.getTime()) || Number.isNaN(completionDate.getTime())) {
      return 0;
    }

    if (completionDate <= deadline) {
      return 100;
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const delayDays = Math.ceil((completionDate - deadline) / oneDay);

    return roundScore(100 - delayDays * 5);
  }

  return 0;
};

const checkQuarterWindow = async ({ cycleId, quarter }) => {
  const now = new Date();

  const activeWindow = await CheckinWindow.findOne({
    cycleId,
    period: quarter,
    status: "open",
    openDate: { $lte: now },
    closeDate: { $gte: now },
  });

  if (!activeWindow) {
    const error = new Error(`${quarter} update window is not open`);
    error.statusCode = 400;
    throw error;
  }

  return activeWindow;
};

const createAuditLog = async ({ achievement, oldValue, changedBy }) => {
  await AuditLog.create({
    entityType: "Achievement",
    entityId: achievement._id,
    action: oldValue ? "Updated" : "Created",
    oldValue,
    newValue: achievement,
    changedBy,
    changedByRole: "employee",
  });
};

const syncSharedGoalAchievements = async ({ sourceGoal, sourceAchievement, updatedBy }) => {
  if (!sourceGoal.sharedGoalId) return;

  const sharedGoal = await SharedGoal.findById(sourceGoal.sharedGoalId);
  if (!sharedGoal || sharedGoal.primaryOwnerId.toString() !== updatedBy) return;

  const linkedGoals = await Goal.find({
    sharedGoalId: sourceGoal.sharedGoalId,
    _id: { $ne: sourceGoal._id },
  });

  for (const linkedGoal of linkedGoals) {
    const oldAchievement = await Achievement.findOne({
      goalId: linkedGoal._id,
      quarter: sourceAchievement.quarter,
    });

    const syncedAchievement = await Achievement.findOneAndUpdate(
      {
        goalId: linkedGoal._id,
        quarter: sourceAchievement.quarter,
      },
      {
        $set: {
          plannedTarget: linkedGoal.target,
          actual: sourceAchievement.actual,
          status: sourceAchievement.status,
          progressScore: sourceAchievement.progressScore,
          employeeRemarks: sourceAchievement.employeeRemarks,
          updatedBy,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    await createAuditLog({
      achievement: syncedAchievement,
      oldValue: oldAchievement,
      changedBy: updatedBy,
    });
  }
};

const upsertAchievement = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const { quarter, actual, status, employeeRemarks, updatedBy } = req.body;

  validateObjectId(goalId, "goalId");
  validateObjectId(updatedBy, "updatedBy");

  if (!quarter || !["Q1", "Q2", "Q3", "Q4"].includes(quarter)) {
    return res.status(400).json({
      success: false,
      message: "Valid quarter is required",
    });
  }

  if (actual === undefined || actual === null || actual === "") {
    return res.status(400).json({
      success: false,
      message: "Actual achievement is required",
    });
  }

  const goal = await Goal.findById(goalId);
  if (!goal) {
    return res.status(404).json({ success: false, message: "Goal not found" });
  }

  if (!goal.locked) {
    return res.status(400).json({
      success: false,
      message: "Achievement can be updated only for approved and locked goals",
    });
  }

  const goalSheet = await GoalSheet.findById(goal.goalSheetId);
  if (!goalSheet) {
    return res.status(404).json({ success: false, message: "Goal sheet not found" });
  }

  await checkQuarterWindow({ cycleId: goalSheet.cycleId, quarter });

  const progressScore = calculateProgressScore({
    scoringType: goal.scoringType,
    target: goal.target,
    actual,
  });

  const oldAchievement = await Achievement.findOne({ goalId, quarter });

  const achievement = await Achievement.findOneAndUpdate(
    { goalId, quarter },
    {
      $set: {
        plannedTarget: goal.target,
        actual,
        status,
        progressScore,
        employeeRemarks,
        updatedBy,
        updatedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  await createAuditLog({
    achievement,
    oldValue: oldAchievement,
    changedBy: updatedBy,
  });

  await syncSharedGoalAchievements({
    sourceGoal: goal,
    sourceAchievement: achievement,
    updatedBy,
  });

  return res.status(oldAchievement ? 200 : 201).json({
    success: true,
    message: oldAchievement ? "Achievement updated" : "Achievement created",
    data: achievement,
  });
});

const previewProgressScore = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const { actual } = req.body;

  validateObjectId(goalId, "goalId");

  const goal = await Goal.findById(goalId);
  if (!goal) {
    return res.status(404).json({ success: false, message: "Goal not found" });
  }

  const progressScore = calculateProgressScore({
    scoringType: goal.scoringType,
    target: goal.target,
    actual,
  });

  return res.status(200).json({
    success: true,
    data: {
      goalId: goal._id,
      scoringType: goal.scoringType,
      target: goal.target,
      actual,
      progressScore,
    },
  });
});

const getGoalAchievements = asyncHandler(async (req, res) => {
  const { goalId } = req.params;

  validateObjectId(goalId, "goalId");

  const achievements = await Achievement.find({ goalId })
    .populate("updatedBy", "fullname email role")
    .sort({ quarter: 1 });

  return res.status(200).json({
    success: true,
    data: achievements,
  });
});

const getGoalSheetAchievements = asyncHandler(async (req, res) => {
  const { goalSheetId } = req.params;

  validateObjectId(goalSheetId, "goalSheetId");

  const goals = await Goal.find({ goalSheetId }).select("_id title target scoringType weightage");
  const goalIds = goals.map((goal) => goal._id);

  const achievements = await Achievement.find({ goalId: { $in: goalIds } })
    .populate("goalId", "title target scoringType weightage")
    .populate("updatedBy", "fullname email role")
    .sort({ quarter: 1 });

  return res.status(200).json({
    success: true,
    data: {
      goals,
      achievements,
    },
  });
});

export {
  upsertAchievement,
  previewProgressScore,
  getGoalAchievements,
  getGoalSheetAchievements,
};
