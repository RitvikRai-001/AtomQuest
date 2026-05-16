import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusPill, KpiCard, ProgressBar, SectionHeader } from "@/components/AtomQuestShell";
import { LineChart, BarRows, Donut, Heatmap, Stat } from "@/components/performanceCharts";
import { Shield, Download, Play, Pause, ChevronRight, Building2, Lock, Plus } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  return (
    <AppShell role="Admin" title="Governance console" breadcrumb="Acme Corp · FY26" primaryAction={{ label: "Open cycle", icon: Plus }}>
      <div className="grid grid-cols-5 gap-4">
        <KpiCard label="Active cycle" value="Q2 FY26" sub="Day 54 of 91 · 37 to close" />
        <KpiCard label="Org-wide completion" value="76.4%" delta="+4.2%" sub="312 goals across 14 depts" />
        <KpiCard label="Approval SLA met" value="96.2%" delta="+1.1%" sub="Target ≥ 95%" />
        <KpiCard label="Departments on track" value="11 / 14" sub="3 flagged for review" />
        <KpiCard label="Audit events / 24h" value="12,847" delta="+842" deltaTone="flat" sub="0 integrity violations" />
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* Cycle management */}
        <div className="col-span-5 card-soft p-4">
          <SectionHeader title="Cycle management" hint="Phases of the active performance cycle" action={
            <div className="flex gap-1.5">
              <button className="h-7 px-2.5 text-[11.5px] rounded-md hairline bg-surface text-sec flex items-center gap-1"><Pause className="h-3 w-3" />Pause</button>
              <button className="h-7 px-2.5 text-[11.5px] rounded-md bg-teal text-[#0D0F12] font-medium flex items-center gap-1"><Play className="h-3 w-3" />Advance</button>
            </div>
          } />

          <div className="space-y-3">
            {[
              { n: "01", t: "Goal setting",  s: "Closed",    d: "Apr 01 – Apr 14",  p: 100, k: "Completed" },
              { n: "02", t: "Approvals",     s: "Closed",    d: "Apr 12 – Apr 22",  p: 100, k: "Completed" },
              { n: "03", t: "Execution",     s: "Active",    d: "Apr 22 – Jun 30",  p: 58,  k: "On Track" },
              { n: "04", t: "Mid-quarter check-in", s: "Scheduled", d: "May 29",     p: 0,   k: "Draft" },
              { n: "05", t: "Calibration",   s: "Upcoming",  d: "Jul 08 – Jul 18",  p: 0,   k: "Draft" },
              { n: "06", t: "Cycle close",   s: "Upcoming",  d: "Jul 22",           p: 0,   k: "Draft" },
            ].map((p, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-3 p-2.5 rounded-md hairline bg-app-2">
                <div className="col-span-1 font-mono text-[11px] text-teal">{p.n}</div>
                <div className="col-span-4">
                  <div className="text-[12.5px] text-pri">{p.t}</div>
                  <div className="text-[10.5px] text-mut">{p.d}</div>
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <ProgressBar value={p.p} tone={p.s==="Active"?"teal":"success"} />
                  <span className="text-[11px] text-pri tabular-nums w-9">{p.p}%</span>
                </div>
                <div className="col-span-3 flex justify-end"><StatusPill kind={p.k as any} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Approval metrics + dept completion */}
        <div className="col-span-7 card-soft p-4">
          <SectionHeader title="Approval & completion metrics" hint="Across all 14 departments · Q2 FY26" action={
            <button className="h-7 px-2.5 text-[11.5px] rounded-md hairline bg-surface text-sec flex items-center gap-1"><Download className="h-3 w-3" />Export</button>
          } />
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-7 h-[220px]">
              <LineChart height={220} series={[
                { name: "Completion", color: "#4FD1C5", data: [22,32,42,48,55,62,70,76] },
                { name: "Approval SLA", color: "#A78BFA", data: [85,88,90,92,93,94,95,96] },
              ]} />
              <div className="mt-2 flex gap-4 text-[11px] text-mut">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-teal" />Completion %</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-violet" />Approval SLA %</span>
              </div>
            </div>
            <div className="col-span-5 flex flex-col items-center justify-center">
              <Donut size={150} label="76%" sub="org-wide" segments={[
                { value: 62, color: "#4FD1C5" },
                { value: 18, color: "#A78BFA" },
                { value: 12, color: "#F59E0B" },
                { value: 8,  color: "#F87171" },
              ]} />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-[10.5px]">
                <span className="text-sec flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-teal" />Approved</span>
                <span className="text-sec flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-violet" />Submitted</span>
                <span className="text-sec flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber" />Returned</span>
                <span className="text-sec flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-danger" />At-risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* Department completion */}
        <div className="col-span-5 card-soft p-4">
          <SectionHeader title="Department completion" hint="Weighted · vs. Q1 baseline" />
          <BarRows rows={[
            { label: "Engineering", value: 84, color: "#4FD1C5" },
            { label: "Product",     value: 78, color: "#4FD1C5" },
            { label: "Design",      value: 71, color: "#4FD1C5" },
            { label: "Marketing",   value: 66, color: "#A78BFA" },
            { label: "Sales",       value: 59, color: "#A78BFA" },
            { label: "Operations",  value: 52, color: "#F59E0B" },
            { label: "Finance",     value: 47, color: "#F59E0B" },
            { label: "Legal",       value: 44, color: "#F87171" },
          ]} />
        </div>

        {/* User hierarchy */}
        <div className="col-span-4 card-soft p-4">
          <SectionHeader title="User hierarchy" hint="2,418 active users · 14 depts" action={<button className="text-[11.5px] text-sec hover:text-pri flex items-center gap-1">Manage<ChevronRight className="h-3 w-3"/></button>} />
          <ul className="space-y-1.5 text-[12.5px]">
            {[
              { l: 0, n: "Acme Corp",          c: 2418, m: 14 },
              { l: 1, n: "Engineering",        c: 612,  m: 38 },
              { l: 2, n: "└ Platform",         c: 184,  m: 11 },
              { l: 2, n: "└ Product Eng",      c: 218,  m: 14 },
              { l: 2, n: "└ Infra & Security", c: 96,   m: 6 },
              { l: 1, n: "Product",            c: 142,  m: 9 },
              { l: 1, n: "Design",             c: 78,   m: 5 },
              { l: 1, n: "Marketing",          c: 124,  m: 7 },
              { l: 1, n: "Sales",              c: 432,  m: 26 },
            ].map((r,i)=>(
              <li key={i} className="flex items-center justify-between rounded-md hover:bg-elevated px-2 py-1.5" style={{ paddingLeft: `${8 + r.l * 14}px` }}>
                <div className="flex items-center gap-2 text-pri">
                  <Building2 className="h-3 w-3 text-mut" />
                  <span>{r.n}</span>
                </div>
                <div className="flex items-center gap-3 text-mut tabular-nums text-[11px]">
                  <span>{r.c.toLocaleString()} users</span>
                  <span>{r.m} managers</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Governance controls */}
        <div className="col-span-3 card-soft p-4">
          <SectionHeader title="Governance controls" hint="Policy enforcement" />
          <div className="space-y-3 text-[12.5px]">
            {[
              { l: "SSO required",          v: true,  d: "Okta · SAML 2.0" },
              { l: "SCIM provisioning",     v: true,  d: "Auto deprovision 24h" },
              { l: "Goal SMART validation", v: true,  d: "Block submit on fail" },
              { l: "Min. goals per IC",     v: true,  d: "3 minimum · 7 max" },
              { l: "Calibration variance",  v: true,  d: "Alert > 0.5σ" },
              { l: "Mass export",           v: false, d: "Admin approval req." },
            ].map((p,i)=>(
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="text-pri">{p.l}</div>
                  <div className="text-[10.5px] text-mut">{p.d}</div>
                </div>
                <div className={`h-5 w-9 rounded-full p-0.5 flex ${p.v?"bg-teal":"bg-[#2A3038]"}`}>
                  <span className={`h-4 w-4 rounded-full bg-app-2 transition ${p.v?"ml-auto":""}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit log + activity heatmap */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-8 card-soft">
          <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
            <div>
              <div className="text-[13.5px] font-semibold text-pri flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-teal" />Audit log</div>
              <div className="text-[11.5px] text-mut">Append-only · 12,847 events in last 24h · signed by HSM</div>
            </div>
            <div className="flex items-center gap-2">
              <input placeholder="Search actor, event, target…" className="h-7 w-[240px] rounded-md hairline bg-surface text-[11.5px] text-pri placeholder:text-mut px-2.5 focus:outline-none focus:ring-1 focus:ring-[#4FD1C5]/40" />
              <button className="h-7 px-2.5 text-[11.5px] rounded-md hairline bg-surface text-sec flex items-center gap-1"><Download className="h-3 w-3" />Export</button>
            </div>
          </div>
          <table className="w-full text-[12px] font-mono">
            <thead className="text-mut">
              <tr>
                <th className="text-left font-medium text-[10.5px] tracking-wider px-4 py-2 uppercase">Timestamp</th>
                <th className="text-left font-medium text-[10.5px] tracking-wider py-2 uppercase">Event</th>
                <th className="text-left font-medium text-[10.5px] tracking-wider py-2 uppercase">Actor</th>
                <th className="text-left font-medium text-[10.5px] tracking-wider py-2 uppercase">Target</th>
                <th className="text-right font-medium text-[10.5px] tracking-wider px-4 py-2 uppercase">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3038]">
              {[
                ["2026-05-16 10:24:11", "approval.granted",    "priya.r@acme.io",    "goal_3829 'p95 → 180ms'",    "a4f1…02e8"],
                ["2026-05-16 10:23:47", "goal.submitted",      "daniel.o@acme.io",   "goal_3829 v2",                "c91b…ff14"],
                ["2026-05-16 10:21:02", "cycle.phase.changed", "system",             "Q2-FY26 → execution",         "01ee…7733"],
                ["2026-05-16 10:18:55", "review.returned",     "maya.l@acme.io",     "goal_3811",                   "9d22…4451"],
                ["2026-05-16 10:15:31", "policy.flag",         "system",             "goal_3812 missing baseline",  "55a0…b8ce"],
                ["2026-05-16 10:12:08", "delegation.set",      "admin@acme.io",      "acting=jordan eng/platform",  "fa31…1a09"],
                ["2026-05-16 10:08:42", "user.scim.create",    "scim.okta",          "anya.v@acme.io",              "227c…d0e1"],
                ["2026-05-16 10:02:17", "export.requested",    "cfo@acme.io",        "report_q2_board_v3",          "718a…cc92"],
              ].map((r,i)=>(
                <tr key={i} className="hover:bg-elevated/60">
                  <td className="px-4 py-2 text-mut">{r[0]}</td>
                  <td className="py-2 text-teal">{r[1]}</td>
                  <td className="py-2 text-sec">{r[2]}</td>
                  <td className="py-2 text-pri">{r[3]}</td>
                  <td className="px-4 py-2 text-right text-mut">{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-4 space-y-4">
          <div className="card-soft p-4">
            <SectionHeader title="Activity intensity" hint="Approvals & edits · last 16 days × 7 hours" />
            <Heatmap rows={7} cols={16} />
            <div className="mt-3 flex items-center justify-between text-[11px] text-mut">
              <span>Less</span>
              <div className="flex gap-1">
                {[0.08, 0.18, 0.4, 0.7].map((a,i)=> <span key={i} className="h-2.5 w-3.5 rounded-[2px]" style={{ background: `rgba(79,209,197,${a})` }} />)}
              </div>
              <span>More</span>
            </div>
          </div>

          <div className="card-soft p-4">
            <SectionHeader title="Reporting widgets" hint="Pinned for executive review" />
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Time to approve · p50" value="1.6d" />
              <Stat label="Time to approve · p95" value="3.4d" />
              <Stat label="Return rate" value="11.2%" />
              <Stat label="Escalation rate" value={<span className="text-amber">2.1%</span>} />
              <Stat label="Calibration variance" value="0.18σ" />
              <Stat label="Audit integrity" value={<span className="text-success">100%</span>} />
            </div>
            <button className="mt-4 w-full h-9 rounded-md hairline bg-surface text-pri text-[12.5px] hover:bg-elevated flex items-center justify-center gap-2">
              <Lock className="h-3.5 w-3.5 text-teal" />Generate board packet
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
