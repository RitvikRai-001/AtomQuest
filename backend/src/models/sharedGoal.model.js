import mongoose from "mongoose";

const sharedGoalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    uomType: {
      type: String,
      enum: ["Numeric", "%", "Timeline", "Zero"],
      required: true,
    },

    scoringType: {
      type: String,
      enum: ["Min", "Max", "Timeline", "Zero"],
      required: true,
    },

    target: {
      type: String,
      required: true,
      trim: true,
    },

    primaryOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const SharedGoal = mongoose.model("SharedGoal", sharedGoalSchema);
