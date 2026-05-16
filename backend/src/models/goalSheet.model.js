import mongoose from "mongoose";

const goalSheetSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cycle",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "returned", "locked"],
      default: "draft",
    },

    managerComment: {
      type: String,
      trim: true,
    },

    submittedAt: {
      type: Date,
    },

    approvedAt: {
      type: Date,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    returnedAt: {
      type: Date,
    },

    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    unlockedAt: {
      type: Date,
    },

    unlockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const GoalSheet = mongoose.model("GoalSheet", goalSheetSchema);
