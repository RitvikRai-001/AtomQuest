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

const createSubmittedSheet = async ({ employee, cycle, submittedAt, goals }) => {
  const goalSheet = await GoalSheet.findOneAndUpdate(
    { employeeId: employee._id, cycleId: cycle._id },
    {
      $set: {
        employeeId: employee._id,
        cycleId: cycle._id,
        status: "submitted",
        submittedAt,
        managerComment: "",
      },
      $unset: {
        approvedAt: 1,
        approvedBy: 1,
        returnedAt: 1,
        returnedBy: 1,
      },
    },
    { new: true, upsert: true }
  );

  await Goal.deleteMany({ goalSheetId: goalSheet._id });

  const createdGoals = await Goal.insertMany(
    goals.map((goal) => ({
      goalSheetId: goalSheet._id,
      locked: false,
      ...goal,
    }))
  );

  await Achievement.deleteMany({ goalId: { $in: createdGoals.map((goal) => goal._id) } });
  await CheckinComment.deleteMany({ goalId: { $in: createdGoals.map((goal) => goal._id) } });

  return goalSheet;
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
    // Demo override: keep Q1 open in May so achievement capture can be tested today.
    ["Q1", "2026-05-01", "2026-05-31"],
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

  await CheckinComment.insertMany([
    {
      goalId: goals[0]._id,
      quarter: "Q1",
      employeeId: employee._id,
      managerId: manager._id,
      outcome: "On Track",
      comment: "Strong start on pipeline conversion. Keep the enterprise follow-up cadence tight and share weekly conversion movement before the next review.",
    },
    {
      goalId: goals[1]._id,
      quarter: "Q1",
      employeeId: employee._id,
      managerId: manager._id,
      outcome: "Needs Support",
      comment: "Escalation rate is improving, but the root-cause notes need clearer owner names. Bring the support handoff list to the next check-in.",
    },
    {
      goalId: goals[2]._id,
      quarter: "Q1",
      employeeId: employee._id,
      managerId: manager._id,
      outcome: "At Risk",
      comment: "Onboarding turnaround is trending behind plan. Reduce scope to the two highest-volume onboarding paths and flag dependency blockers early.",
    },
  ]);

  const queueEmployees = [
    {
      email: "maya@demo.com",
      fullname: "Maya Lin",
      submittedAt: new Date("2026-05-15T09:00:00.000Z"),
      goals: [
        {
          thrustArea: "Revenue Growth",
          title: "Increase activation by 18% in EU",
          description: "Improve activation funnel conversion across EU accounts.",
          uomType: "%",
          scoringType: "Min",
          target: "18",
          weightage: 40,
        },
        {
          thrustArea: "Customer Experience",
          title: "Improve enterprise onboarding CSAT",
          description: "Lift onboarding satisfaction for enterprise customers.",
          uomType: "%",
          scoringType: "Min",
          target: "90",
          weightage: 30,
        },
        {
          thrustArea: "Process Improvement",
          title: "Reduce campaign launch cycle time",
          description: "Reduce campaign launch turnaround time.",
          uomType: "Numeric",
          scoringType: "Max",
          target: "7",
          weightage: 30,
        },
      ],
    },
    {
      email: "daniel@demo.com",
      fullname: "Daniel Okafor",
      submittedAt: new Date("2026-05-15T11:30:00.000Z"),
      goals: [
        {
          thrustArea: "Process Improvement",
          title: "Cut p95 latency to 180ms",
          description: "Improve platform latency for checkout services.",
          uomType: "Numeric",
          scoringType: "Max",
          target: "180",
          weightage: 50,
        },
        {
          thrustArea: "Innovation",
          title: "Ship observability automation",
          description: "Automate core service health dashboards.",
          uomType: "Numeric",
          scoringType: "Min",
          target: "6",
          weightage: 30,
        },
        {
          thrustArea: "People Development",
          title: "Mentor two platform engineers",
          description: "Run structured mentorship for IC2 engineers.",
          uomType: "Numeric",
          scoringType: "Min",
          target: "2",
          weightage: 20,
        },
      ],
    },
    {
      email: "lee@demo.com",
      fullname: "Lee Sato",
      submittedAt: new Date("2026-05-16T06:00:00.000Z"),
      goals: [
        {
          thrustArea: "Innovation",
          title: "Launch design system v3",
          description: "Launch updated component foundations and adoption playbook.",
          uomType: "Timeline",
          scoringType: "Timeline",
          target: "2026-09-30",
          weightage: 45,
        },
        {
          thrustArea: "Process Improvement",
          title: "Reduce design QA defects",
          description: "Reduce quality defects found after handoff.",
          uomType: "%",
          scoringType: "Max",
          target: "5",
          weightage: 35,
        },
        {
          thrustArea: "People Development",
          title: "Run accessibility enablement",
          description: "Train squads on accessibility review patterns.",
          uomType: "Numeric",
          scoringType: "Min",
          target: "4",
          weightage: 20,
        },
      ],
    },
  ];

  for (const report of queueEmployees) {
    const queueEmployee = await upsertUser({
      email: report.email,
      fullname: report.fullname,
      role: "employee",
      departmentId: department._id,
      managerId: manager._id,
    });

    await createSubmittedSheet({
      employee: queueEmployee,
      cycle,
      submittedAt: report.submittedAt,
      goals: report.goals,
    });
  }

  console.log("Demo data seeded successfully");
  console.log("Employee goal sheet is returned/unlocked for add/edit/submit testing");
  console.log("Manager approval queue seeded with submitted direct reports");
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
