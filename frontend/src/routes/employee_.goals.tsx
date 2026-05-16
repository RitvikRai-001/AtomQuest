import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  Edit3,
  Filter,
  Lock,
  Plus,
  Send,
  Target,
} from "lucide-react";
import { AppShell, KpiCard, ProgressBar, SectionHeader, StatusPill } from "@/components/AtomQuestShell";
import { achievementApi, getStoredToken, goalSheetApi } from "@/lib/api";
import { buildRows, formatDate, goalStats, sheetStatus, type GoalHealth, type GoalRow } from "@/lib/employeeGoals";

export const Route = createFileRoute("/employee_/goals")({ component: EmployeeGoals });

type HealthFilter = "All" | GoalHealth;
type ActionMode = "add" | "edit" | "achievement" | null;

const healthFilters: HealthFilter[] = ["All", "On Track", "At Risk", "Completed", "Draft"];
const thrustAreas = ["Revenue Growth", "Cost Optimization", "Customer Experience", "Process Improvement", "Compliance", "Innovation", "People Development", "Safety"];
const uomTypes = ["Numeric", "%", "Timeline", "Zero"];
const scoringTypes = ["Min", "Max", "Timeline", "Zero"];
const quarters = ["Q1", "Q2", "Q3", "Q4"];
const achievementStatuses = ["Not Started", "On Track", "Completed"];

const emptyGoalForm = {
  thrustArea: "Revenue Growth",
  title: "",
  description: "",
  uomType: "%",
  scoringType: "Min",
  target: "",
  weightage: "10",
};

const emptyAchievementForm = {
  quarter: "Q1",
  actual: "",
  status: "On Track",
  employeeRemarks: "",
};

