import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },

    quarter: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4"],
      required: true,
    },

    plannedTarget: {
      type: String,
      required: true,
      trim: true,
    },

    actual: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Not Started", "On Track", "Completed"],
      default: "Not Started",
    },

    progressScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    employeeRemarks: {
      type: String,
      trim: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Achievement = mongoose.model("Achievement", achievementSchema);
