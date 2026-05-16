import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, CalendarClock, CheckCircle2, ClipboardCheck, MessageSquare, Save } from "lucide-react";
import { AppShell, KpiCard, ProgressBar, SectionHeader, StatusPill } from "@/components/AtomQuestShell";
import { achievementApi, getStoredToken, goalSheetApi } from "@/lib/api";
import { buildRows, formatDate, goalStats, latestAchievement, type GoalRow } from "@/lib/employeeGoals";

export const Route = createFileRoute("/employee_/checkins")({ component: EmployeeCheckins });

type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
type AchievementStatus = "Not Started" | "On Track" | "Completed";

const quarters: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];
const statuses: AchievementStatus[] = ["Not Started", "On Track", "Completed"];

const schedule = [
  { period: "Phase 1", window: "1 May", action: "Goal creation, submission and approval" },
  { period: "Q1", window: "July", action: "Progress update, planned vs actual" },
  { period: "Q2", window: "October", action: "Progress update, planned vs actual" },
  { period: "Q3", window: "January", action: "Progress update, planned vs actual" },
  { period: "Q4", window: "March / April", action: "Final achievement capture" },
];

function EmployeeCheckins() {
  const hasToken = Boolean(getStoredToken());
  const queryClient = useQueryClient();
  const [quarter, setQuarter] = useState<Quarter>("Q1");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [form, setForm] = useState({ actual: "", status: "On Track" as AchievementStatus, employeeRemarks: "" });
  const [previewScore, setPreviewScore] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const checkinsQuery = useQuery({
    queryKey: ["employee-goal-sheet"],
    queryFn: goalSheetApi.getMyGoalSheet,
    enabled: hasToken,
    retry: false,
  });

  const payload = (checkinsQuery.data as any)?.data;
  const rows = buildRows(payload);
  const stats = goalStats(rows);
  const achievements = payload?.achievements || [];
  const checkins = payload?.checkins || [];
  const selectedGoal = rows.find((row) => row.id === selectedGoalId) || rows[0];
  const selectedAchievement = selectedGoal ? getAchievementForQuarter(selectedGoal.id, quarter, achievements) : null;
  const quarterAchievements = rows.map((goal) => ({
    goal,
    achievement: getAchievementForQuarter(goal.id, quarter, achievements),
  }));
  const completedThisQuarter = quarterAchievements.filter((item) => item.achievement?.status === "Completed").length;
  const updatedThisQuarter = quarterAchievements.filter((item) => item.achievement).length;
  const averageQuarterProgress = quarterAchievements.length
    ? Math.round(
        quarterAchievements.reduce((sum, item) => sum + Math.round(item.achievement?.progressScore || 0), 0) /
          quarterAchievements.length
      )
    : 0;

  const quarterCheckins = useMemo(() => {
    return checkins.filter((item: any) => item.quarter === quarter);
  }, [checkins, quarter]);

  const openGoal = (goal: GoalRow) => {
    const achievement = getAchievementForQuarter(goal.id, quarter, achievements);
    setSelectedGoalId(goal.id);
    setPreviewScore(null);
    setMessage("");
    setForm({
      actual: achievement?.actual || "",
      status: achievement?.status || "On Track",
      employeeRemarks: achievement?.employeeRemarks || "",
    });
  };

  const previewMutation = useMutation({
    mutationFn: () => achievementApi.previewProgress(selectedGoal.id, form.actual),
    onSuccess: (response: any) => {
      setPreviewScore(Math.round(response.data.progressScore || 0));
      setMessage("Progress score preview updated from backend formula.");
    },
    onError: (error) => setMessage((error as Error).message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      achievementApi.updateAchievement(selectedGoal.id, {
        quarter,
        actual: form.actual,
        status: form.status,
        employeeRemarks: form.employeeRemarks,
      }),
    onSuccess: async () => {
      setMessage("Achievement saved for this quarter.");
      setPreviewScore(null);
      await queryClient.invalidateQueries({ queryKey: ["employee-goal-sheet"] });
    },
    onError: (error) => setMessage((error as Error).message),
  });

  return (
    <AppShell role="Employee" title="Quarterly check-ins" breadcrumb="FY26" primaryAction={{ label: "Save update", icon: Save, onClick: () => updateMutation.mutate() }}>
      {!hasToken && (
        <div className="mb-4 rounded-md border border-amber/40 bg-amber/10 px-4 py-3 text-[12.5px] text-sec">
          Sign in as the employee account to load live check-in data.
        </div>
      )}

      {(checkinsQuery.isError || message) && (
        <div className={`mb-4 rounded-md border px-4 py-3 text-[12.5px] text-sec ${checkinsQuery.isError ? "border-danger/40 bg-danger/10" : "border-teal/40 bg-teal/10"}`}>
          {checkinsQuery.isError ? (checkinsQuery.error as Error).message : message}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Selected period" value={quarter} delta="Windowed" sub="Backend enforces open quarter windows" />
        <KpiCard label="Updated goals" value={`${updatedThisQuarter} / ${rows.length}`} delta={updatedThisQuarter === rows.length ? "Complete" : "Pending"} deltaTone={updatedThisQuarter === rows.length ? "up" : "flat"} sub="Actual achievements captured" />
        <KpiCard label="Quarter progress" value={`${averageQuarterProgress}%`} delta={averageQuarterProgress >= 70 ? "On track" : "Watch"} deltaTone={averageQuarterProgress >= 70 ? "up" : "flat"} sub="System-computed tracking score" />
        <KpiCard label="Completed" value={String(completedThisQuarter)} delta={`${stats.onTrackGoals} active goals`} sub="Employee selected status" />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <section className="card-soft col-span-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <div>
              <div className="text-[14px] font-semibold text-pri">Planned vs actual</div>
              <div className="mt-0.5 text-[11.5px] text-mut">Employees log actual achievement against approved planned targets.</div>
            </div>
            <div className="flex gap-2">
              {quarters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuarter(item);
                    setPreviewScore(null);
                    setMessage("");
                  }}
                  className={`h-8 rounded-md px-3 text-[12px] transition ${quarter === item ? "bg-teal text-[#0D0F12]" : "hairline bg-surface text-sec hover:bg-elevated hover:text-pri"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#2A3038]">
            {quarterAchievements.map(({ goal, achievement }) => {
              const score = Math.round(achievement?.progressScore || 0);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => openGoal(goal)}
                  className={`grid w-full grid-cols-[1fr_120px_120px_160px] items-center gap-4 px-4 py-4 text-left transition ${selectedGoal?.id === goal.id ? "bg-teal/10" : "hover:bg-elevated/60"}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-teal">{goal.code}</span>
                      <span className="text-[10.5px] uppercase tracking-wider text-mut">{goal.scoringType}</span>
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-pri">{goal.title}</div>
                    <div className="mt-1 text-[11.5px] text-mut">Planned target: {goal.target} {goal.uomType}</div>
                  </div>
                  <Metric label="Actual" value={achievement?.actual || "Not updated"} />
                  <div>{achievement?.status ? <StatusPill kind={achievement.status === "Not Started" ? "Draft" : achievement.status} /> : <StatusPill kind="Draft" />}</div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-[11.5px]">
                      <span className="text-mut">Score</span>
                      <span className="tabular-nums text-pri">{score}%</span>
                    </div>
                    <ProgressBar value={score} tone={score >= 80 ? "success" : score >= 50 ? "teal" : "danger"} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="col-span-4 space-y-4">
          <section className="card-soft p-4">
            <SectionHeader title="Achievement update" hint={selectedGoal ? `${selectedGoal.code} · ${quarter}` : "Select a goal"} />
            {selectedGoal && (
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  updateMutation.mutate();
                }}
              >
                <div className="rounded-md border border-subtle bg-app-2 p-3">
                  <div className="text-[13px] font-semibold leading-5 text-pri">{selectedGoal.title}</div>
                  <div className="mt-1 text-[12px] text-mut">Target: {selectedGoal.target} {selectedGoal.uomType} · {selectedGoal.scoringType}</div>
                </div>
                {!selectedGoal.locked && (
                  <div className="rounded-md border border-amber/40 bg-amber/10 px-3 py-2 text-[12px] leading-5 text-sec">
                    Achievement capture opens after the manager approves and locks this goal sheet.
                  </div>
                )}
                <SelectField label="Status" value={form.status} values={statuses} onChange={(value) => setForm({ ...form, status: value as AchievementStatus })} />
                <Field label={selectedGoal.scoringType === "Timeline" ? "Completion date" : "Actual achievement"} value={form.actual} onChange={(value) => setForm({ ...form, actual: value })} type={selectedGoal.scoringType === "Timeline" ? "date" : "text"} />
                <Field label="Employee remarks" value={form.employeeRemarks} onChange={(value) => setForm({ ...form, employeeRemarks: value })} textarea />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!form.actual || previewMutation.isPending}
                    onClick={() => previewMutation.mutate()}
                    className="h-9 rounded-md hairline bg-surface text-[12px] text-sec transition hover:bg-elevated hover:text-pri disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {previewMutation.isPending ? "Previewing..." : "Preview score"}
                  </button>
                  <button
                    disabled={!selectedGoal.locked || !form.actual || updateMutation.isPending}
                    className="h-9 rounded-md bg-teal text-[12px] font-medium text-[#0D0F12] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save actual"}
                  </button>
                </div>
                <div className="rounded-md border border-subtle bg-surface p-3">
                  <div className="text-[10px] uppercase tracking-wider text-mut">Tracking score</div>
                  <div className="mt-1 text-[26px] font-semibold tabular-nums text-pri">
                    {previewScore ?? Math.round(selectedAchievement?.progressScore || 0)}%
                  </div>
                  <div className="mt-1 text-[11.5px] leading-5 text-mut">Computed from the backend progress formula. This is for tracking only, not rating.</div>
                </div>
              </form>
            )}
          </section>

          <section className="card-soft p-4">
            <SectionHeader title="Manager check-ins" hint={`${quarter} discussion notes`} />
            <div className="space-y-2.5">
              {quarterCheckins.length > 0 ? quarterCheckins.map((item: any) => (
                <div key={item._id} className="rounded-md border border-subtle bg-app-2 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-teal" />
                    <span className="text-[12px] font-medium text-pri">{item.outcome}</span>
                    <span className="ml-auto text-[10.5px] text-mut">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="text-[12px] leading-5 text-sec">{item.comment}</p>
                </div>
              )) : (
                <div className="rounded-md border border-subtle bg-app-2 p-4 text-[12px] leading-5 text-sec">
                  No manager check-in comment has been recorded for {quarter}.
                </div>
              )}
            </div>
          </section>

          <section className="card-soft p-4">
            <SectionHeader title="Check-in schedule" hint="Quarterly windows" />
            <div className="space-y-2">
              {schedule.map((item) => (
                <div key={item.period} className="flex gap-3 rounded-md bg-app-2 p-2.5">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface text-teal">
                    {item.period === "Phase 1" ? <ClipboardCheck className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-pri">{item.period} · {item.window}</div>
                    <div className="text-[11px] leading-5 text-mut">{item.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="card-soft mt-4 p-4">
        <SectionHeader title="Progress score formulas" hint="System-computed tracking only" />
        <div className="grid grid-cols-4 gap-3">
          <FormulaCard title="Min" body="Higher is better. Achievement divided by target." example="Sales revenue, conversion %" />
          <FormulaCard title="Max" body="Lower is better. Target divided by achievement." example="TAT, cost, defect rate" />
          <FormulaCard title="Timeline" body="On or before deadline scores highest; delay reduces score." example="Project completion date" />
          <FormulaCard title="Zero" body="Zero means success. Any non-zero actual scores 0%." example="Safety incidents" />
        </div>
      </section>
    </AppShell>
  );
}

function getAchievementForQuarter(goalId: string, quarter: Quarter, achievements: any[]) {
  return achievements.find((achievement) => {
    const achievementGoalId = typeof achievement.goalId === "string" ? achievement.goalId : achievement.goalId?._id;
    return achievementGoalId === goalId && achievement.quarter === quarter;
  });
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-eyebrow">{label}</div>
      <div className="mt-1 truncate text-[13px] font-medium text-pri">{value}</div>
    </div>
  );
}

function FormulaCard({ title, body, example }: { title: string; body: string; example: string }) {
  return (
    <div className="rounded-md border border-subtle bg-app-2 p-3">
      <div className="mb-2 flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-teal" />
        <div className="text-[12.5px] font-semibold text-pri">{title}</div>
      </div>
      <p className="text-[11.5px] leading-5 text-sec">{body}</p>
      <div className="mt-2 text-[10.5px] text-mut">{example}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  const className = "mt-1 w-full rounded-md border border-subtle bg-app-2 px-3 py-2 text-[12px] text-pri outline-none focus:border-teal";

  return (
    <label className="block">
      <span className="label-eyebrow">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className={className} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} type={type} className={className} />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="label-eyebrow">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-subtle bg-app-2 px-3 py-2 text-[12px] text-pri outline-none focus:border-teal">
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}
