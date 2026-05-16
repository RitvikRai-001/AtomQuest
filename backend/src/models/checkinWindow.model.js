import mongoose from "mongoose";

const checkinWindowSchema = new mongoose.Schema(
  {
    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cycle",
      required: true,
    },

    period: {
      type: String,
      enum: ["GOAL_SETTING", "Q1", "Q2", "Q3", "Q4"],
      required: true,
    },

    openDate: {
      type: Date,
      required: true,
    },

    closeDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export const CheckinWindow = mongoose.model("CheckinWindow", checkinWindowSchema);
