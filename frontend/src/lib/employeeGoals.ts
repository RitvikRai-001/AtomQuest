export type GoalHealth = "On Track" | "At Risk" | "Completed" | "Draft";
export type GoalSheetStatus = "Draft" | "Submitted" | "Approved" | "Returned" | "Completed";

export type GoalRow = {
  id: string;
  code: string;
  title: string;
  description: string;
  thrustArea: string;
  uomType: string;
  scoringType: string;
  target: string;
  weightage: number;
  progress: number;
  health: GoalHealth;
  status: GoalSheetStatus;
  due: string;
  locked: boolean;
  latestQuarter?: string;
  latestActual?: string;
  latestRemarks?: string;
};

export const demoRows: GoalRow[] = [
  {
    id: "demo-200",
    code: "OKR-200",
    title: "Reduce customer escalation rate below 5%",
    description: "Keep customer escalation rate below the agreed threshold.",
    thrustArea: "Customer Experience",
    uomType: "%",
    scoringType: "Max",
    target: "5",
    weightage: 25,
    progress: 72,
    health: "On Track",
    status: "Approved",
    due: "Q2",
    locked: true,
  },
  {
    id: "demo-201",
    code: "OKR-201",
    title: "Improve quarterly revenue conversion",
    description: "Improve conversion from qualified pipeline to closed opportunities.",
    thrustArea: "Revenue Growth",
    uomType: "%",
    scoringType: "Min",
    target: "75",
    weightage: 20,
    progress: 88,
    health: "On Track",
    status: "Approved",
    due: "Q2",
    locked: true,
  },
  {
    id: "demo-202",
    code: "OKR-202",
    title: "Cut onboarding turnaround time by 12%",
    description: "Reduce average onboarding turnaround time.",
    thrustArea: "Process Improvement",
    uomType: "Numeric",
    scoringType: "Max",
    target: "10",
    weightage: 15,
    progress: 42,
    health: "At Risk",
    status: "Approved",
    due: "Q2",
    locked: true,
  },
];

export function sheetStatus(status?: string): GoalSheetStatus {
  const map: Record<string, GoalSheetStatus> = {
    draft: "Draft",
    submitted: "Submitted",
    approved: "Approved",
    returned: "Returned",
    locked: "Approved",
  };

  return map[status || ""] || "Draft";
}

export function healthStatus(status?: string, progress = 0): GoalHealth {
  if (status === "Completed" || progress >= 100) return "Completed";
  if (progress > 0 && progress < 50) return "At Risk";
  if (status === "Not Started") return "Draft";
  return "On Track";
}

export function formatDate(value?: string) {
  if (!value) return "Not submitted";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value));
}

export function latestAchievement(goalId: string, achievements: any[]) {
  const matches = achievements.filter((achievement) => {
    const achievementGoalId = typeof achievement.goalId === "string" ? achievement.goalId : achievement.goalId?._id;
    return achievementGoalId === goalId;
  });

  return matches[matches.length - 1];
}

export function buildRows(payload: any): GoalRow[] {
  const goalSheet = payload?.goalSheet;
  const goals = payload?.goals || [];
  const achievements = payload?.achievements || [];

  if (!goalSheet || goals.length === 0) return demoRows;

  return goals.map((goal: any, index: number) => {
    const achievement = latestAchievement(goal._id, achievements);
    const progress = Math.round(achievement?.progressScore || 0);

    return {
      id: goal._id,
      code: `G-${String(index + 1).padStart(3, "0")}`,
      title: goal.title,
      description: goal.description || "No description added.",
      thrustArea: goal.thrustArea || "General",
      uomType: goal.uomType || "-",
      scoringType: goal.scoringType || "-",
      target: goal.target || "-",
      weightage: goal.weightage || 0,
      progress,
      health: healthStatus(achievement?.status, progress),
      status: sheetStatus(goalSheet.status),
      due: goal.uomType === "Timeline" ? goal.target : achievement?.quarter || "Ongoing",
      locked: Boolean(goal.locked),
      latestQuarter: achievement?.quarter,
      latestActual: achievement?.actual,
      latestRemarks: achievement?.employeeRemarks,
    };
  });
}

export function goalStats(rows: GoalRow[]) {
  const totalGoals = rows.length;
  const completedGoals = rows.filter((row) => row.status === "Completed" || row.health === "Completed").length;
  const atRiskGoals = rows.filter((row) => row.health === "At Risk").length;
  const onTrackGoals = rows.filter((row) => row.health === "On Track").length;
  const inReviewGoals = rows.filter((row) => row.status === "Submitted").length;
  const totalWeightage = rows.reduce((sum, row) => sum + row.weightage, 0);
  const averageProgress = totalGoals
    ? Math.round(rows.reduce((sum, row) => sum + row.progress, 0) / totalGoals)
    : 0;

  return {
    totalGoals,
    completedGoals,
    atRiskGoals,
    onTrackGoals,
    inReviewGoals,
    totalWeightage,
    averageProgress,
  };
}
