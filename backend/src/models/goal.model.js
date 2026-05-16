import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    goalSheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoalSheet",
      required: true,
    },

    thrustArea: {
      type: String,
      enum: [
        "Revenue Growth",
        "Cost Optimization",
        "Customer Experience",
        "Process Improvement",
        "Compliance",
        "Innovation",
        "People Development",
        "Safety",
      ],
      required: true,
    },

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

    weightage: {
      type: Number,
      required: true,
      min: 10,
      max: 100,
    },

    isShared: {
      type: Boolean,
      default: false,
    },

    sharedGoalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SharedGoal",
    },

    locked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Goal = mongoose.model("Goal", goalSchema);
