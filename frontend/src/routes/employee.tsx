import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusPill, KpiCard, ProgressBar, SectionHeader } from "@/components/AtomQuestShell";
import { Sparkline, Donut, Stat } from "@/components/performanceCharts";
import { MessageSquare, Calendar, ChevronRight, Paperclip, CircleCheck, ArrowUpRight, Plus } from "lucide-react";

export const Route = createFileRoute("/employee")({ component: Employee });

function Employee() {
  return (
    <AppShell role="Employee" title="My workspace" breadcrumb="Q2 FY26" primaryAction={{ label: "New goal", icon: Plus }}>
      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Goal sheet" value="Approved" delta="v3" sub="Submitted Apr 12 · Approved Apr 14" />
        <KpiCard label="Quarterly progress" value="68%" delta="+6%" sub="On pace for Q2 close" />
        <KpiCard label="Goals completed" value="3 / 7" delta="2 in review" deltaTone="flat" sub="2 at risk, 2 on track" />
        <KpiCard label="Manager feedback" value="92" delta="+4" sub="Calibration index · last 30d" />
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* Goal sheet */}
        <div className="col-span-8 card-soft">
          <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
            <div>
              <div className="text-[13.5px] font-semibold text-pri">Goal sheet · Q2 FY26</div>
              <div className="text-[11.5px] text-mut">7 goals · weighted to OKR objectives · last edit 2h ago</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-7 px-2.5 text-[11.5px] rounded-md hairline bg-surface text-sec hover:bg-elevated">Filter</button>
              <button className="h-7 px-2.5 text-[11.5px] rounded-md hairline bg-surface text-sec hover:bg-elevated">Sort</button>
              <button className="h-7 px-2.5 text-[11.5px] rounded-md bg-teal text-[#0D0F12] font-medium flex items-center gap-1"><Plus className="h-3 w-3" />Add</button>
            </div>
          </div>

          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-mut">
                <th className="text-left font-medium uppercase text-[10.5px] tracking-wider px-4 py-2.5">Goal</th>
                <th className="text-left font-medium uppercase text-[10.5px] tracking-wider py-2.5">Weight</th>
                <th className="text-left font-medium uppercase text-[10.5px] tracking-wider py-2.5">Progress</th>
                <th className="text-left font-medium uppercase text-[10.5px] tracking-wider py-2.5">Health</th>
                <th className="text-left font-medium uppercase text-[10.5px] tracking-wider py-2.5">Status</th>
                <th className="text-right font-medium uppercase text-[10.5px] tracking-wider px-4 py-2.5">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3038]">
              {[
                { g: "Reduce p95 latency to 180ms in checkout", w: 25, p: 72, h: "On Track", s: "Approved", d: "Jun 28" },
                { g: "Ship merchant payouts redesign", w: 20, p: 88, h: "On Track", s: "Approved", d: "Jun 14" },
                { g: "Cut onboarding drop-off by 12%", w: 15, p: 42, h: "At Risk", s: "Approved", d: "Jul 02" },
                { g: "Lead three engineering interviews / mo", w: 10, p: 100, h: "On Track", s: "Completed", d: "Ongoing" },
                { g: "Publish 4 platform RFCs", w: 15, p: 50, h: "On Track", s: "Approved", d: "Jul 12" },
                { g: "Quarterly mentorship plan with 2 IC2 ENG", w: 10, p: 30, h: "At Risk", s: "Submitted", d: "Jun 30" },
                { g: "Reduce on-call paging volume 20%", w: 5, p: 55, h: "On Track", s: "Submitted", d: "Jul 22" },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-elevated/60 transition">
                  <td className="px-4 py-3">
                    <div className="text-pri">{r.g}</div>
                    <div className="text-[10.5px] text-mut mt-0.5">OKR-{200 + i} · weighted</div>
                  </td>
                  <td className="py-3 tabular-nums text-sec">{r.w}%</td>
                  <td className="py-3 w-[160px] pr-4">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={r.p} tone={r.h === "At Risk" ? "danger" : "teal"} />
                      <span className="text-pri tabular-nums text-[11.5px] w-8">{r.p}%</span>
                    </div>
                  </td>
                  <td className="py-3"><StatusPill kind={r.h as any} /></td>
                  <td className="py-3"><StatusPill kind={r.s as any} /></td>
                  <td className="px-4 py-3 text-right text-sec tabular-nums">{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Goal health & check-ins */}
        <div className="col-span-4 space-y-4">
          <div className="card-soft p-4">
            <SectionHeader title="Goal health" hint="Across all active goals" />
            <div className="flex items-center justify-between">
              <Donut size={140} label="74" sub="health score" segments={[
                { value: 4, color: "#4FD1C5" },
                { value: 2, color: "#A78BFA" },
                { value: 1, color: "#F87171" },
              ]} />
              <div className="space-y-2.5 text-[12px]">
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-teal" /><span className="text-sec">On track</span><span className="text-pri tabular-nums ml-auto">4</span></div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-violet" /><span className="text-sec">In review</span><span className="text-pri tabular-nums ml-auto">2</span></div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-danger" /><span className="text-sec">At risk</span><span className="text-pri tabular-nums ml-auto">1</span></div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-subtle grid grid-cols-3 gap-3">
              <Stat label="Velocity" value={<span>+6%<span className="text-success text-[11px]"> ▲</span></span>} />
              <Stat label="Cycle day" value="54 / 91" />
              <Stat label="Pace" value={<span className="text-success">On</span>} />
            </div>
          </div>

          <div className="card-soft p-4">
            <SectionHeader title="Upcoming check-ins" hint="Next 14 days" action={<button className="text-[11.5px] text-sec hover:text-pri flex items-center gap-1">View all<ChevronRight className="h-3 w-3"/></button>} />
            <div className="space-y-2.5">
              {[
                { d: "Mon", n: "27", t: "Weekly 1:1 — Priya Raman", k: "1:1" },
                { d: "Wed", n: "29", t: "Mid-quarter check-in", k: "Cycle" },
                { d: "Fri", n: "31", t: "Mentorship sync — Lee", k: "Mentor" },
                { d: "Tue", n: "04", t: "Q2 review prep", k: "Review" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-elevated transition">
                  <div className="h-10 w-10 rounded-md hairline bg-surface grid place-items-center leading-tight">
                    <div className="text-[9px] text-mut uppercase">{c.d}</div>
                    <div className="text-[14px] font-semibold text-pri tabular-nums">{c.n}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-pri truncate">{c.t}</div>
                    <div className="text-[10.5px] text-mut">{c.k}</div>
                  </div>
                  <Calendar className="h-3.5 w-3.5 text-mut" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback + activity */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-7 card-soft p-4">
          <SectionHeader title="Manager feedback" hint="Calibration notes from your direct manager" action={
            <button className="h-7 px-2.5 text-[11.5px] rounded-md hairline bg-surface text-sec hover:bg-elevated">Request</button>
          } />
          <div className="space-y-3">
            {[
              { who: "Priya Raman", role: "EM · Platform", time: "Yesterday", body: "Strong execution on the checkout latency goal — please attach the RUM evidence to the goal record before EoW so we can pre-stage the Q2 calibration packet." },
              { who: "Priya Raman", role: "EM · Platform", time: "3d ago",   body: "Onboarding drop-off goal is trending behind. Let's reset scope at our Wednesday 1:1 — happy to take on the second cohort experiment myself." },
              { who: "Lee Sato",   role: "Mentor · IC4",  time: "1w ago",  body: "Loved the platform RFC draft. Recommend tightening the rollback section before submitting goal #5 for approval." },
            ].map((f, i) => (
              <div key={i} className="p-3 rounded-md hairline bg-app-2">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-6 w-6 rounded-full bg-elevated grid place-items-center text-[10px] text-teal font-medium">{f.who.split(" ").map(x=>x[0]).join("")}</div>
                  <div className="text-[12px] text-pri font-medium">{f.who}</div>
                  <div className="text-[10.5px] text-mut">{f.role}</div>
                  <div className="text-[10.5px] text-mut ml-auto">{f.time}</div>
                </div>
                <div className="text-[12.5px] text-sec leading-relaxed">{f.body}</div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-mut">
                  <button className="flex items-center gap-1 hover:text-pri"><MessageSquare className="h-3 w-3" />Reply</button>
                  <button className="flex items-center gap-1 hover:text-pri"><Paperclip className="h-3 w-3" />Attach evidence</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-5 card-soft p-4">
          <SectionHeader title="Activity" hint="Your goal timeline" />
          <ol className="relative ml-3 border-l border-subtle space-y-4 pt-1">
            {[
              { t: "Goal #4 marked complete", s: "Lead three engineering interviews / mo", time: "10:24", c: "#7DD87D", i: CircleCheck },
              { t: "Check-in posted", s: "+ Evidence attached · checkout-latency-runbook.pdf", time: "09:51", c: "#4FD1C5", i: Paperclip },
              { t: "Feedback received", s: "Priya Raman — manager note", time: "Yesterday", c: "#A78BFA", i: MessageSquare },
              { t: "Goal #6 submitted", s: "Quarterly mentorship plan with 2 IC2 ENG", time: "Mon", c: "#A78BFA", i: ArrowUpRight },
              { t: "Goal sheet approved", s: "v3 · approved by Priya Raman", time: "Apr 14", c: "#7DD87D", i: CircleCheck },
            ].map((e, i) => {
              const I = e.i;
              return (
                <li key={i} className="pl-5 relative">
                  <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border border-subtle grid place-items-center bg-app">
                    <I className="h-2 w-2" style={{ color: e.c }} />
                  </span>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-[12.5px] text-pri">{e.t}</div>
                    <div className="text-[10.5px] text-mut tabular-nums">{e.time}</div>
                  </div>
                  <div className="text-[11.5px] text-mut mt-0.5">{e.s}</div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Quarterly progress chart */}
      <div className="card-soft p-4 mt-4">
        <SectionHeader title="Quarterly progress" hint="Weighted completion vs. cycle baseline · Q2 FY26" />
        <div className="grid grid-cols-12 gap-4">
          {["Apr w1","Apr w2","Apr w3","Apr w4","May w1","May w2","May w3","May w4","Jun w1","Jun w2","Jun w3","Jun w4"].map((w, i) => {
            const v = [8, 14, 22, 28, 34, 41, 48, 54, 60, 64, 68, 74][i];
            const bv = [10, 18, 25, 32, 38, 44, 50, 55, 60, 65, 70, 75][i];
            return (
              <div key={i} className="col-span-1 flex flex-col items-center gap-1">
                <div className="relative h-32 w-full flex items-end gap-0.5 justify-center">
                  <div className="w-2 rounded-sm bg-[#20252D]" style={{ height: `${bv}%` }} />
                  <div className="w-2 rounded-sm bg-teal" style={{ height: `${v}%` }} />
                </div>
                <div className="text-[9.5px] text-mut">{w}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-mut">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-teal" />Actual completion</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#20252D]" />Cycle baseline</span>
        </div>
      </div>
    </AppShell>
  );
}
