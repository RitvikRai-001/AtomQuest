import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { GoalSheet } from "../models/goalSheet.model.js";
import { Goal } from "../models/goal.model.js";
import { AuditLog } from "../models/auditLog.model.js";
import { Achievement } from "../models/achievement.model.js";
import { CheckinComment } from "../models/checkinComment.model.js";

const createAuditLog = async ({ entityType, entityId, action, oldValue, newValue, changedBy, changedByRole }) => {
  await AuditLog.create({
    entityType,
    entityId,
    action,
    oldValue,
    newValue,
    changedBy,
    changedByRole,
  });
};

const validateObjectId = (id, fieldName) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`${fieldName} is invalid`);
    error.statusCode = 400;
    throw error;
  }
};

const validateSheetGoals = async (goalSheetId) => {
  const goals = await Goal.find({ goalSheetId });

  if (goals.length === 0) {
    const error = new Error("At least one goal is required");
    error.statusCode = 400;
    throw error;
  }

  if (goals.length > 8) {
    const error = new Error("Maximum 8 goals allowed");
    error.statusCode = 400;
    throw error;
  }

  const hasLowWeightage = goals.some((goal) => goal.weightage < 10);
  if (hasLowWeightage) {
    const error = new Error("Each goal must have at least 10% weightage");
    error.statusCode = 400;
    throw error;
  }

  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage), 0);
  if (totalWeightage !== 100) {
    const error = new Error("Total weightage must equal 100%");
    error.statusCode = 400;
    throw error;
  }

  return goals;
};

const getGoalSheetWithGoals = async (goalSheetId) => {
  const goalSheet = await GoalSheet.findById(goalSheetId)
    .populate("employeeId", "fullname email role departmentId managerId")
    .populate("cycleId", "name year status")
    .populate("approvedBy", "fullname email")
    .populate("returnedBy", "fullname email")
    .populate("unlockedBy", "fullname email");

  if (!goalSheet) {
    const error = new Error("Goal sheet not found");
    error.statusCode = 404;
    throw error;
  }

  const goals = await Goal.find({ goalSheetId: goalSheet._id }).sort({ createdAt: 1 });

  return { goalSheet, goals };
};

const createGoalSheet = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;
  const { cycleId } = req.body;

  validateObjectId(cycleId, "cycleId");

  const existingSheet = await GoalSheet.findOne({ employeeId, cycleId });
  if (existingSheet) {
    return res.status(409).json({
      success: false,
      message: "Goal sheet already exists for this employee and cycle",
    });
  }

  const goalSheet = await GoalSheet.create({
    employeeId,
    cycleId,
  });

  await createAuditLog({
    entityType: "GoalSheet",
    entityId: goalSheet._id,
    action: "Created",
    oldValue: null,
    newValue: goalSheet,
    changedBy: req.user._id,
    changedByRole: "employee",
  });

  return res.status(201).json({
    success: true,
    message: "Goal sheet created",
    data: goalSheet,
  });
});

const getGoalSheet = asyncHandler(async (req, res) => {
  const { goalSheetId } = req.params;

  validateObjectId(goalSheetId, "goalSheetId");

  const data = await getGoalSheetWithGoals(goalSheetId);

  return res.status(200).json({
    success: true,
    data,
  });
});

const getMyGoalSheet = asyncHandler(async (req, res) => {
  const goalSheet = await GoalSheet.findOne({ employeeId: req.user._id })
    .populate("employeeId", "fullname email role departmentId managerId")
    .populate("cycleId", "name year status")
    .populate("approvedBy", "fullname email")
    .populate("returnedBy", "fullname email")
    .populate("unlockedBy", "fullname email")
    .sort({ createdAt: -1 });

  if (!goalSheet) {
    return res.status(200).json({
      success: true,
      message: "No goal sheet found for this employee",
      data: {
        goalSheet: null,
        goals: [],
        achievements: [],
        checkins: [],
      },
    });
  }

  const goals = await Goal.find({ goalSheetId: goalSheet._id }).sort({ createdAt: 1 });
  const goalIds = goals.map((goal) => goal._id);

  const achievements = await Achievement.find({ goalId: { $in: goalIds } })
    .populate("goalId", "title target scoringType weightage")
    .populate("updatedBy", "fullname email role")
    .sort({ quarter: 1 });

  const checkins = await CheckinComment.find({ goalId: { $in: goalIds } })
    .populate("goalId", "title target weightage")
    .populate("managerId", "fullname email role")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: {
      goalSheet,
      goals,
      achievements,
      checkins,
    },
  });
});

