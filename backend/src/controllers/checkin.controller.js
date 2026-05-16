import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuditLog } from "../models/auditLog.model.js";
import { CheckinComment } from "../models/checkinComment.model.js";
import { CheckinWindow } from "../models/checkinWindow.model.js";
import { Goal } from "../models/goal.model.js";
import { GoalSheet } from "../models/goalSheet.model.js";

const validateObjectId = (id, fieldName) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`${fieldName} is invalid`);
    error.statusCode = 400;
    throw error;
  }
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
    const error = new Error(`${quarter} check-in window is not open`);
    error.statusCode = 400;
    throw error;
  }

  return activeWindow;
};

const createAuditLog = async ({ checkinComment, oldValue, changedBy }) => {
  await AuditLog.create({
    entityType: "CheckinComment",
    entityId: checkinComment._id,
    action: oldValue ? "Updated" : "Created",
    oldValue,
    newValue: checkinComment,
    changedBy,
    changedByRole: "manager",
  });
};

const upsertCheckinComment = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const { quarter, managerId, comment, outcome } = req.body;

  validateObjectId(goalId, "goalId");
  validateObjectId(managerId, "managerId");

  if (!quarter || !["Q1", "Q2", "Q3", "Q4"].includes(quarter)) {
    return res.status(400).json({
      success: false,
      message: "Valid quarter is required",
    });
  }

  if (!comment) {
    return res.status(400).json({
      success: false,
      message: "Manager comment is required",
    });
  }

  if (!outcome || !["On Track", "Needs Support", "At Risk"].includes(outcome)) {
    return res.status(400).json({
      success: false,
      message: "Valid discussion outcome is required",
    });
  }

  const goal = await Goal.findById(goalId);
  if (!goal) {
    return res.status(404).json({ success: false, message: "Goal not found" });
  }

  if (!goal.locked) {
    return res.status(400).json({
      success: false,
      message: "Check-in can be added only for approved and locked goals",
    });
  }

  const goalSheet = await GoalSheet.findById(goal.goalSheetId);
  if (!goalSheet) {
    return res.status(404).json({ success: false, message: "Goal sheet not found" });
  }

  await checkQuarterWindow({ cycleId: goalSheet.cycleId, quarter });

  const oldCheckinComment = await CheckinComment.findOne({
    goalId,
    quarter,
    managerId,
  });

  const checkinComment = await CheckinComment.findOneAndUpdate(
    {
      goalId,
      quarter,
      managerId,
    },
    {
      $set: {
        employeeId: goalSheet.employeeId,
        comment,
        outcome,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  await createAuditLog({
    checkinComment,
    oldValue: oldCheckinComment,
    changedBy: managerId,
  });

  return res.status(oldCheckinComment ? 200 : 201).json({
    success: true,
    message: oldCheckinComment ? "Check-in comment updated" : "Check-in comment added",
    data: checkinComment,
  });
});

const getGoalCheckins = asyncHandler(async (req, res) => {
  const { goalId } = req.params;

  validateObjectId(goalId, "goalId");

  const checkins = await CheckinComment.find({ goalId })
    .populate("employeeId", "fullname email role")
    .populate("managerId", "fullname email role")
    .populate("goalId", "title target weightage")
    .sort({ quarter: 1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: checkins,
  });
});

const getEmployeeCheckins = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  validateObjectId(employeeId, "employeeId");

  const checkins = await CheckinComment.find({ employeeId })
    .populate("employeeId", "fullname email role")
    .populate("managerId", "fullname email role")
    .populate("goalId", "title target weightage")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: checkins,
  });
});

const getGoalSheetCheckins = asyncHandler(async (req, res) => {
  const { goalSheetId } = req.params;

  validateObjectId(goalSheetId, "goalSheetId");

  const goals = await Goal.find({ goalSheetId }).select("_id title target weightage");
  const goalIds = goals.map((goal) => goal._id);

  const checkins = await CheckinComment.find({ goalId: { $in: goalIds } })
    .populate("employeeId", "fullname email role")
    .populate("managerId", "fullname email role")
    .populate("goalId", "title target weightage")
    .sort({ quarter: 1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: {
      goals,
      checkins,
    },
  });
});

export {
  upsertCheckinComment,
  getGoalCheckins,
  getEmployeeCheckins,
  getGoalSheetCheckins,
};
