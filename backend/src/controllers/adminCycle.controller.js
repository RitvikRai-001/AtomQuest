import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuditLog } from "../models/auditLog.model.js";
import { CheckinWindow } from "../models/checkinWindow.model.js";
import { Cycle } from "../models/cycle.model.js";

const validateObjectId = (id, fieldName) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`${fieldName} is invalid`);
    error.statusCode = 400;
    throw error;
  }
};

const validateDateRange = (openDate, closeDate, openFieldName = "startDate", closeFieldName = "endDate") => {
  const start = new Date(openDate);
  const end = new Date(closeDate);

  if (Number.isNaN(start.getTime())) {
    const error = new Error(`${openFieldName} is invalid`);
    error.statusCode = 400;
    throw error;
  }

  if (Number.isNaN(end.getTime())) {
    const error = new Error(`${closeFieldName} is invalid`);
    error.statusCode = 400;
    throw error;
  }

  if (start > end) {
    const error = new Error(`${openFieldName} cannot be after ${closeFieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

const createAuditLog = async ({ entityType, entityId, action, oldValue, newValue, changedBy }) => {
  await AuditLog.create({
    entityType,
    entityId,
    action,
    oldValue,
    newValue,
    changedBy,
    changedByRole: "admin",
  });
};

const createCycle = asyncHandler(async (req, res) => {
  const { name, year, status, startDate, endDate } = req.body;
  const adminId = req.user._id;

  validateDateRange(startDate, endDate);

  const cycle = await Cycle.create({
    name,
    year,
    status,
    startDate,
    endDate,
  });

  await createAuditLog({
    entityType: "Cycle",
    entityId: cycle._id,
    action: "Created",
    oldValue: null,
    newValue: cycle,
    changedBy: adminId,
  });

  return res.status(201).json({
    success: true,
    message: "Cycle created",
    data: cycle,
  });
});

const getCycles = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const cycles = await Cycle.find(filter).sort({ startDate: -1 });

  return res.status(200).json({
    success: true,
    data: cycles,
  });
});

const getCycleById = asyncHandler(async (req, res) => {
  const { cycleId } = req.params;

  validateObjectId(cycleId, "cycleId");

  const cycle = await Cycle.findById(cycleId);
  if (!cycle) {
    return res.status(404).json({ success: false, message: "Cycle not found" });
  }

  const windows = await CheckinWindow.find({ cycleId }).sort({ openDate: 1 });

  return res.status(200).json({
    success: true,
    data: {
      cycle,
      windows,
    },
  });
});

const updateCycle = asyncHandler(async (req, res) => {
  const { cycleId } = req.params;
  const { ...updates } = req.body;
  const adminId = req.user._id;

  validateObjectId(cycleId, "cycleId");

  const cycle = await Cycle.findById(cycleId);
  if (!cycle) {
    return res.status(404).json({ success: false, message: "Cycle not found" });
  }

  const startDate = updates.startDate || cycle.startDate;
  const endDate = updates.endDate || cycle.endDate;
  validateDateRange(startDate, endDate);

  const oldCycle = cycle.toObject();
  Object.assign(cycle, updates);
  await cycle.save();

  await createAuditLog({
    entityType: "Cycle",
    entityId: cycle._id,
    action: "Updated",
    oldValue: oldCycle,
    newValue: cycle,
    changedBy: adminId,
  });

  return res.status(200).json({
    success: true,
    message: "Cycle updated",
    data: cycle,
  });
});

const createCheckinWindow = asyncHandler(async (req, res) => {
  const { cycleId } = req.params;
  const { period, openDate, closeDate, status } = req.body;
  const adminId = req.user._id;

  validateObjectId(cycleId, "cycleId");
  validateDateRange(openDate, closeDate, "openDate", "closeDate");

  const cycle = await Cycle.findById(cycleId);
  if (!cycle) {
    return res.status(404).json({ success: false, message: "Cycle not found" });
  }

  const existingWindow = await CheckinWindow.findOne({ cycleId, period });
  if (existingWindow) {
    return res.status(409).json({
      success: false,
      message: "Window already exists for this cycle and period",
    });
  }

  const checkinWindow = await CheckinWindow.create({
    cycleId,
    period,
    openDate,
    closeDate,
    status,
  });

  await createAuditLog({
    entityType: "CheckinWindow",
    entityId: checkinWindow._id,
    action: "Created",
    oldValue: null,
    newValue: checkinWindow,
    changedBy: adminId,
  });

  return res.status(201).json({
    success: true,
    message: "Check-in window created",
    data: checkinWindow,
  });
});

const getCheckinWindows = asyncHandler(async (req, res) => {
  const { cycleId } = req.params;

  validateObjectId(cycleId, "cycleId");

  const windows = await CheckinWindow.find({ cycleId }).sort({ openDate: 1 });

  return res.status(200).json({
    success: true,
    data: windows,
  });
});

const updateCheckinWindow = asyncHandler(async (req, res) => {
  const { windowId } = req.params;
  const { ...updates } = req.body;
  const adminId = req.user._id;

  validateObjectId(windowId, "windowId");

  const checkinWindow = await CheckinWindow.findById(windowId);
  if (!checkinWindow) {
    return res.status(404).json({ success: false, message: "Check-in window not found" });
  }

  const openDate = updates.openDate || checkinWindow.openDate;
  const closeDate = updates.closeDate || checkinWindow.closeDate;
  validateDateRange(openDate, closeDate, "openDate", "closeDate");

  const oldCheckinWindow = checkinWindow.toObject();
  Object.assign(checkinWindow, updates);
  await checkinWindow.save();

  await createAuditLog({
    entityType: "CheckinWindow",
    entityId: checkinWindow._id,
    action: "Updated",
    oldValue: oldCheckinWindow,
    newValue: checkinWindow,
    changedBy: adminId,
  });

  return res.status(200).json({
    success: true,
    message: "Check-in window updated",
    data: checkinWindow,
  });
});

const deleteCheckinWindow = asyncHandler(async (req, res) => {
  const { windowId } = req.params;
  const adminId = req.user._id;

  validateObjectId(windowId, "windowId");

  const checkinWindow = await CheckinWindow.findByIdAndDelete(windowId);
  if (!checkinWindow) {
    return res.status(404).json({ success: false, message: "Check-in window not found" });
  }

  await createAuditLog({
    entityType: "CheckinWindow",
    entityId: checkinWindow._id,
    action: "Deleted",
    oldValue: checkinWindow,
    newValue: null,
    changedBy: adminId,
  });

  return res.status(200).json({
    success: true,
    message: "Check-in window deleted",
  });
});

export {
  createCycle,
  getCycles,
  getCycleById,
  updateCycle,
  createCheckinWindow,
  getCheckinWindows,
  updateCheckinWindow,
  deleteCheckinWindow,
};