const addGoal = asyncHandler(async (req, res) => {
  const { goalSheetId } = req.params;
  const {
    thrustArea,
    title,
    description,
    uomType,
    scoringType,
    target,
    weightage,
    isShared,
    sharedGoalId,
  } = req.body;

  validateObjectId(goalSheetId, "goalSheetId");

  const goalSheet = await GoalSheet.findById(goalSheetId);
  if (!goalSheet) {
    return res.status(404).json({ success: false, message: "Goal sheet not found" });
  }

  if (["submitted", "approved", "locked"].includes(goalSheet.status)) {
    return res.status(400).json({
      success: false,
      message: "Goals cannot be edited after submission or approval",
    });
  }

  if (goalSheet.employeeId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can add goals only to your own goal sheet",
    });
  }

  const goalsCount = await Goal.countDocuments({ goalSheetId });
  if (goalsCount >= 8) {
    return res.status(400).json({
      success: false,
      message: "Maximum 8 goals allowed",
    });
  }

  const goal = await Goal.create({
    goalSheetId,
    thrustArea,
    title,
    description,
    uomType,
    scoringType,
    target,
    weightage,
    isShared,
    sharedGoalId,
  });

  await createAuditLog({
    entityType: "Goal",
    entityId: goal._id,
    action: "Created",
    oldValue: null,
    newValue: goal,
    changedBy: req.user._id,
    changedByRole: req.user.role,
  });

  return res.status(201).json({
    success: true,
    message: "Goal added",
    data: goal,
  });
});

const updateGoal = asyncHandler(async (req, res) => {
  const { goalSheetId, goalId } = req.params;
  const { ...updates } = req.body;

  validateObjectId(goalSheetId, "goalSheetId");
  validateObjectId(goalId, "goalId");

  const goalSheet = await GoalSheet.findById(goalSheetId);
  if (!goalSheet) {
    return res.status(404).json({ success: false, message: "Goal sheet not found" });
  }

  if (["submitted", "approved", "locked"].includes(goalSheet.status)) {
    return res.status(400).json({
      success: false,
      message: "Goals cannot be edited after submission or approval",
    });
  }

  if (goalSheet.employeeId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can update goals only in your own goal sheet",
    });
  }

  const goal = await Goal.findOne({ _id: goalId, goalSheetId });
  if (!goal) {
    return res.status(404).json({ success: false, message: "Goal not found" });
  }

  if (goal.isShared || goal.sharedGoalId) {
    const allowedUpdates = ["weightage"];
    Object.keys(updates).forEach((key) => {
      if (!allowedUpdates.includes(key)) {
        delete updates[key];
      }
    });
  }

  const oldGoal = goal.toObject();
  Object.assign(goal, updates);
  await goal.save();

  await createAuditLog({
    entityType: "Goal",
    entityId: goal._id,
    action: "Updated",
    oldValue: oldGoal,
    newValue: goal,
    changedBy: req.user._id,
    changedByRole: req.user.role,
  });

  return res.status(200).json({
    success: true,
    message: "Goal updated",
    data: goal,
  });
});

const deleteGoal = asyncHandler(async (req, res) => {
  const { goalSheetId, goalId } = req.params;

  validateObjectId(goalSheetId, "goalSheetId");
  validateObjectId(goalId, "goalId");

  const goalSheet = await GoalSheet.findById(goalSheetId);
  if (!goalSheet) {
    return res.status(404).json({ success: false, message: "Goal sheet not found" });
  }

  if (["submitted", "approved", "locked"].includes(goalSheet.status)) {
    return res.status(400).json({
      success: false,
      message: "Goals cannot be deleted after submission or approval",
    });
  }

  if (goalSheet.employeeId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can delete goals only from your own goal sheet",
    });
  }

  const goal = await Goal.findOneAndDelete({ _id: goalId, goalSheetId });
  if (!goal) {
    return res.status(404).json({ success: false, message: "Goal not found" });
  }

  await createAuditLog({
    entityType: "Goal",
    entityId: goal._id,
    action: "Deleted",
    oldValue: goal,
    newValue: null,
    changedBy: req.user._id,
    changedByRole: req.user.role,
  });

  return res.status(200).json({
    success: true,
    message: "Goal deleted",
  });
});

const submitGoalSheet = asyncHandler(async (req, res) => {
  const { goalSheetId } = req.params;
  const employeeId = req.user._id.toString();

  validateObjectId(goalSheetId, "goalSheetId");

  const goalSheet = await GoalSheet.findById(goalSheetId);
  if (!goalSheet) {
    return res.status(404).json({ success: false, message: "Goal sheet not found" });
  }

  if (goalSheet.employeeId.toString() !== employeeId) {
    return res.status(403).json({ success: false, message: "This goal sheet belongs to another employee" });
  }

  if (!["draft", "returned"].includes(goalSheet.status)) {
    return res.status(400).json({
      success: false,
      message: "Only draft or returned goal sheets can be submitted",
    });
  }

  await validateSheetGoals(goalSheetId);

  const oldGoalSheet = goalSheet.toObject();
  goalSheet.status = "submitted";
  goalSheet.submittedAt = new Date();
  goalSheet.managerComment = undefined;
  await goalSheet.save();

  await createAuditLog({
    entityType: "GoalSheet",
    entityId: goalSheet._id,
    action: "Submitted",
    oldValue: oldGoalSheet,
    newValue: goalSheet,
    changedBy: req.user._id,
    changedByRole: "employee",
  });

  return res.status(200).json({
    success: true,
    message: "Goal sheet submitted to manager",
    data: goalSheet,
  });
});

