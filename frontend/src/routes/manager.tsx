import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Check, GitBranch, MoreHorizontal, Plus, X } from "lucide-react";
import { AppShell, KpiCard, ProgressBar, SectionHeader, StatusPill } from "@/components/AtomQuestShell";
import { BarRows, Donut, LineChart, Stat } from "@/components/performanceCharts";
import { getStoredToken, goalSheetApi } from "@/lib/api";

export const Route = createFileRoute("/manager")({ component: Manager });

function Manager() {
  const hasToken = Boolean(getStoredToken());
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const queueQuery = useQuery({
    queryKey: ["manager-approval-queue"],
    queryFn: goalSheetApi.getManagerApprovalQueue,
    enabled: hasToken,
    retry: false,
  });

  const queue = ((queueQuery.data as any)?.data || []) as any[];
  const submittedCount = queue.length;
  const totalGoals = queue.reduce((sum, item) => sum + (item.goalsCount || 0), 0);
  const overdueCount = queue.filter((item) => getWaitingHours(item.goalSheet?.submittedAt) >= 24).length;
  const oldestLabel = queue.length ? formatWaiting(queue[0]?.goalSheet?.submittedAt) : "none";

  const approveMutation = useMutation({
    mutationFn: (goalSheetId: string) =>
      goalSheetApi.approveGoalSheet(goalSheetId, { comment: "Approved from manager dashboard." }),
    onSuccess: async () => {
      setMessage("Goal sheet approved and locked.");
      await queryClient.invalidateQueries({ queryKey: ["manager-approval-queue"] });
    },
    onError: (error) => setMessage((error as Error).message),
  });

  const returnMutation = useMutation({
    mutationFn: ({ goalSheetId, comment }: { goalSheetId: string; comment: string }) =>
      goalSheetApi.returnGoalSheet(goalSheetId, comment),
    onSuccess: async () => {
      setMessage("Goal sheet returned for rework.");
      await queryClient.invalidateQueries({ queryKey: ["manager-approval-queue"] });
    },
    onError: (error) => setMessage((error as Error).message),
  });

  const returnSheet = (goalSheetId: string) => {
    const comment = window.prompt("Return comment for employee:");
    if (!comment?.trim()) return;
    returnMutation.mutate({ goalSheetId, comment: comment.trim() });
  };

  return (
    <AppShell role="Manager" title="Team operations" breadcrumb="Platform / EU" primaryAction={{ label: "Review queue" }}>
      {(queueQuery.isError || message || !hasToken) && (
        <div className={`mb-4 rounded-md border px-4 py-3 text-[12.5px] text-sec ${queueQuery.isError || !hasToken ? "border-danger/40 bg-danger/10" : "border-teal/40 bg-teal/10"}`}>
          {!hasToken ? "Sign in as manager to load the live approval queue." : queueQuery.isError ? (queueQuery.error as Error).message : message}
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        <KpiCard label="Pending approvals" value={String(submittedCount)} delta={queueQuery.isFetching ? "syncing" : "live"} deltaTone="flat" sub={`Oldest ${oldestLabel} · ${overdueCount} overdue`} />
        <KpiCard label="Goals awaiting review" value={String(totalGoals)} delta={`${submittedCount} sheets`} sub="Submitted by direct reports" />
        <KpiCard label="At-risk goals" value="6" delta="+1" deltaTone="down" sub="Across 4 teammates" />
        <KpiCard label="Shared goals" value="9" sub="3 cross-functional" />
        <KpiCard label="Calibration var." value="0.18σ" delta="within band" deltaTone="flat" sub="vs. dept benchmark" />
      </div>

      <section className="card-soft mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle px-4 py-3">
          <div>
            <div className="text-[13.5px] font-semibold text-pri">Approval queue</div>
            <div className="text-[11.5px] text-mut">{submittedCount} items · oldest {oldestLabel} · live from backend</div>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex overflow-hidden rounded-md hairline bg-surface p-0.5">
              {["All", "Submitted", "Returned", "Escalated"].map((tab, index) => (
                <button key={tab} className={`h-6 rounded-[5px] px-2 text-[11px] ${index === 0 ? "bg-elevated text-pri" : "text-sec"}`}>
                  {tab}
                </button>
              ))}
            </div>
            <button className="h-7 rounded-md hairline bg-surface px-2.5 text-[11.5px] text-sec">Bulk action</button>
          </div>
        </div>

        <table className="w-full table-fixed text-[12.5px]">
          <colgroup>
            <col className="w-[180px]" />
            <col />
            <col className="w-[82px]" />
            <col className="w-[126px]" />
            <col className="w-[88px]" />
            <col className="w-[250px]" />
          </colgroup>
          <thead>
            <tr className="bg-app-2/40 text-mut">
              <th className="px-4 py-2.5 text-left text-[10.5px] font-medium uppercase tracking-wider">Owner</th>
              <th className="py-2.5 text-left text-[10.5px] font-medium uppercase tracking-wider">Goal</th>
              <th className="py-2.5 text-left text-[10.5px] font-medium uppercase tracking-wider">Weight</th>
              <th className="py-2.5 text-left text-[10.5px] font-medium uppercase tracking-wider">Status</th>
              <th className="py-2.5 text-left text-[10.5px] font-medium uppercase tracking-wider">Waiting</th>
              <th className="px-4 py-2.5 text-right text-[10.5px] font-medium uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3038]">
            {queue.map((item) => {
              const sheet = item.goalSheet;
              const employee = sheet?.employeeId || {};
              const goals = item.goals || [];
              const primaryGoal = goals[0];
              return (
                <tr key={sheet._id} className="transition hover:bg-elevated/60">
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-elevated text-[10px] font-medium text-teal">
                        {initials(employee.fullname || employee.email || "DR")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-pri">{employee.fullname || "Direct report"}</div>
                        <div className="truncate text-[10.5px] text-mut">{employee.email || "Employee"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="truncate py-3 pr-4 text-sec">
                    {primaryGoal ? `${primaryGoal.title}${goals.length > 1 ? ` +${goals.length - 1} more` : ""}` : `${item.goalsCount} goals submitted`}
                  </td>
                  <td className="py-3 tabular-nums text-sec">{item.totalWeightage}%</td>
                  <td className="py-3"><StatusPill kind="Submitted" /></td>
                  <td className="py-3 tabular-nums text-mut">{formatWaiting(sheet.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <button disabled={approveMutation.isPending} onClick={() => approveMutation.mutate(sheet._id)} className="flex h-7 items-center gap-1 rounded-md bg-teal px-2.5 text-[11px] font-medium text-[#0D0F12] disabled:opacity-50">
                        <Check className="h-3 w-3" />Approve
                      </button>
                      <button disabled={returnMutation.isPending} onClick={() => returnSheet(sheet._id)} className="flex h-7 items-center gap-1 rounded-md hairline bg-surface px-2.5 text-[11px] text-sec hover:bg-elevated disabled:opacity-50">
                        <X className="h-3 w-3" />Return
                      </button>
                      <button className="grid h-7 w-7 shrink-0 place-items-center rounded-md hairline bg-surface text-mut">
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {queue.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[12.5px] text-sec">
                  No submitted goal sheets are waiting for manager approval.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card-soft mt-4 p-4">
        <SectionHeader title="At-risk goals" hint="Mid-cycle drift detection" action={<button className="text-[11.5px] text-sec hover:text-pri">Escalate all</button>} />
        <div className="grid grid-cols-2 gap-3">
          {[
            { o: "Maya Lin", g: "Activation +18% EU", p: 28, b: 55 },
            { o: "Anya Volkov", g: "dbt project v4 migration", p: 32, b: 50 },
            { o: "Daniel Okafor", g: "Onboarding drop-off -12%", p: 38, b: 60 },
            { o: "Rafael Mendes", g: "Flake-free e2e 85%", p: 44, b: 60 },
            { o: "Lee Sato", g: "Design system v3", p: 51, b: 65 },
            { o: "Jordan Park", g: "Reduce paging 20%", p: 47, b: 58 },
          ].map((item) => (
            <div key={`${item.o}-${item.g}`} className="rounded-md hairline bg-app-2 p-2.5">
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex min-w-0 items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-danger" />
                  <span className="shrink-0 text-pri">{item.o}</span>
                  <span className="text-mut">·</span>
                  <span className="min-w-0 truncate text-sec">{item.g}</span>
                </div>
                <span className="text-[11px] tabular-nums text-danger">-{item.b - item.p}%</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <ProgressBar value={item.p} tone="danger" />
                <span className="w-16 text-right text-[10.5px] tabular-nums text-mut">{item.p}/{item.b}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="card-soft col-span-7 p-4">
          <SectionHeader title="Team analytics" hint="Cycle velocity vs. baseline - last 8 weeks" />
          <div className="h-[230px]">
            <LineChart height={230} series={[
              { name: "FY26", color: "#4FD1C5", data: [12, 22, 30, 38, 46, 52, 60, 67] },
              { name: "FY25", color: "#7E827D", data: [10, 18, 24, 30, 36, 40, 46, 52] },
            ]} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3 border-t border-subtle pt-4">
            <Stat label="Approval rate" value={<span className="text-success">96%</span>} />
            <Stat label="Avg cycle" value="1.6d" />
            <Stat label="Return rate" value="11%" />
            <Stat label="Escalations" value="2" />
          </div>
        </div>

        <div className="card-soft col-span-5 p-4">
          <SectionHeader title="Team completion" hint="Weighted progress per teammate" />
          <BarRows rows={[
            { label: "Maya Lin", value: 78, color: "#4FD1C5" },
            { label: "Daniel Okafor", value: 84, color: "#4FD1C5" },
            { label: "Priya Raman", value: 71, color: "#4FD1C5" },
            { label: "Lee Sato", value: 66, color: "#A78BFA" },
            { label: "Jordan Park", value: 58, color: "#A78BFA" },
            { label: "Anya Volkov", value: 49, color: "#F59E0B" },
            { label: "Rafael Mendes", value: 41, color: "#F87171" },
          ]} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="card-soft col-span-7 p-4">
          <SectionHeader title="Shared goals" hint="Cross-functional accountability" action={<button className="flex h-7 items-center gap-1 rounded-md hairline bg-surface px-2.5 text-[11.5px] text-sec"><Plus className="h-3 w-3" />New shared</button>} />
          <div className="space-y-2">
            {[
              { g: "Launch unified checkout · EU+APAC", t: ["Platform", "Growth", "Risk"], p: 64, h: "On Track" },
              { g: "Customer health score v2 rollout", t: ["Data", "CS", "Product"], p: 48, h: "At Risk" },
              { g: "Q2 board reporting overhaul", t: ["Finance", "Analytics"], p: 82, h: "On Track" },
              { g: "Compliance evidence automation", t: ["Security", "Platform"], p: 31, h: "At Risk" },
            ].map((item) => (
              <div key={item.g} className="grid grid-cols-12 items-center gap-3 rounded-md hairline bg-app-2 p-3">
                <div className="col-span-5">
                  <div className="flex items-center gap-2 text-[12.5px] text-pri"><GitBranch className="h-3 w-3 text-violet" />{item.g}</div>
                  <div className="mt-0.5 flex flex-wrap gap-1 text-[10.5px] text-mut">
                    {item.t.map((tag) => <span key={tag} className="pill">{tag}</span>)}
                  </div>
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <ProgressBar value={item.p} tone={item.h === "At Risk" ? "danger" : "teal"} />
                  <span className="text-[11px] tabular-nums text-pri">{item.p}%</span>
                </div>
                <div className="col-span-2"><StatusPill kind={item.h as any} /></div>
                <div className="col-span-1 text-right">
                  <button className="grid h-6 w-6 place-items-center rounded-md hairline bg-surface text-mut"><MoreHorizontal className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-soft col-span-5 p-4">
          <SectionHeader title="Quarterly review" hint="Q2 FY26 · review window opens Jul 8" />
          <div className="flex items-center justify-between">
            <Donut size={130} label="9/12" sub="reviews drafted" segments={[{ value: 9, color: "#4FD1C5" }, { value: 3, color: "#20252D" }]} />
            <div className="ml-4 flex-1 space-y-2.5 text-[12px]">
              {[
                ["Drafted", "9"],
                ["Awaiting peer input", "5"],
                ["Calibration scheduled", "Jul 12"],
                ["Sign-off due", "Jul 18"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-subtle pb-2 last:border-0">
                  <span className="text-sec">{label}</span>
                  <span className="tabular-nums text-pri">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-4 h-9 w-full rounded-md bg-teal text-[12.5px] font-medium text-[#0D0F12] hover:opacity-90">Open review workspace</button>
        </div>
      </div>
    </AppShell>
  );
}

function initials(value: string) {
  return value
    .split(/[ @.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getWaitingHours(value?: string) {
  if (!value) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 36e5));
}

function formatWaiting(value?: string) {
  const hours = getWaitingHours(value);
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}
