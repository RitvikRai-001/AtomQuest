import mongoose from "mongoose";

const cycleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "closed"],
      default: "active",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const Cycle = mongoose.model("Cycle", cycleSchema);
