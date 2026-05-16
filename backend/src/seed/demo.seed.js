import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../db/index.js";
import { Achievement } from "../models/achievement.model.js";
import { CheckinComment } from "../models/checkinComment.model.js";
import { CheckinWindow } from "../models/checkinWindow.model.js";
import { Cycle } from "../models/cycle.model.js";
import { Department } from "../models/department.model.js";
import { Goal } from "../models/goal.model.js";
import { GoalSheet } from "../models/goalSheet.model.js";
import { User } from "../models/user.model.js";

const DEMO_PASSWORD = "Demo@123";

const upsertUser = async ({ email, fullname, role, departmentId, managerId }) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      email,
      password: DEMO_PASSWORD,
      provider: "local",
      fullname,
      role,
      departmentId,
      managerId,
      isActive: true,
      isProfileComplete: true,
    });
  } else {
    user.fullname = fullname;
    user.role = role;
    user.departmentId = departmentId;
    user.managerId = managerId;
    user.provider = "local";
    user.isActive = true;
    user.isProfileComplete = true;
    user.password = DEMO_PASSWORD;
  }

  await user.save();
  return user;
};

const seed = async () => {
  await connectDB();

  const department = await Department.findOneAndUpdate(
    { name: "Product" },
    {
      $set: {
        name: "Product",
        code: "PROD",
        isActive: true,
      },
    },
    { new: true, upsert: true }
  );

  const admin = await upsertUser({
    email: "admin@demo.com",
    fullname: "Aarav Mehta",
    role: "admin",
    departmentId: department._id,
  });

  const manager = await upsertUser({
    email: "manager@demo.com",
    fullname: "Priya Raman",
    role: "manager",
    departmentId: department._id,
  });

  const employee = await upsertUser({
    email: "employee@demo.com",
    fullname: "Sana Khatri",
    role: "employee",
    departmentId: department._id,
    managerId: manager._id,
  });

  department.headId = manager._id;
  await department.save();

  const cycle = await Cycle.findOneAndUpdate(
    { year: "2026-27" },
    {
      $set: {
        name: "FY 2026-27 Goal Sheet",
        year: "2026-27",
        status: "active",
        startDate: new Date("2026-05-01"),
        endDate: new Date("2027-04-30"),
      },
    },
    { new: true, upsert: true }
  );

  const windows = [
    ["GOAL_SETTING", "2026-05-01", "2026-05-31"],
    ["Q1", "2026-07-01", "2026-07-31"],
    ["Q2", "2026-10-01", "2026-10-31"],
    ["Q3", "2027-01-01", "2027-01-31"],
    ["Q4", "2027-03-01", "2027-04-30"],
  ];

  for (const [period, openDate, closeDate] of windows) {
    await CheckinWindow.findOneAndUpdate(
      { cycleId: cycle._id, period },
      {
        $set: {
          cycleId: cycle._id,
          period,
          openDate: new Date(openDate),
          closeDate: new Date(closeDate),
          status: "open",
        },
      },
      { new: true, upsert: true }
    );
  }

  const goalSheet = await GoalSheet.findOneAndUpdate(
    { employeeId: employee._id, cycleId: cycle._id },
    {
      $set: {
        employeeId: employee._id,
        cycleId: cycle._id,
        status: "returned",
        submittedAt: new Date("2026-05-10"),
        managerComment: "Returned for edits so the demo employee can add and update goals.",
      },
      $unset: {
        approvedAt: 1,
        approvedBy: 1,
      },
    },
    { new: true, upsert: true }
  );

  await Goal.deleteMany({ goalSheetId: goalSheet._id });

  const goals = await Goal.insertMany([
    {
      goalSheetId: goalSheet._id,
      thrustArea: "Revenue Growth",
      title: "Improve enterprise pipeline conversion",
      description: "Increase conversion from qualified pipeline to closed opportunities.",
      uomType: "%",
      scoringType: "Min",
      target: "75",
      weightage: 30,
      locked: false,
    },
    {
      goalSheetId: goalSheet._id,
      thrustArea: "Customer Experience",
      title: "Reduce customer escalation rate",
      description: "Keep customer escalation rate below agreed threshold.",
      uomType: "%",
      scoringType: "Max",
      target: "5",
      weightage: 25,
      locked: false,
    },
    {
      goalSheetId: goalSheet._id,
      thrustArea: "Process Improvement",
      title: "Reduce onboarding turnaround time",
      description: "Improve onboarding process and reduce average TAT.",
      uomType: "Numeric",
      scoringType: "Max",
      target: "10",
      weightage: 20,
      locked: false,
    },
    {
      goalSheetId: goalSheet._id,
      thrustArea: "People Development",
      title: "Complete quarterly mentorship plan",
      description: "Run mentorship sessions and document outcomes.",
      uomType: "Numeric",
      scoringType: "Min",
      target: "4",
      weightage: 15,
      locked: false,
    },
    {
      goalSheetId: goalSheet._id,
      thrustArea: "Safety",
      title: "Maintain zero safety incidents",
      description: "Ensure zero reportable incidents for the cycle.",
      uomType: "Zero",
      scoringType: "Zero",
      target: "0",
      weightage: 10,
      locked: false,
    },
  ]);

  await Achievement.deleteMany({ goalId: { $in: goals.map((goal) => goal._id) } });

  await CheckinComment.deleteMany({ goalId: { $in: goals.map((goal) => goal._id) } });

  console.log("Demo data seeded successfully");
  console.log("Employee goal sheet is returned/unlocked for add/edit/submit testing");
  console.log("Employee: employee@demo.com / Demo@123");
  console.log("Manager:  manager@demo.com / Demo@123");
  console.log("Admin:    admin@demo.com / Demo@123");

  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error("Seed failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
