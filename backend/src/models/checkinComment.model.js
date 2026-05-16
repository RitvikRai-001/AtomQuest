import mongoose from "mongoose";

const checkinCommentSchema = new mongoose.Schema(
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

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    outcome: {
      type: String,
      enum: ["On Track", "Needs Support", "At Risk"],
      required: true,
    },
  },
  { timestamps: true }
);

export const CheckinComment = mongoose.model("CheckinComment", checkinCommentSchema);
