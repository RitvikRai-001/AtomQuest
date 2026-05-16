import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Calendar,
  ChevronRight,
  CircleCheck,
  MessageSquare,
  Paperclip,
  Plus,
} from "lucide-react";
import { AppShell, KpiCard, ProgressBar, SectionHeader, StatusPill } from "@/components/AtomQuestShell";
import { Donut, Stat } from "@/components/performanceCharts";
import { getStoredToken, goalSheetApi } from "@/lib/api";
import { buildRows, formatDate, goalStats, sheetStatus } from "@/lib/employeeGoals";

export const Route = createFileRoute("/employee")({ component: Employee });

function Employee() {
  const navigate = useNavigate();
  const hasToken = Boolean(getStoredToken());
  const dashboardQuery = useQuery({
    queryKey: ["employee-goal-sheet"],
    queryFn: goalSheetApi.getMyGoalSheet,
    enabled: hasToken,
    retry: false,
  });

  const payload = (dashboardQuery.data as any)?.data;
  const goalSheet = payload?.goalSheet;
  const checkins = payload?.checkins || [];
  const rows = buildRows(payload);
  const { totalGoals, completedGoals, atRiskGoals, onTrackGoals, inReviewGoals, averageProgress } = goalStats(rows);

  const currentSheetStatus = goalSheet ? sheetStatus(goalSheet.status) : "Draft";
  const sheetSummary = goalSheet
    ? `Submitted ${formatDate(goalSheet.submittedAt)} · ${goalSheet.approvedAt ? `Approved ${formatDate(goalSheet.approvedAt)}` : "Awaiting approval"}`
    : hasToken
      ? "No goal sheet found for this employee"
      : "Demo mode · add employee JWT token for live data";

  const feedbackItems = checkins.length > 0
    ? checkins.map((item: any) => ({
        who: item.managerId?.fullname || "Manager",
        role: `${item.outcome} · ${item.quarter}`,
        time: formatDate(item.createdAt),
        body: item.comment,
      }))
    : goalSheet?.managerComment
      ? [
          {
            who: goalSheet.approvedBy?.fullname || "Manager",
            role: `${currentSheetStatus} · Goal sheet`,
            time: formatDate(goalSheet.updatedAt),
            body: goalSheet.managerComment,
          },
        ]
      : [];

  return (
    <AppShell role="Employee" title="My workspace" breadcrumb="Q2 FY26" primaryAction={{ label: "New goal", icon: Plus, onClick: () => navigate({ to: "/employee/goals" }) }}>
      {!hasToken && (
        <div className="mb-4 rounded-md border border-amber/40 bg-amber/10 px-4 py-3 text-[12.5px] text-sec">
          Employee backend integration is ready. Add an employee JWT token in localStorage as{" "}
          <span className="font-medium text-pri">atomquest_access_token</span> to load live goal data.
        </div>
      )}

      {dashboardQuery.isError && (
        <div className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-[12.5px] text-sec">
          {(dashboardQuery.error as Error).message}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Goal sheet" value={currentSheetStatus} delta={goalSheet ? "live" : "demo"} sub={sheetSummary} />
        <KpiCard label="Quarterly progress" value={`${averageProgress}%`} delta={averageProgress >= 70 ? "+6%" : "Needs focus"} sub="Latest achievement average" />
        <KpiCard label="Goals completed" value={`${completedGoals} / ${totalGoals}`} delta={`${inReviewGoals} in review`} deltaTone="flat" sub={`${atRiskGoals} at risk, ${onTrackGoals} on track`} />
        <KpiCard label="Manager feedback" value={String(feedbackItems.length)} delta={feedbackItems.length ? "live" : "none"} deltaTone="flat" sub="Check-in and sheet comments" />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="card-soft col-span-8">
          <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <div>
              <div className="text-[13.5px] font-semibold text-pri">Goal sheet · Q2 FY26</div>
              <div className="text-[11.5px] text-mut">
                {totalGoals} goals · weighted to performance objectives · {goalSheet ? "live from backend" : "demo mode"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-7 rounded-md hairline bg-surface px-2.5 text-[11.5px] text-sec hover:bg-elevated">Filter</button>
              <button className="h-7 rounded-md hairline bg-surface px-2.5 text-[11.5px] text-sec hover:bg-elevated">Sort</button>
              <button className="flex h-7 items-center gap-1 rounded-md bg-teal px-2.5 text-[11.5px] font-medium text-[#0D0F12]">
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>

          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-mut">
                <th className="px-4 py-2.5 text-left text-[10.5px] font-medium uppercase tracking-wider">Goal</th>
                <th className="py-2.5 text-left text-[10.5px] font-medium uppercase tracking-wider">Weight</th>
                <th className="py-2.5 text-left text-[10.5px] font-medium uppercase tracking-wider">Progress</th>
                <th className="py-2.5 text-left text-[10.5px] font-medium uppercase tracking-wider">Health</th>
                <th className="py-2.5 text-left text-[10.5px] font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-right text-[10.5px] font-medium uppercase tracking-wider">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3038]">
              {rows.map((row) => (
                <tr key={row.code} className="transition hover:bg-elevated/60">
                  <td className="px-4 py-3">
                    <div className="text-pri">{row.title}</div>
                    <div className="mt-0.5 text-[10.5px] text-mut">{row.code} · weighted</div>
                  </td>
                  <td className="py-3 tabular-nums text-sec">{row.weightage}%</td>
                  <td className="w-[160px] py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={row.progress} tone={row.health === "At Risk" ? "danger" : "teal"} />
                      <span className="w-8 text-[11.5px] tabular-nums text-pri">{row.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3"><StatusPill kind={row.health as any} /></td>
                  <td className="py-3"><StatusPill kind={row.status as any} /></td>
                  <td className="px-4 py-3 text-right tabular-nums text-sec">{row.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-4 space-y-4">
          <div className="card-soft p-4">
            <SectionHeader title="Goal health" hint="Across all active goals" />
            <div className="flex items-center justify-between">
              <Donut
                size={140}
                label={String(averageProgress)}
                sub="health score"
                segments={[
                  { value: onTrackGoals || 1, color: "#4FD1C5" },
                  { value: inReviewGoals || 1, color: "#A78BFA" },
                  { value: atRiskGoals || 1, color: "#F87171" },
                ]}
              />
              <div className="space-y-2.5 text-[12px]">
                <Legend label="On track" value={onTrackGoals} className="bg-teal" />
                <Legend label="In review" value={inReviewGoals} className="bg-violet" />
                <Legend label="At risk" value={atRiskGoals} className="bg-danger" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-subtle pt-3">
              <Stat label="Velocity" value={<span>+6%<span className="text-[11px] text-success"> ▲</span></span>} />
              <Stat label="Cycle day" value="54 / 91" />
              <Stat label="Pace" value={<span className={averageProgress >= 70 ? "text-success" : "text-amber"}>{averageProgress >= 70 ? "On" : "Watch"}</span>} />
            </div>
          </div>

          <div className="card-soft p-4">
            <SectionHeader title="Upcoming check-ins" hint="Next 14 days" action={<button className="flex items-center gap-1 text-[11.5px] text-sec hover:text-pri">View all<ChevronRight className="h-3 w-3" /></button>} />
            <div className="space-y-2.5">
              {[
                { d: "Mon", n: "27", t: "Weekly 1:1 with manager", k: "1:1" },
                { d: "Wed", n: "29", t: "Mid-quarter check-in", k: "Cycle" },
                { d: "Tue", n: "04", t: "Q2 review prep", k: "Review" },
              ].map((item) => (
                <div key={item.t} className="flex items-center gap-3 rounded-md p-2 transition hover:bg-elevated">
                  <div className="grid h-10 w-10 place-items-center rounded-md hairline bg-surface leading-tight">
                    <div className="text-[9px] uppercase text-mut">{item.d}</div>
                    <div className="text-[14px] font-semibold tabular-nums text-pri">{item.n}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] text-pri">{item.t}</div>
                    <div className="text-[10.5px] text-mut">{item.k}</div>
                  </div>
                  <Calendar className="h-3.5 w-3.5 text-mut" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="card-soft col-span-7 p-4">
          <SectionHeader title="Manager feedback" hint="Check-in comments from your manager" action={<button className="h-7 rounded-md hairline bg-surface px-2.5 text-[11.5px] text-sec hover:bg-elevated">Request</button>} />
          <div className="space-y-3">
            {feedbackItems.length > 0 ? feedbackItems.map((item, index) => (
              <div key={`${item.who}-${index}`} className="rounded-md hairline bg-app-2 p-3">
                <div className="mb-2 flex items-center gap-2.5">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-elevated text-[10px] font-medium text-teal">
                    {item.who.split(" ").map((part: string) => part[0]).join("").slice(0, 2)}
                  </div>
                  <div className="text-[12px] font-medium text-pri">{item.who}</div>
                  <div className="text-[10.5px] text-mut">{item.role}</div>
                  <div className="ml-auto text-[10.5px] tabular-nums text-mut">{item.time}</div>
                </div>
                <div className="text-[12.5px] leading-relaxed text-sec">{item.body}</div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-mut">
                  <button className="flex items-center gap-1 hover:text-pri"><MessageSquare className="h-3 w-3" />Reply</button>
                  <button className="flex items-center gap-1 hover:text-pri"><Paperclip className="h-3 w-3" />Attach evidence</button>
                </div>
              </div>
            )) : (
              <div className="rounded-md hairline bg-app-2 p-4 text-[12.5px] leading-6 text-sec">
                No manager feedback has been posted for this goal sheet yet.
              </div>
            )}
          </div>
        </div>

        <div className="card-soft col-span-5 p-4">
          <SectionHeader title="Activity" hint="Your goal timeline" />
          <ol className="relative ml-3 space-y-4 border-l border-subtle pt-1">
            {[
              { title: "Goal progress refreshed", sub: `${averageProgress}% average completion`, time: "Now", color: "#4FD1C5", icon: CircleCheck },
              { title: "Check-in comments synced", sub: `${checkins.length || 3} feedback items available`, time: "Today", color: "#A78BFA", icon: MessageSquare },
              { title: "Goal sheet status", sub: currentSheetStatus, time: goalSheet ? formatDate(goalSheet.updatedAt) : "Demo", color: "#7DD87D", icon: ArrowUpRight },
            ].map((event) => {
              const Icon = event.icon;
              return (
                <li key={event.title} className="relative pl-5">
                  <span className="absolute -left-[7px] top-1.5 grid h-3 w-3 place-items-center rounded-full border border-subtle bg-app">
                    <Icon className="h-2 w-2" style={{ color: event.color }} />
                  </span>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-[12.5px] text-pri">{event.title}</div>
                    <div className="text-[10.5px] tabular-nums text-mut">{event.time}</div>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-mut">{event.sub}</div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </AppShell>
  );
}

function Legend({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${className}`} />
      <span className="text-sec">{label}</span>
      <span className="ml-auto tabular-nums text-pri">{value}</span>
    </div>
  );
}
