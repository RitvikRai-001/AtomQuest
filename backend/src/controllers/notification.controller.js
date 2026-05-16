import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  return res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
    },
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "notificationId is invalid");
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId: req.user._id },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, read: false },
    { $set: { read: true } }
  );

  return res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    data: {
      updatedCount: result.modifiedCount,
    },
  });
});

export { getMyNotifications, markNotificationRead, markAllNotificationsRead };
