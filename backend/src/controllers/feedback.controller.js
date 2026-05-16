import { GoalSheet } from "../models/goalSheet.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const requestFeedback = asyncHandler(async (req, res) => {
  const employee = req.user;
  const { message } = req.body;

  if (!employee.managerId) {
    throw new ApiError(400, "No manager is assigned to this employee");
  }

  const manager = await User.findById(employee.managerId).select("fullname email role");
  if (!manager || manager.role !== "manager") {
    throw new ApiError(400, "Assigned manager could not be found");
  }

  const goalSheet = await GoalSheet.findOne({ employeeId: employee._id })
    .sort({ updatedAt: -1 })
    .select("status cycleId");

  if (!goalSheet) {
    throw new ApiError(404, "Create a goal sheet before requesting feedback");
  }

  const note = typeof message === "string" && message.trim()
    ? message.trim()
    : "Please review my latest goal progress and share feedback.";

  const notification = await Notification.create({
    userId: manager._id,
    title: "Feedback requested",
    message: `${employee.fullname} requested feedback on their ${goalSheet.status} goal sheet. ${note}`,
    type: "checkin",
  });

  return res.status(201).json({
    success: true,
    message: "Feedback request sent to your manager",
    data: {
      notification,
      manager: {
        _id: manager._id,
        fullname: manager.fullname,
        email: manager.email,
      },
    },
  });
});

export { requestFeedback };
