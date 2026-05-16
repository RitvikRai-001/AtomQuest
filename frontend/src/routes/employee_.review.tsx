import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, Download, FileText, MessageSquare, TrendingUp } from "lucide-react";
import { AppShell, KpiCard, ProgressBar, SectionHeader, StatusPill } from "@/components/AtomQuestShell";
import { getStoredToken, goalSheetApi } from "@/lib/api";
import { buildRows, formatDate, goalStats, type GoalRow } from "@/lib/employeeGoals";

export const Route = createFileRoute("/employee_/review")({ component: EmployeeQuarterlyReview });

type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

const quarters: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];

function EmployeeQuarterlyReview() {
  const hasToken = Boolean(getStoredToken());
  const [quarter, setQuarter] = useState<Quarter>("Q1");

  const reviewQuery = useQuery({
    queryKey: ["employee-goal-sheet"],
    queryFn: goalSheetApi.getMyGoalSheet,
    enabled: hasToken,
    retry: false,
  });

  const payload = (reviewQuery.data as any)?.data;
  const rows = buildRows(payload);
  const stats = goalStats(rows);
  const achievements = payload?.achievements || [];
  const checkins = payload?.checkins || [];
  const goalSheet = payload?.goalSheet;

  const reportRows = useMemo(() => {
    return rows.map((goal) => {
      const achievement = getAchievement(goal.id, quarter, achievements);
      const managerNote = checkins.find((item: any) => {
        const goalId = typeof item.goalId === "string" ? item.goalId : item.goalId?._id;
        return goalId === goal.id && item.quarter === quarter;
      });

      return {
        goal,
        achievement,
        managerNote,
        score: Math.round(achievement?.progressScore || 0),
      };
    });
  }, [achievements, checkins, quarter, rows]);

  const updatedGoals = reportRows.filter((item) => item.achievement).length;
  const completedGoals = reportRows.filter((item) => item.achievement?.status === "Completed").length;
  const atRiskNotes = reportRows.filter((item) => item.managerNote?.outcome === "At Risk").length;
  const quarterProgress = reportRows.length
    ? Math.round(reportRows.reduce((sum, item) => sum + item.score, 0) / reportRows.length)
    : 0;
  const weightedProgress = reportRows.length
    ? Math.round(
        reportRows.reduce((sum, item) => sum + (item.score * item.goal.weightage) / 100, 0)
      )
    : 0;

  const readyForReview = updatedGoals === rows.length && rows.length > 0;
  const managerComments = reportRows.filter((item) => item.managerNote);

  return (
    <AppShell
      role="Employee"
      title="Quarterly review"
      breadcrumb="FY26"
      primaryAction={{ label: "Export report", icon: Download, onClick: () => window.print() }}
    >
      {!hasToken && (
        <div className="mb-4 rounded-md border border-amber/40 bg-amber/10 px-4 py-3 text-[12.5px] text-sec">
          Sign in as the employee account to load live quarterly review data.
        </div>
      )}

      {reviewQuery.isError && (
        <div className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-[12.5px] text-sec">
          {(reviewQuery.error as Error).message}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Quarter score" value={`${quarterProgress}%`} delta={quarterProgress >= 80 ? "Strong" : quarterProgress >= 50 ? "Watch" : "Needs focus"} deltaTone={quarterProgress >= 80 ? "up" : quarterProgress >= 50 ? "flat" : "down"} sub="Average tracking score" />
        <KpiCard label="Weighted score" value={`${weightedProgress}%`} delta={`${stats.totalWeightage}% weightage`} sub="Score adjusted by goal weight" />
        <KpiCard label="Updated goals" value={`${updatedGoals} / ${rows.length}`} delta={readyForReview ? "Complete" : "Pending"} deltaTone={readyForReview ? "up" : "flat"} sub="Actuals captured this quarter" />
        <KpiCard label="Manager signals" value={String(managerComments.length)} delta={atRiskNotes ? `${atRiskNotes} risk` : "Stable"} deltaTone={atRiskNotes ? "down" : "up"} sub="Check-in feedback received" />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <section className="card-soft col-span-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <div>
              <div className="text-[14px] font-semibold text-pri">Quarterly performance report</div>
              <div className="mt-0.5 text-[11.5px] text-mut">
                Planned targets, actual achievement, tracking score, employee remarks, and manager feedback.
              </div>
            </div>
            <div className="flex gap-2">
              {quarters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuarter(item)}
                  className={`h-8 rounded-md px-3 text-[12px] transition ${quarter === item ? "bg-teal text-[#0D0F12]" : "hairline bg-surface text-sec hover:bg-elevated hover:text-pri"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#2A3038]">
            {reportRows.map((item) => (
              <ReportGoalRow key={item.goal.id} item={item} />
            ))}
          </div>
        </section>

        <aside className="col-span-4 space-y-4">
          <section className="card-soft p-4">
            <SectionHeader title="Review readiness" hint={`Goal sheet is ${goalSheet?.status || "draft"}`} />
            <div className="space-y-3">
              <ReadinessRow label="Approved goal sheet" ok={goalSheet?.status === "locked" || goalSheet?.status === "approved"} value={goalSheet?.status || "draft"} />
              <ReadinessRow label="Quarter actuals" ok={updatedGoals === rows.length && rows.length > 0} value={`${updatedGoals}/${rows.length}`} />
              <ReadinessRow label="Manager comments" ok={managerComments.length > 0} value={`${managerComments.length}`} />
              <ReadinessRow label="Review packet" ok={readyForReview} value={readyForReview ? "Ready" : "Open"} />
            </div>
          </section>

          <section className="card-soft p-4">
            <SectionHeader title="Score mix" hint="Weighted by goal importance" />
            <div className="space-y-3">
              {reportRows.map((item) => (
                <div key={item.goal.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[11.5px]">
                    <span className="truncate text-sec">{item.goal.title}</span>
                    <span className="tabular-nums text-pri">{item.score}%</span>
                  </div>
                  <ProgressBar value={item.score} tone={item.score >= 80 ? "success" : item.score >= 50 ? "teal" : "danger"} />
                </div>
              ))}
            </div>
          </section>

          <section className="card-soft p-4">
            <SectionHeader title="Manager feedback" hint={`${quarter} comments`} />
            <div className="space-y-2.5">
              {managerComments.length > 0 ? (
                managerComments.map((item) => (
                  <div key={item.managerNote._id} className="rounded-md border border-subtle bg-app-2 p-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-teal" />
                      <span className="text-[12px] font-medium text-pri">{item.managerNote.outcome}</span>
                      <span className="ml-auto text-[10.5px] text-mut">{formatDate(item.managerNote.createdAt)}</span>
                    </div>
                    <p className="text-[11.5px] leading-5 text-sec">{item.managerNote.comment}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-subtle bg-app-2 p-4 text-[12px] leading-5 text-sec">
                  No manager feedback has been recorded for {quarter}.
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section className="card-soft mt-4 p-4">
        <SectionHeader title="Quarter summary" hint="Generated from live goal data" />
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard icon={TrendingUp} title="Progress" body={`${quarterProgress}% average score across ${rows.length} goals. ${weightedProgress}% after applying goal weightage.`} />
          <SummaryCard icon={CheckCircle2} title="Completion" body={`${completedGoals} goals marked completed and ${updatedGoals} goals updated with actual achievement for ${quarter}.`} />
          <SummaryCard icon={FileText} title="Evidence" body={`${managerComments.length} manager comments and ${reportRows.filter((item) => item.achievement?.employeeRemarks).length} employee remarks are available.`} />
        </div>
      </section>
    </AppShell>
  );
}

function ReportGoalRow({ item }: { item: { goal: GoalRow; achievement: any; managerNote: any; score: number } }) {
  return (
    <article className="grid grid-cols-[1.2fr_0.9fr_160px] gap-4 px-4 py-4">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[11px] font-medium text-teal">{item.goal.code}</span>
          <span className="text-[10.5px] uppercase tracking-wider text-mut">{item.goal.thrustArea}</span>
        </div>
        <div className="text-[13px] font-semibold leading-5 text-pri">{item.goal.title}</div>
        <p className="mt-1 text-[11.5px] leading-5 text-mut">{item.goal.description}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <MiniStat label="Weight" value={`${item.goal.weightage}%`} />
          <MiniStat label="Target" value={`${item.goal.target} ${item.goal.uomType}`} />
          <MiniStat label="Actual" value={item.achievement?.actual ? `${item.achievement.actual} ${item.goal.uomType}` : "Not updated"} />
        </div>
      </div>

      <div className="min-w-0 rounded-md border border-subtle bg-app-2 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-wider text-mut">Status</div>
          {item.achievement?.status ? <StatusPill kind={item.achievement.status === "Not Started" ? "Draft" : item.achievement.status} /> : <StatusPill kind="Draft" />}
        </div>
        <div className="text-[11.5px] leading-5 text-sec">
          {item.achievement?.employeeRemarks || "No employee remarks captured for this quarter."}
        </div>
        {item.managerNote && (
          <div className="mt-3 border-t border-subtle pt-3">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-mut">Manager note</div>
            <div className="text-[11.5px] leading-5 text-sec">{item.managerNote.comment}</div>
          </div>
        )}
      </div>

      <div className="rounded-md border border-subtle bg-surface p-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-mut">
          <BarChart3 className="h-3.5 w-3.5 text-teal" />
          Tracking score
        </div>
        <div className="mb-2 text-[30px] font-semibold tabular-nums text-pri">{item.score}%</div>
        <ProgressBar value={item.score} tone={item.score >= 80 ? "success" : item.score >= 50 ? "teal" : "danger"} />
        <div className="mt-3 text-[11px] leading-5 text-mut">
          {item.goal.scoringType} formula. Tracking only, not final rating.
        </div>
      </div>
    </article>
  );
}

function ReadinessRow({ label, ok, value }: { label: string; ok: boolean; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-app-2 px-3 py-2.5">
      <span className={`grid h-5 w-5 place-items-center rounded-full border ${ok ? "border-success text-success" : "border-amber text-amber"}`}>
        <CheckCircle2 className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 text-[12px] text-sec">{label}</span>
      <span className="text-[12px] tabular-nums text-pri">{value}</span>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="rounded-md border border-subtle bg-app-2 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-surface text-teal">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-[13px] font-semibold text-pri">{title}</div>
      </div>
      <p className="text-[12px] leading-5 text-sec">{body}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-subtle bg-surface px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-mut">{label}</div>
      <div className="mt-1 truncate text-[12px] font-medium text-pri">{value}</div>
    </div>
  );
}

function getAchievement(goalId: string, quarter: Quarter, achievements: any[]) {
  return achievements.find((achievement) => {
    const achievementGoalId = typeof achievement.goalId === "string" ? achievement.goalId : achievement.goalId?._id;
    return achievementGoalId === goalId && achievement.quarter === quarter;
  });
}
