import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["Goal", "GoalSheet", "Achievement", "CheckinComment", "SharedGoal", "User", "Cycle", "CheckinWindow"],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    action: {
      type: String,
      enum: ["Created", "Updated", "Submitted", "Approved", "Returned", "Locked", "Unlocked", "Deleted"],
      required: true,
    },

    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },

    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    changedByRole: {
      type: String,
      enum: ["employee", "manager", "admin"],
      required: true,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
