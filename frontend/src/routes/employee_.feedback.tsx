import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, FileText, MessageSquare, Send, Sparkles } from "lucide-react";
import { AppShell, KpiCard, ProgressBar, SectionHeader } from "@/components/AtomQuestShell";
import { feedbackApi, getStoredToken, goalSheetApi } from "@/lib/api";
import { buildRows, formatDate, type GoalRow } from "@/lib/employeeGoals";

export const Route = createFileRoute("/employee_/feedback")({ component: EmployeeFeedback });

type OutcomeFilter = "All" | "On Track" | "Needs Support" | "At Risk";

const filters: OutcomeFilter[] = ["All", "On Track", "Needs Support", "At Risk"];

function EmployeeFeedback() {
  const hasToken = Boolean(getStoredToken());
  const [filter, setFilter] = useState<OutcomeFilter>("All");
  const [message, setMessage] = useState("");

  const feedbackQuery = useQuery({
    queryKey: ["employee-goal-sheet"],
    queryFn: goalSheetApi.getMyGoalSheet,
    enabled: hasToken,
    retry: false,
  });

  const payload = (feedbackQuery.data as any)?.data;
  const rows = buildRows(payload);
  const checkins = payload?.checkins || [];
  const goalSheet = payload?.goalSheet;
  const managerComment = goalSheet?.managerComment;

  const feedbackItems = useMemo(() => {
    return checkins
      .map((item: any) => {
        const goalId = typeof item.goalId === "string" ? item.goalId : item.goalId?._id;
        const goal = rows.find((row) => row.id === goalId);

        return {
          id: item._id,
          quarter: item.quarter,
          outcome: item.outcome as OutcomeFilter,
          comment: item.comment,
          createdAt: item.createdAt,
          managerName: item.managerId?.fullname || "Manager",
          managerEmail: item.managerId?.email || "",
          goal,
        };
      })
      .filter((item: any) => filter === "All" || item.outcome === filter);
  }, [checkins, filter, rows]);

  const totalFeedback = checkins.length + (managerComment ? 1 : 0);
  const needsSupport = checkins.filter((item: any) => item.outcome === "Needs Support").length;
  const atRisk = checkins.filter((item: any) => item.outcome === "At Risk").length;
  const onTrack = checkins.filter((item: any) => item.outcome === "On Track").length;
  const supportLoad = checkins.length ? Math.round(((needsSupport + atRisk) / checkins.length) * 100) : 0;

  const requestMutation = useMutation({
    mutationFn: () => feedbackApi.requestFeedback("Please review my latest goal progress and share feedback for the current quarter."),
    onSuccess: (response: any) => {
      const managerName = response.data?.manager?.fullname || "your manager";
      setMessage(`Feedback request sent to ${managerName}.`);
    },
    onError: (error) => setMessage((error as Error).message),
  });

  return (
    <AppShell
      role="Employee"
      title="Feedback"
      breadcrumb="FY26"
      primaryAction={{
        label: requestMutation.isPending ? "Sending..." : "Request feedback",
        icon: Send,
        onClick: () => requestMutation.mutate(),
      }}
    >
      {!hasToken && (
        <div className="mb-4 rounded-md border border-amber/40 bg-amber/10 px-4 py-3 text-[12.5px] text-sec">
          Sign in as the employee account to load live manager feedback.
        </div>
      )}

      {feedbackQuery.isError && (
        <div className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-[12.5px] text-sec">
          {(feedbackQuery.error as Error).message}
        </div>
      )}

      {message && (
        <div className={`mb-4 rounded-md border px-4 py-3 text-[12.5px] text-sec ${requestMutation.isError ? "border-danger/40 bg-danger/10" : "border-teal/40 bg-teal/10"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Feedback items" value={String(totalFeedback)} delta="Live" sub="Sheet notes and check-in comments" />
        <KpiCard label="On track" value={String(onTrack)} delta={onTrack ? "Positive" : "None"} sub="Manager-confirmed progress" />
        <KpiCard label="Needs attention" value={String(needsSupport + atRisk)} delta={atRisk ? `${atRisk} at risk` : "Supported"} deltaTone={atRisk ? "down" : "flat"} sub="Follow-up themes to close" />
        <KpiCard label="Support load" value={`${supportLoad}%`} delta={supportLoad > 40 ? "Focus" : "Healthy"} deltaTone={supportLoad > 40 ? "down" : "up"} sub="Needs support plus at-risk share" />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <section className="card-soft col-span-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <SectionHeader title="Manager feedback" hint="Goal-linked check-in comments from your manager" />
            <div className="flex gap-2">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`h-8 rounded-md px-3 text-[12px] transition ${
                    filter === item ? "bg-teal text-[#0D0F12]" : "hairline bg-surface text-sec hover:bg-elevated hover:text-pri"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {managerComment && (
            <div className="border-b border-subtle bg-teal/10 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-teal/15 text-teal">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-pri">Sheet-level note</div>
                  <p className="mt-1 text-[12.5px] leading-6 text-sec">{managerComment}</p>
                  <div className="mt-2 text-[11px] text-mut">Goal sheet status: {goalSheet?.status || "draft"}</div>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y divide-[#2A3038]">
            {feedbackItems.length > 0 ? (
              feedbackItems.map((item: any) => <FeedbackRow key={item.id} item={item} />)
            ) : (
              <div className="p-6 text-[12.5px] leading-6 text-sec">
                No feedback matches this filter yet. Manager check-in comments will appear here after quarterly discussions are recorded.
              </div>
            )}
          </div>
        </section>

        <aside className="col-span-4 space-y-4">
          <section className="card-soft p-4">
            <SectionHeader title="Feedback health" hint="Across posted comments" />
            <div className="space-y-3">
              <OutcomeMeter label="On track" value={onTrack} total={checkins.length} tone="success" />
              <OutcomeMeter label="Needs support" value={needsSupport} total={checkins.length} tone="amber" />
              <OutcomeMeter label="At risk" value={atRisk} total={checkins.length} tone="danger" />
            </div>
          </section>

          <section className="card-soft p-4">
            <SectionHeader title="Focus plan" hint="What to do next" />
            <div className="space-y-2.5">
              <FocusItem icon={MessageSquare} title="Review manager notes" body="Read each goal-linked comment before updating the next achievement." />
              <FocusItem icon={AlertTriangle} title="Close risk themes" body="Treat at-risk and needs-support comments as the highest-priority follow-ups." />
              <FocusItem icon={CheckCircle2} title="Carry positives forward" body="Use on-track feedback as evidence for what is already working." />
            </div>
          </section>

          <section className="card-soft p-4">
            <SectionHeader title="Recent themes" hint="Detected from live comments" />
            <div className="flex flex-wrap gap-2">
              {buildThemes(checkins).map((theme) => (
                <span key={theme} className="rounded-md border border-subtle bg-surface px-2.5 py-1 text-[11.5px] text-sec">
                  {theme}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function FeedbackRow({ item }: { item: any }) {
  const goal: GoalRow | undefined = item.goal;
  const tone = outcomeTone(item.outcome);

  return (
    <article className="grid grid-cols-[1fr_150px] gap-4 px-4 py-4">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <OutcomeBadge outcome={item.outcome} />
          <span className="text-[11px] text-mut">{item.quarter}</span>
          <span className="text-[11px] text-mut">by {item.managerName}</span>
          <span className="ml-auto text-[11px] text-mut">{formatDate(item.createdAt)}</span>
        </div>
        <div className="text-[13.5px] font-semibold text-pri">{goal?.title || "Goal feedback"}</div>
        <p className="mt-1 text-[12.5px] leading-6 text-sec">{item.comment}</p>
        {goal && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniStat label="Weight" value={`${goal.weightage}%`} />
            <MiniStat label="Target" value={`${goal.target} ${goal.uomType}`} />
            <MiniStat label="Score" value={`${goal.progress}%`} />
          </div>
        )}
      </div>

      <div className="rounded-md border border-subtle bg-app-2 p-3">
        <div className="mb-2 text-[10px] uppercase tracking-wider text-mut">Goal progress</div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[24px] font-semibold tabular-nums text-pri">{goal?.progress || 0}%</span>
          <span className="text-[11px]" style={{ color: tone }}>{item.outcome}</span>
        </div>
        <ProgressBar value={goal?.progress || 0} tone={item.outcome === "At Risk" ? "danger" : item.outcome === "Needs Support" ? "amber" : "success"} />
      </div>
    </article>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const color = outcomeTone(outcome);
  return (
    <span className="pill" style={{ color }}>
      <span className="pill-dot" style={{ background: color }} />
      {outcome}
    </span>
  );
}

function OutcomeMeter({ label, value, total, tone }: { label: string; value: number; total: number; tone: "success" | "amber" | "danger" }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="text-sec">{label}</span>
        <span className="tabular-nums text-pri">{value}</span>
      </div>
      <ProgressBar value={pct} tone={tone} />
    </div>
  );
}

function FocusItem({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-subtle bg-app-2 p-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface text-teal">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[12.5px] font-medium text-pri">{title}</div>
        <div className="mt-0.5 text-[11.5px] leading-5 text-mut">{body}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-subtle bg-app-2 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-mut">{label}</div>
      <div className="mt-1 truncate text-[12px] font-medium text-pri">{value}</div>
    </div>
  );
}

function outcomeTone(outcome: string) {
  if (outcome === "At Risk") return "#F87171";
  if (outcome === "Needs Support") return "#F59E0B";
  return "#7DD87D";
}

function buildThemes(checkins: any[]) {
  if (!checkins.length) return ["No themes yet"];

  const themes = new Set<string>();
  checkins.forEach((item) => {
    const text = `${item.comment} ${item.outcome}`.toLowerCase();
    if (text.includes("risk") || text.includes("behind")) themes.add("Risk closure");
    if (text.includes("support") || text.includes("blocker")) themes.add("Manager support");
    if (text.includes("conversion") || text.includes("pipeline")) themes.add("Pipeline conversion");
    if (text.includes("onboarding")) themes.add("Onboarding");
    if (text.includes("escalation")) themes.add("Escalations");
  });

  return Array.from(themes).slice(0, 6);
}