const getManagerApprovalQueue = asyncHandler(async (req, res) => {
  const managerId = req.user._id;

  const employees = await User.find({ managerId }).select("_id fullname email departmentId");
  const employeeIds = employees.map((employee) => employee._id);

  const goalSheets = await GoalSheet.find({
    employeeId: { $in: employeeIds },
    status: "submitted",
  })
    .populate("employeeId", "fullname email departmentId")
    .populate("cycleId", "name year status")
    .sort({ submittedAt: 1 });

  const queue = await Promise.all(
    goalSheets.map(async (sheet) => {
      const goals = await Goal.find({ goalSheetId: sheet._id });
      const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage), 0);

      return {
        goalSheet: sheet,
        goalsCount: goals.length,
        totalWeightage,
      };
    })
  );

  return res.status(200).json({
    success: true,
    data: queue,
  });
});

const approveGoalSheet = asyncHandler(async (req, res) => {
  const { goalSheetId } = req.params;
  const { comment, goals = [] } = req.body;
  const managerId = req.user._id;

  validateObjectId(goalSheetId, "goalSheetId");

  const goalSheet = await GoalSheet.findById(goalSheetId);
  if (!goalSheet) {
    return res.status(404).json({ success: false, message: "Goal sheet not found" });
  }

  if (goalSheet.status !== "submitted") {
    return res.status(400).json({
      success: false,
      message: "Only submitted goal sheets can be approved",
    });
  }

  const employee = await User.findById(goalSheet.employeeId).select("managerId");
  if (!employee || employee.managerId?.toString() !== managerId.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can approve only your team member goal sheets",
    });
  }

  for (const goalUpdate of goals) {
    if (!goalUpdate.goalId || !mongoose.Types.ObjectId.isValid(goalUpdate.goalId)) {
      continue;
    }

    const allowedUpdates = {};
    if (goalUpdate.target !== undefined) allowedUpdates.target = goalUpdate.target;
    if (goalUpdate.weightage !== undefined) allowedUpdates.weightage = goalUpdate.weightage;

    if (Object.keys(allowedUpdates).length > 0) {
      await Goal.findOneAndUpdate(
        { _id: goalUpdate.goalId, goalSheetId },
        { $set: allowedUpdates },
        { runValidators: true }
      );
    }
  }

  await validateSheetGoals(goalSheetId);

  const oldGoalSheet = goalSheet.toObject();
  goalSheet.status = "locked";
  goalSheet.managerComment = comment;
  goalSheet.approvedAt = new Date();
  goalSheet.approvedBy = managerId;
  await goalSheet.save();

  await Goal.updateMany({ goalSheetId }, { $set: { locked: true } });

  await createAuditLog({
    entityType: "GoalSheet",
    entityId: goalSheet._id,
    action: "Approved",
    oldValue: oldGoalSheet,
    newValue: goalSheet,
    changedBy: managerId,
    changedByRole: "manager",
  });

  await createAuditLog({
    entityType: "GoalSheet",
    entityId: goalSheet._id,
    action: "Locked",
    oldValue: { locked: false },
    newValue: { locked: true },
    changedBy: managerId,
    changedByRole: "manager",
  });

  const data = await getGoalSheetWithGoals(goalSheetId);

  return res.status(200).json({
    success: true,
    message: "Goal sheet approved and locked",
    data,
  });
});

const returnGoalSheet = asyncHandler(async (req, res) => {
  const { goalSheetId } = req.params;
  const { comment } = req.body;
  const managerId = req.user._id;

  validateObjectId(goalSheetId, "goalSheetId");

  if (!comment) {
    return res.status(400).json({
      success: false,
      message: "Return comment is required",
    });
  }

  const goalSheet = await GoalSheet.findById(goalSheetId);
  if (!goalSheet) {
    return res.status(404).json({ success: false, message: "Goal sheet not found" });
  }

  if (goalSheet.status !== "submitted") {
    return res.status(400).json({
      success: false,
      message: "Only submitted goal sheets can be returned",
    });
  }

  const employee = await User.findById(goalSheet.employeeId).select("managerId");
  if (!employee || employee.managerId?.toString() !== managerId.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can return only your team member goal sheets",
    });
  }

  const oldGoalSheet = goalSheet.toObject();
  goalSheet.status = "returned";
  goalSheet.managerComment = comment;
  goalSheet.returnedAt = new Date();
  goalSheet.returnedBy = managerId;
  await goalSheet.save();

  await createAuditLog({
    entityType: "GoalSheet",
    entityId: goalSheet._id,
    action: "Returned",
    oldValue: oldGoalSheet,
    newValue: goalSheet,
    changedBy: managerId,
    changedByRole: "manager",
  });

  return res.status(200).json({
    success: true,
    message: "Goal sheet returned for rework",
    data: goalSheet,
  });
});

export {
  createGoalSheet,
  getGoalSheet,
  getMyGoalSheet,
  addGoal,
  updateGoal,
  deleteGoal,
  submitGoalSheet,
  getManagerApprovalQueue,
  approveGoalSheet,
  returnGoalSheet,
};