function EmployeeGoals() {
  const hasToken = Boolean(getStoredToken());
  const queryClient = useQueryClient();
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("All");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [goalForm, setGoalForm] = useState(emptyGoalForm);
  const [achievementForm, setAchievementForm] = useState(emptyAchievementForm);

  const goalsQuery = useQuery({
    queryKey: ["employee-goal-sheet"],
    queryFn: goalSheetApi.getMyGoalSheet,
    enabled: hasToken,
    retry: false,
  });

  const payload = (goalsQuery.data as any)?.data;
  const goalSheet = payload?.goalSheet;
  const rows = buildRows(payload);
  const stats = goalStats(rows);
  const currentSheetStatus = goalSheet ? sheetStatus(goalSheet.status) : "Draft";
  const canEdit = hasToken && goalSheet && ["draft", "returned"].includes(goalSheet.status);
  const canSubmit = goalSheet && ["draft", "returned"].includes(goalSheet.status) && stats.totalWeightage === 100;
  const weightageDelta = stats.totalWeightage - 100;
  const weightageMessage =
    stats.totalWeightage === 100
      ? "Total weightage is balanced at 100%."
      : stats.totalWeightage > 100
        ? `Reduce ${weightageDelta}% before submitting.`
        : `Add ${Math.abs(weightageDelta)}% before submitting.`;

  const submitMutation = useMutation({
    mutationFn: () => goalSheetApi.submitGoalSheet(goalSheet._id),
    onSuccess: async () => {
      setActionMessage("Goal sheet submitted for manager approval.");
      await queryClient.invalidateQueries({ queryKey: ["employee-goal-sheet"] });
    },
    onError: (error) => {
      setActionMessage((error as Error).message);
    },
  });

  const refreshGoals = async (message: string) => {
    setActionMessage(message);
    setActionMode(null);
    await queryClient.invalidateQueries({ queryKey: ["employee-goal-sheet"] });
  };

  const addGoalMutation = useMutation({
    mutationFn: () => goalSheetApi.addGoal(goalSheet._id, { ...goalForm, weightage: Number(goalForm.weightage) }),
    onSuccess: () => refreshGoals("Goal added to the sheet."),
    onError: (error) => setActionMessage((error as Error).message),
  });

  const updateGoalMutation = useMutation({
    mutationFn: () =>
      goalSheetApi.updateGoal(goalSheet._id, selectedGoal.id, { ...goalForm, weightage: Number(goalForm.weightage) }),
    onSuccess: () => refreshGoals("Selected goal updated."),
    onError: (error) => setActionMessage((error as Error).message),
  });

  const achievementMutation = useMutation({
    mutationFn: () => achievementApi.updateAchievement(selectedGoal.id, achievementForm),
    onSuccess: () => refreshGoals("Achievement updated."),
    onError: (error) => setActionMessage((error as Error).message),
  });

  const filteredRows = useMemo(() => {
    if (healthFilter === "All") return rows;
    return rows.filter((row) => row.health === healthFilter);
  }, [healthFilter, rows]);

  const selectedGoal = rows.find((row) => row.id === selectedGoalId) || filteredRows[0] || rows[0];

  const openAddGoal = () => {
    if (!canEdit || !goalSheet) {
      setActionMessage("This goal sheet is not editable right now.");
      return;
    }
    setGoalForm(emptyGoalForm);
    setActionMessage("");
    setActionMode("add");
  };

  const openEditGoal = () => {
    if (!selectedGoal) return;
    setGoalForm({
      thrustArea: selectedGoal.thrustArea,
      title: selectedGoal.title,
      description: selectedGoal.description,
      uomType: selectedGoal.uomType,
      scoringType: selectedGoal.scoringType,
      target: selectedGoal.target,
      weightage: String(selectedGoal.weightage),
    });
    setActionMessage("");
    setActionMode("edit");
  };

  const openAchievement = () => {
    if (!selectedGoal) return;
    setAchievementForm({
      quarter: selectedGoal.latestQuarter || "Q1",
      actual: selectedGoal.latestActual || "",
      status: selectedGoal.health === "Completed" ? "Completed" : "On Track",
      employeeRemarks: selectedGoal.latestRemarks || "",
    });
    setActionMessage("");
    setActionMode("achievement");
  };

  return (
    <AppShell role="Employee" title="My goals" breadcrumb="Q2 FY26" primaryAction={{ label: "New goal", icon: Plus, onClick: openAddGoal }}>
      {!hasToken && (
        <div className="mb-4 rounded-md border border-amber/40 bg-amber/10 px-4 py-3 text-[12.5px] text-sec">
          Demo mode is showing sample goals. Sign in as the employee account to load your live goal sheet.
        </div>
      )}

      {goalsQuery.isError && (
        <div className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-[12.5px] text-sec">
          {(goalsQuery.error as Error).message}
        </div>
      )}

      {actionMessage && (
        <div className="mb-4 rounded-md border border-teal/40 bg-teal/10 px-4 py-3 text-[12.5px] text-sec">
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Sheet status" value={currentSheetStatus} delta={goalSheet ? "Live" : "Demo"} sub={goalSheet ? `Updated ${formatDate(goalSheet.updatedAt)}` : "No live sheet loaded"} />
        <KpiCard label="Total weightage" value={`${stats.totalWeightage}%`} delta={stats.totalWeightage === 100 ? "Balanced" : "Needs 100%"} deltaTone={stats.totalWeightage === 100 ? "up" : "down"} sub={`${stats.totalGoals} active goals`} />
        <KpiCard label="Average progress" value={`${stats.averageProgress}%`} delta={stats.averageProgress >= 70 ? "On pace" : "Watch"} deltaTone={stats.averageProgress >= 70 ? "up" : "flat"} sub="Latest achievement score" />
        <KpiCard label="Attention" value={String(stats.atRiskGoals)} delta={`${stats.onTrackGoals} on track`} deltaTone={stats.atRiskGoals ? "down" : "up"} sub="Goals needing support" />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <section className="card-soft col-span-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold text-pri">Goal portfolio</h2>
                <span className="pill">
                  <span className="pill-dot bg-teal" />
                  {filteredRows.length} shown
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-mut">
                Live objectives, weightage, scoring method, and quarterly achievement progress.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-8 items-center gap-1.5 rounded-md hairline bg-surface px-3 text-[12px] text-sec hover:bg-elevated hover:text-pri">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </button>
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={!canSubmit || submitMutation.isPending}
                className="flex h-8 items-center gap-1.5 rounded-md bg-teal px-3 text-[12px] font-medium text-[#0D0F12] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {submitMutation.isPending ? "Submitting..." : "Submit sheet"}
              </button>
            </div>
          </div>

          {stats.totalWeightage !== 100 && (
            <div className="border-b border-danger/30 bg-danger/10 px-4 py-3 text-[12.5px] text-sec">
              <span className="font-medium text-pri">Total weightage: {stats.totalWeightage}%.</span>{" "}
              {weightageMessage} Editing is allowed while the sheet is {currentSheetStatus.toLowerCase()}, but submit is locked until the total equals 100%.
            </div>
          )}

          <div className="border-b border-subtle px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {healthFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setHealthFilter(filter)}
                  className={`h-8 rounded-md px-3 text-[12px] transition ${
                    healthFilter === filter
                      ? "bg-teal text-[#0D0F12]"
                      : "hairline bg-surface text-sec hover:bg-elevated hover:text-pri"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#2A3038]">
            {filteredRows.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => setSelectedGoalId(goal.id)}
                className={`grid w-full grid-cols-[1fr_92px_160px_116px] items-center gap-4 px-4 py-4 text-left transition ${
                  selectedGoal?.id === goal.id ? "bg-teal/10" : "hover:bg-elevated/60"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-teal">{goal.code}</span>
                    <span className="text-[10.5px] uppercase tracking-wider text-mut">{goal.thrustArea}</span>
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-pri">{goal.title}</div>
                  <p className="mt-1 line-clamp-2 text-[11.5px] leading-5 text-mut">{goal.description}</p>
                </div>

                <div>
                  <div className="label-eyebrow">Weight</div>
                  <div className="mt-1 text-[17px] font-semibold tabular-nums text-pri">{goal.weightage}%</div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-[11.5px]">
                    <span className="text-mut">Progress</span>
                    <span className="tabular-nums text-pri">{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} tone={goal.health === "At Risk" ? "danger" : goal.health === "Completed" ? "success" : "teal"} />
                </div>

                <div className="space-y-2">
                  <StatusPill kind={goal.health as any} />
                  <div>
                    <StatusPill kind={goal.status as any} />
                  </div>
                </div>
              </button>
            ))}

            {filteredRows.length === 0 && (
              <div className="px-4 py-12 text-center">
                <Target className="mx-auto h-7 w-7 text-mut" />
                <div className="mt-3 text-[13px] font-medium text-pri">No goals match this filter</div>
                <p className="mt-1 text-[12px] text-mut">Switch filters or add a new goal when the sheet is editable.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="col-span-4 space-y-4">
          <section className="card-soft p-4">
            <SectionHeader
              title={actionMode === "add" ? "Add goal" : actionMode === "edit" ? "Edit goal" : actionMode === "achievement" ? "Update achievement" : "Selected goal"}
              hint={actionMode === "add" ? "Employee goal sheet" : selectedGoal ? selectedGoal.code : "No goal selected"}
              action={actionMode ? <button className="text-[11.5px] text-sec hover:text-pri" onClick={() => setActionMode(null)}>Close</button> : undefined}
            />
            {actionMode === "achievement" ? (
              <AchievementForm
                form={achievementForm}
                setForm={setAchievementForm}
                pending={achievementMutation.isPending}
                onSubmit={() => achievementMutation.mutate()}
              />
            ) : actionMode === "add" || actionMode === "edit" ? (
                <GoalForm
                  form={goalForm}
                  setForm={setGoalForm}
                  currentTotal={stats.totalWeightage}
                  previousWeightage={actionMode === "edit" ? selectedGoal?.weightage || 0 : 0}
                  pending={addGoalMutation.isPending || updateGoalMutation.isPending}
                  submitLabel={actionMode === "edit" ? "Save goal" : "Add goal"}
                  onSubmit={() => (actionMode === "edit" ? updateGoalMutation.mutate() : addGoalMutation.mutate())}
              />
            ) : (
              selectedGoal && <GoalDetail goal={selectedGoal} canEdit={canEdit} onEdit={openEditGoal} onAchievement={openAchievement} />
            )}
          </section>

          <section className="card-soft p-4">
            <SectionHeader title="Sheet rules" hint="Readiness checks before submit" />
            <div className="space-y-2.5">
              <RuleRow ok={stats.totalGoals <= 8} label="Maximum 8 goals" value={`${stats.totalGoals}/8`} />
              <RuleRow ok={rows.every((row) => row.weightage >= 10)} label="Minimum 10% each" value="Required" />
              <RuleRow ok={stats.totalWeightage === 100} label="Total weightage" value={`${stats.totalWeightage}%`} />
              {stats.totalWeightage !== 100 && (
                <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] leading-5 text-sec">
                  {weightageMessage}
                </div>
              )}
              <RuleRow ok={currentSheetStatus !== "Approved"} label="Editable state" value={canEdit ? "Open" : "Locked"} />
            </div>
          </section>

        </aside>
      </div>
    </AppShell>
  );
}

function GoalDetail({
  goal,
  canEdit,
  onEdit,
  onAchievement,
}: {
  goal: GoalRow;
  canEdit: boolean;
  onEdit: () => void;
  onAchievement: () => void;
}) {
  return (
    <div>
      <div className="rounded-md border border-subtle bg-app-2 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[13px] font-semibold leading-5 text-pri">{goal.title}</div>
            <p className="mt-1 text-[12px] leading-5 text-sec">{goal.description}</p>
          </div>
          <button
            type="button"
            onClick={onEdit}
            disabled={!canEdit}
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md text-amber transition hover:bg-elevated hover:text-pri disabled:cursor-not-allowed disabled:opacity-40"
            title="Edit selected goal"
          >
            {goal.locked ? <Lock className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniMetric label="Thrust area" value={goal.thrustArea} />
        <MiniMetric label="Target" value={`${goal.target} ${goal.uomType}`} />
        <MiniMetric label="Scoring" value={goal.scoringType} />
        <MiniMetric label="Due" value={goal.due} />
      </div>

      <div className="mt-3 rounded-md border border-subtle bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-mut">Latest achievement</span>
          <span className="text-[11px] text-sec">{goal.latestQuarter || "No quarter"}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[26px] font-semibold tabular-nums text-pri">{goal.progress}%</div>
          <div className="min-w-0 flex-1">
            <ProgressBar value={goal.progress} tone={goal.health === "At Risk" ? "danger" : "teal"} />
            <div className="mt-1 text-[11.5px] text-mut">Actual: {goal.latestActual || "Not updated"}</div>
          </div>
        </div>
        <p className="mt-2 text-[12px] leading-5 text-sec">{goal.latestRemarks || "No employee remarks added yet."}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          disabled={!canEdit}
          onClick={onEdit}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md hairline bg-surface text-[12px] text-sec transition hover:bg-elevated hover:text-pri disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          disabled={!goal.locked}
          onClick={onAchievement}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-teal text-[12px] font-medium text-[#0D0F12] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Update
        </button>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-subtle bg-surface p-3">
      <div className="text-[10px] uppercase tracking-wider text-mut">{label}</div>
      <div className="mt-1 truncate text-[12.5px] font-medium text-pri">{value}</div>
    </div>
  );
}

function RuleRow({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-app-2 p-2.5">
      <CheckCircle2 className={`h-4 w-4 ${ok ? "text-success" : "text-danger"}`} />
      <span className="flex-1 text-[12px] text-sec">{label}</span>
      <span className="text-[11.5px] tabular-nums text-pri">{value}</span>
    </div>
  );
}

function GoalForm({
  form,
  setForm,
  currentTotal,
  previousWeightage,
  pending,
  submitLabel,
  onSubmit,
}: {
  form: typeof emptyGoalForm;
  setForm: (form: typeof emptyGoalForm) => void;
  currentTotal: number;
  previousWeightage: number;
  pending: boolean;
  submitLabel: string;
  onSubmit: () => void;
}) {
  const update = (key: keyof typeof emptyGoalForm, value: string) => setForm({ ...form, [key]: value });
  const draftWeightage = Number(form.weightage || 0);
  const projectedTotal = currentTotal - previousWeightage + draftWeightage;
  const projectedDelta = projectedTotal - 100;
  const projectedMessage =
    projectedTotal === 100
      ? "This change balances the sheet at 100%."
      : projectedTotal > 100
        ? `After saving, reduce ${projectedDelta}% before submitting.`
        : `After saving, add ${Math.abs(projectedDelta)}% before submitting.`;

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Field label="Title" value={form.title} onChange={(value) => update("title", value)} required />
      <Field label="Description" value={form.description} onChange={(value) => update("description", value)} textarea />
      <SelectField label="Thrust area" value={form.thrustArea} values={thrustAreas} onChange={(value) => update("thrustArea", value)} />
      <div className="grid grid-cols-2 gap-2">
        <SelectField label="UOM" value={form.uomType} values={uomTypes} onChange={(value) => update("uomType", value)} />
        <SelectField label="Scoring" value={form.scoringType} values={scoringTypes} onChange={(value) => update("scoringType", value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Target" value={form.target} onChange={(value) => update("target", value)} required />
        <Field label="Weightage" value={form.weightage} onChange={(value) => update("weightage", value)} type="number" required />
      </div>
      <div className={`rounded-md border px-3 py-2 text-[12px] leading-5 ${
        projectedTotal === 100 ? "border-teal/30 bg-teal/10 text-sec" : "border-amber/40 bg-amber/10 text-sec"
      }`}>
        Projected total: <span className="font-medium text-pri">{projectedTotal}%</span>. {projectedMessage}
      </div>
      <button disabled={pending} className="h-9 rounded-md bg-teal text-[12px] font-medium text-[#0D0F12] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function AchievementForm({
  form,
  setForm,
  pending,
  onSubmit,
}: {
  form: typeof emptyAchievementForm;
  setForm: (form: typeof emptyAchievementForm) => void;
  pending: boolean;
  onSubmit: () => void;
}) {
  const update = (key: keyof typeof emptyAchievementForm, value: string) => setForm({ ...form, [key]: value });

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <SelectField label="Quarter" value={form.quarter} values={quarters} onChange={(value) => update("quarter", value)} />
        <SelectField label="Status" value={form.status} values={achievementStatuses} onChange={(value) => update("status", value)} />
      </div>
      <Field label="Actual" value={form.actual} onChange={(value) => update("actual", value)} required />
      <Field label="Remarks" value={form.employeeRemarks} onChange={(value) => update("employeeRemarks", value)} textarea />
      <button disabled={pending} className="h-9 rounded-md bg-teal text-[12px] font-medium text-[#0D0F12] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
        {pending ? "Updating..." : "Update achievement"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  textarea,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
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
        <input value={value} onChange={(event) => onChange(event.target.value)} type={type} required={required} className={className} />
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
