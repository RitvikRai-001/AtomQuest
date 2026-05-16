import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowUpRight, CheckCircle2, ClipboardCheck, FileText, MessageSquare, Target, TrendingUp } from "lucide-react";
import { AppShell, KpiCard, ProgressBar, SectionHeader } from "@/components/AtomQuestShell";
import { getStoredToken, goalSheetApi } from "@/lib/api";
import { buildRows, formatDate, goalStats } from "@/lib/employeeGoals";

export const Route = createFileRoute("/employee_/activity")({ component: EmployeeActivity });

type ActivityTone = "teal" | "success" | "amber" | "danger" | "violet";

type ActivityItem = {
  id: string;
  title: string;
  body: string;
  time?: string;
  actor: string;
  tone: ActivityTone;
  icon: any;
  category: "Sheet" | "Goal" | "Achievement" | "Feedback";
};

function EmployeeActivity() {
  const hasToken = Boolean(getStoredToken());

  const activityQuery = useQuery({
    queryKey: ["employee-goal-sheet"],
    queryFn: goalSheetApi.getMyGoalSheet,
    enabled: hasToken,
    retry: false,
  });

  const payload = (activityQuery.data as any)?.data;
  const rows = buildRows(payload);
  const stats = goalStats(rows);
  const goalSheet = payload?.goalSheet;
  const achievements = payload?.achievements || [];
  const checkins = payload?.checkins || [];

  const activities = useMemo(() => buildActivities(payload), [payload]);
  const achievementEvents = activities.filter((item) => item.category === "Achievement").length;
  const feedbackEvents = activities.filter((item) => item.category === "Feedback").length;
  const latestActivity = activities[0];

  return (
    <AppShell role="Employee" title="Activity" breadcrumb="FY26" primaryAction={{ label: "Refresh activity", icon: Activity, onClick: () => activityQuery.refetch() }}>
      {!hasToken && (
        <div className="mb-4 rounded-md border border-amber/40 bg-amber/10 px-4 py-3 text-[12.5px] text-sec">
          Sign in as the employee account to load live activity.
        </div>
      )}

      {activityQuery.isError && (
        <div className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-[12.5px] text-sec">
          {(activityQuery.error as Error).message}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Activity events" value={String(activities.length)} delta="Live" sub="Sheet, goals, updates, and feedback" />
        <KpiCard label="Achievement updates" value={String(achievementEvents)} delta={`${achievements.length} records`} sub="Quarterly actuals captured" />
        <KpiCard label="Manager feedback" value={String(feedbackEvents)} delta={feedbackEvents ? "Synced" : "None"} deltaTone={feedbackEvents ? "up" : "flat"} sub="Check-in comments posted" />
        <KpiCard label="Latest change" value={latestActivity ? formatDate(latestActivity.time) : "-"} delta={goalSheet?.status || "draft"} sub="Most recent timeline item" />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <section className="card-soft col-span-8 overflow-hidden">
          <div className="border-b border-subtle px-4 py-3">
            <SectionHeader title="Goal activity timeline" hint="Live events generated from your current goal sheet data" />
          </div>

          <div className="divide-y divide-[#2A3038]">
            {activities.length > 0 ? (
              activities.map((item, index) => <TimelineRow key={item.id} item={item} last={index === activities.length - 1} />)
            ) : (
              <div className="p-6 text-[12.5px] leading-6 text-sec">
                No activity is available yet. Create goals, submit your sheet, update achievements, or receive feedback to build the timeline.
              </div>
            )}
          </div>
        </section>

        <aside className="col-span-4 space-y-4">
          <section className="card-soft p-4">
            <SectionHeader title="Current sheet" hint="Live state" />
            <div className="space-y-3">
              <SideMetric label="Status" value={goalSheet?.status || "draft"} />
              <SideMetric label="Goals" value={`${rows.length} active`} />
              <SideMetric label="Weightage" value={`${stats.totalWeightage}%`} />
              <SideMetric label="Average progress" value={`${stats.averageProgress}%`} />
            </div>
          </section>

          <section className="card-soft p-4">
            <SectionHeader title="Progress movement" hint="Across active goals" />
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[11.5px]">
                    <span className="truncate text-sec">{row.title}</span>
                    <span className="tabular-nums text-pri">{row.progress}%</span>
                  </div>
                  <ProgressBar value={row.progress} tone={row.progress >= 80 ? "success" : row.progress >= 50 ? "teal" : "danger"} />
                </div>
              ))}
            </div>
          </section>

          <section className="card-soft p-4">
            <SectionHeader title="Activity mix" hint="Event categories" />
            <div className="grid grid-cols-2 gap-2">
              {["Sheet", "Goal", "Achievement", "Feedback"].map((category) => (
                <div key={category} className="rounded-md border border-subtle bg-app-2 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-mut">{category}</div>
                  <div className="mt-1 text-[22px] font-semibold tabular-nums text-pri">
                    {activities.filter((item) => item.category === category).length}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function TimelineRow({ item, last }: { item: ActivityItem; last: boolean }) {
  const Icon = item.icon;
  const color = toneColor(item.tone);

  return (
    <article className="grid grid-cols-[40px_1fr_120px] gap-3 px-4 py-4">
      <div className="relative flex justify-center">
        <div className="grid h-8 w-8 place-items-center rounded-md border border-subtle bg-app-2" style={{ color }}>
          <Icon className="h-4 w-4" />
        </div>
        {!last && <div className="absolute top-9 h-[calc(100%+16px)] w-px bg-subtle" />}
      </div>
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[13px] font-semibold text-pri">{item.title}</span>
          <span className="rounded-md border border-subtle bg-surface px-2 py-0.5 text-[10.5px] text-mut">{item.category}</span>
        </div>
        <p className="text-[12.5px] leading-6 text-sec">{item.body}</p>
        <div className="mt-2 text-[11px] text-mut">By {item.actor}</div>
      </div>
      <div className="text-right text-[11.5px] text-mut">{formatDate(item.time)}</div>
    </article>
  );
}

function SideMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-app-2 px-3 py-2.5">
      <span className="text-[12px] text-sec">{label}</span>
      <span className="text-[12px] font-medium tabular-nums text-pri">{value}</span>
    </div>
  );
}

function buildActivities(payload: any): ActivityItem[] {
  const goalSheet = payload?.goalSheet;
  const goals = payload?.goals || [];
  const achievements = payload?.achievements || [];
  const checkins = payload?.checkins || [];
  const rows = buildRows(payload);

  const items: ActivityItem[] = [];

  if (goalSheet) {
    items.push({
      id: `sheet-${goalSheet._id}-status`,
      title: "Goal sheet status updated",
      body: `Your goal sheet is currently ${goalSheet.status}.`,
      time: goalSheet.updatedAt || goalSheet.createdAt,
      actor: goalSheet.status === "locked" || goalSheet.status === "approved" ? "Manager" : "Employee",
      tone: goalSheet.status === "returned" ? "amber" : "success",
      icon: ClipboardCheck,
      category: "Sheet",
    });

    if (goalSheet.submittedAt) {
      items.push({
        id: `sheet-${goalSheet._id}-submitted`,
        title: "Goal sheet submitted",
        body: "Your goals were submitted to the manager approval queue.",
        time: goalSheet.submittedAt,
        actor: "Employee",
        tone: "teal",
        icon: ArrowUpRight,
        category: "Sheet",
      });
    }

    if (goalSheet.approvedAt) {
      items.push({
        id: `sheet-${goalSheet._id}-approved`,
        title: "Goal sheet approved",
        body: "Manager approved and locked the sheet for quarterly achievement tracking.",
        time: goalSheet.approvedAt,
        actor: "Manager",
        tone: "success",
        icon: CheckCircle2,
        category: "Sheet",
      });
    }
  }

  goals.forEach((goal: any, index: number) => {
    items.push({
      id: `goal-${goal._id}`,
      title: `Goal added: ${goal.title}`,
      body: `${goal.weightage}% weightage in ${goal.thrustArea}. Target: ${goal.target} ${goal.uomType}.`,
      time: goal.createdAt,
      actor: "Employee",
      tone: "violet",
      icon: Target,
      category: "Goal",
    });
  });

  achievements.forEach((achievement: any) => {
    const goalId = typeof achievement.goalId === "string" ? achievement.goalId : achievement.goalId?._id;
    const row = rows.find((goal) => goal.id === goalId);
    items.push({
      id: `achievement-${achievement._id}`,
      title: `${achievement.quarter} achievement updated`,
      body: `${row?.title || "Goal"} recorded actual ${achievement.actual} with ${Math.round(achievement.progressScore || 0)}% tracking score.`,
      time: achievement.updatedAt || achievement.createdAt,
      actor: "Employee",
      tone: "teal",
      icon: TrendingUp,
      category: "Achievement",
    });
  });

  checkins.forEach((checkin: any) => {
    const goalId = typeof checkin.goalId === "string" ? checkin.goalId : checkin.goalId?._id;
    const row = rows.find((goal) => goal.id === goalId);
    items.push({
      id: `checkin-${checkin._id}`,
      title: `${checkin.quarter} manager feedback posted`,
      body: `${row?.title || "Goal"}: ${checkin.comment}`,
      time: checkin.createdAt,
      actor: checkin.managerId?.fullname || "Manager",
      tone: checkin.outcome === "At Risk" ? "danger" : checkin.outcome === "Needs Support" ? "amber" : "success",
      icon: MessageSquare,
      category: "Feedback",
    });
  });

  return items.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
}

function toneColor(tone: ActivityTone) {
  const map: Record<ActivityTone, string> = {
    teal: "#4FD1C5",
    success: "#7DD87D",
    amber: "#F59E0B",
    danger: "#F87171",
    violet: "#A78BFA",
  };
  return map[tone];
}
