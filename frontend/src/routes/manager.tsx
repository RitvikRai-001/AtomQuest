import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusPill, KpiCard, ProgressBar, SectionHeader } from "@/components/AtomQuestShell";
import { Sparkline, LineChart, BarRows, Donut, Stat } from "@/components/performanceCharts";
import { Check, X, MoreHorizontal, Plus, AlertTriangle, GitBranch } from "lucide-react";

export const Route = createFileRoute("/manager")({ component: Manager });

function Manager() {
  return (
    <AppShell role="Manager" title="Team operations" breadcrumb="Platform / EU" primaryAction={{ label: "Review queue" }}>
      <div className="grid grid-cols-5 gap-4">
        <KpiCard label="Pending approvals" value="14" delta="-3 today" deltaTone="up" sub="SLA 24h · 2 overdue" />
        <KpiCard label="Team progress" value="71%" delta="+5.2%" sub="Weighted across 12 ICs" />
        <KpiCard label="At-risk goals" value="6" delta="+1" deltaTone="down" sub="Across 4 teammates" />
        <KpiCard label="Shared goals" value="9" sub="3 cross-functional" />
        <KpiCard label="Calibration var." value="0.18σ" delta="within band" deltaTone="flat" sub="vs. dept benchmark" />
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* Approval queue */}
        <div className="col-span-12 card-soft overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-subtle">
            <div>
              <div className="text-[13.5px] font-semibold text-pri">Approval queue</div>
              <div className="text-[11.5px] text-mut">14 items · oldest 1d 4h · routed via Platform/EU policy</div>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex hairline bg-surface rounded-md p-0.5 overflow-hidden">
                {["All","Submitted","Returned","Escalated"].map((t,i)=>(
                  <button key={t} className={`h-6 px-2 text-[11px] rounded-[5px] ${i===0?"bg-elevated text-pri":"text-sec"}`}>{t}</button>
                ))}
              </div>
              <button className="h-7 px-2.5 text-[11.5px] rounded-md hairline bg-surface text-sec">Bulk action</button>
            </div>
          </div>

          <table className="w-full table-fixed text-[12.5px]">
            <colgroup>
              <col className="w-[170px]" />
              <col />
              <col className="w-[74px]" />
              <col className="w-[126px]" />
              <col className="w-[84px]" />
              <col className="w-[244px]" />
            </colgroup>
            <thead>
              <tr className="text-mut bg-app-2/40">
                <th className="text-left font-medium uppercase text-[10.5px] tracking-wider px-4 py-2.5">Owner</th>
                <th className="text-left font-medium uppercase text-[10.5px] tracking-wider py-2.5">Goal</th>
                <th className="text-left font-medium uppercase text-[10.5px] tracking-wider py-2.5">Weight</th>
                <th className="text-left font-medium uppercase text-[10.5px] tracking-wider py-2.5">Status</th>
                <th className="text-left font-medium uppercase text-[10.5px] tracking-wider py-2.5">Waiting</th>
                <th className="text-right font-medium uppercase text-[10.5px] tracking-wider px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3038]">
              {[
                { who: "Maya Lin",       role: "PM · Growth",    g: "Increase activation by 18% in EU", w: 25, s: "Submitted", t: "4m" },
                { who: "Daniel Okafor",  role: "SWE · Platform", g: "Cut p95 latency to 180ms",         w: 20, s: "Submitted", t: "12m" },
                { who: "Priya Raman",    role: "Ops · EU",       g: "Ship procurement Q2 SLA program",  w: 15, s: "Returned",  t: "1h" },
                { who: "Lee Sato",       role: "Design",         g: "Launch design system v3",          w: 20, s: "Submitted", t: "3h" },
                { who: "Jordan Park",    role: "SWE · Infra",    g: "Reduce on-call paging 20%",        w: 10, s: "Submitted", t: "6h" },
                { who: "Anya Volkov",    role: "Data",           g: "Migrate to dbt project v4",        w: 15, s: "Submitted", t: "1d" },
                { who: "Rafael Mendes",  role: "QA",             g: "Achieve 85% e2e flake-free runs",  w: 10, s: "Returned",  t: "1d 4h" },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-elevated/60 transition group">
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="h-6 w-6 shrink-0 rounded-full bg-elevated grid place-items-center text-[10px] text-teal font-medium">{r.who.split(" ").map(x=>x[0]).join("")}</div>
                      <div className="min-w-0">
                        <div className="truncate text-pri">{r.who}</div>
                        <div className="text-[10.5px] text-mut">{r.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sec truncate">{r.g}</td>
                  <td className="py-3 tabular-nums text-sec">{r.w}%</td>
                  <td className="py-3"><StatusPill kind={r.s as any} /></td>
                  <td className="py-3 text-mut tabular-nums">{r.t}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <button className="h-7 px-2.5 text-[11px] rounded-md bg-teal text-[#0D0F12] font-medium flex items-center gap-1"><Check className="h-3 w-3" />Approve</button>
                      <button className="h-7 px-2.5 text-[11px] rounded-md hairline bg-surface text-sec hover:bg-elevated flex items-center gap-1"><X className="h-3 w-3" />Return</button>
                      <button className="h-7 w-7 shrink-0 rounded-md hairline bg-surface grid place-items-center text-mut"><MoreHorizontal className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* At-risk goals */}
        <div className="col-span-12 card-soft p-4">
          <SectionHeader title="At-risk goals" hint="Mid-cycle drift detection" action={<button className="text-[11.5px] text-sec hover:text-pri">Escalate all</button>} />
          <div className="grid grid-cols-2 gap-3">
            {[
              { o: "Maya Lin",     g: "Activation +18% EU",         p: 28, b: 55 },
              { o: "Anya Volkov",  g: "dbt project v4 migration",   p: 32, b: 50 },
              { o: "Daniel Okafor",g: "Onboarding drop-off −12%",   p: 38, b: 60 },
              { o: "Rafael Mendes",g: "Flake-free e2e 85%",         p: 44, b: 60 },
              { o: "Lee Sato",     g: "Design system v3",           p: 51, b: 65 },
              { o: "Jordan Park",  g: "Reduce paging 20%",          p: 47, b: 58 },
            ].map((r,i)=>(
              <div key={i} className="p-2.5 rounded-md hairline bg-app-2">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex min-w-0 items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-danger" />
                    <span className="shrink-0 text-pri">{r.o}</span>
                    <span className="text-mut">·</span>
                    <span className="min-w-0 truncate text-sec">{r.g}</span>
                  </div>
                  <span className="text-[11px] text-danger tabular-nums">−{r.b - r.p}%</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ProgressBar value={r.p} tone="danger" />
                  <span className="text-[10.5px] text-mut tabular-nums w-16 text-right">{r.p}/{r.b}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* Team analytics */}
        <div className="col-span-7 card-soft p-4">
          <SectionHeader title="Team analytics" hint="Cycle velocity vs. baseline — last 8 weeks" action={
            <div className="flex gap-2 text-[11px] text-mut">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-teal" />FY26</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#7E827D]" />FY25</span>
            </div>
          } />
          <div className="h-[230px]">
            <LineChart height={230} series={[
              { name: "FY26", color: "#4FD1C5", data: [12,22,30,38,46,52,60,67] },
              { name: "FY25", color: "#7E827D", data: [10,18,24,30,36,40,46,52] },
            ]} />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-subtle">
            <Stat label="Approval rate" value={<span className="text-success">96%</span>} />
            <Stat label="Avg cycle" value="1.6d" />
            <Stat label="Return rate" value="11%" />
            <Stat label="Escalations" value="2" />
          </div>
        </div>

        {/* Department breakdown */}
        <div className="col-span-5 card-soft p-4">
          <SectionHeader title="Team completion" hint="Weighted progress per teammate" />
          <BarRows rows={[
            { label: "Maya Lin",      value: 78, color: "#4FD1C5" },
            { label: "Daniel Okafor", value: 84, color: "#4FD1C5" },
            { label: "Priya Raman",   value: 71, color: "#4FD1C5" },
            { label: "Lee Sato",      value: 66, color: "#A78BFA" },
            { label: "Jordan Park",   value: 58, color: "#A78BFA" },
            { label: "Anya Volkov",   value: 49, color: "#F59E0B" },
            { label: "Rafael Mendes", value: 41, color: "#F87171" },
          ]} />
        </div>
      </div>

      {/* Shared goals + quarterly review */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-7 card-soft p-4">
          <SectionHeader title="Shared goals" hint="Cross-functional accountability" action={<button className="h-7 px-2.5 text-[11.5px] rounded-md hairline bg-surface text-sec flex items-center gap-1"><Plus className="h-3 w-3" />New shared</button>} />
          <div className="space-y-2">
            {[
              { g: "Launch unified checkout · EU+APAC", t: ["Platform","Growth","Risk"],  p: 64, h: "On Track" },
              { g: "Customer health score v2 rollout",  t: ["Data","CS","Product"],       p: 48, h: "At Risk" },
              { g: "Q2 board reporting overhaul",       t: ["Finance","Analytics"],       p: 82, h: "On Track" },
              { g: "Compliance evidence automation",    t: ["Security","Platform"],       p: 31, h: "At Risk" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-md hairline bg-app-2 grid grid-cols-12 items-center gap-3">
                <div className="col-span-5">
                  <div className="text-[12.5px] text-pri flex items-center gap-2"><GitBranch className="h-3 w-3 text-violet" />{s.g}</div>
                  <div className="text-[10.5px] text-mut mt-0.5 flex flex-wrap gap-1">
                    {s.t.map(x=> <span key={x} className="pill">{x}</span>)}
                  </div>
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <ProgressBar value={s.p} tone={s.h === "At Risk" ? "danger" : "teal"} />
                  <span className="text-[11px] text-pri tabular-nums">{s.p}%</span>
                </div>
                <div className="col-span-2"><StatusPill kind={s.h as any} /></div>
                <div className="col-span-1 text-right">
                  <button className="h-6 w-6 rounded-md hairline bg-surface grid place-items-center text-mut"><MoreHorizontal className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-5 card-soft p-4">
          <SectionHeader title="Quarterly review" hint="Q2 FY26 · review window opens Jul 8" />
          <div className="flex items-center justify-between">
            <Donut size={130} label="9/12" sub="reviews drafted" segments={[
              { value: 9, color: "#4FD1C5" }, { value: 3, color: "#20252D" }
            ]} />
            <div className="space-y-2.5 text-[12px] flex-1 ml-4">
              {[
                { l: "Drafted", v: "9", c: "#4FD1C5" },
                { l: "Awaiting peer input", v: "5", c: "#A78BFA" },
                { l: "Calibration scheduled", v: "Jul 12", c: "#F4F1EA" },
                { l: "Sign-off due", v: "Jul 18", c: "#F59E0B" },
              ].map((x,i)=>(
                <div key={i} className="flex items-center justify-between border-b border-subtle pb-2 last:border-0">
                  <span className="text-sec">{x.l}</span>
                  <span className="tabular-nums" style={{ color: x.c }}>{x.v}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-4 w-full h-9 rounded-md bg-teal text-[#0D0F12] text-[12.5px] font-medium hover:opacity-90">Open review workspace</button>
        </div>
      </div>
    </AppShell>
  );
}
