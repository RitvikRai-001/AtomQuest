import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, ChevronRight, Shield, GitBranch, Activity, Sparkles, Users, BarChart3, Layers, Lock } from "lucide-react";
import { Sparkline, LineChart, Donut, BarRows } from "@/components/performanceCharts";

export const Route = createFileRoute("/")({ component: Landing });

function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2.2" fill="#4FD1C5"/>
      <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#4FD1C5" strokeOpacity="0.8" strokeWidth="1.2"/>
      <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#A78BFA" strokeOpacity="0.5" strokeWidth="1.2" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#F4F1EA" strokeOpacity="0.35" strokeWidth="1.2" transform="rotate(-60 12 12)"/>
    </svg>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-[#0D0F12]/70 border-b border-subtle">
      <div className="max-w-[1280px] mx-auto h-14 px-6 flex items-center">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[13px] font-semibold tracking-[0.18em] text-pri">ATOMQUEST</span>
          <span className="ml-2 pill"><span className="pill-dot bg-teal" />v4.2 · GA</span>
        </div>
        <nav className="hidden md:flex items-center gap-7 ml-10 text-[13px] text-sec">
          <a className="hover:text-pri">Platform</a>
          <a className="hover:text-pri">Workflows</a>
          <a className="hover:text-pri">Analytics</a>
          <a className="hover:text-pri">Governance</a>
          <a className="hover:text-pri">Customers</a>
          <a className="hover:text-pri">Docs</a>
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <Link to="/login" className="text-[13px] text-sec hover:text-pri">Sign in</Link>
          <Link to="/login" className="h-8 px-3 rounded-md bg-teal text-[#0D0F12] text-[12.5px] font-medium flex items-center gap-1.5 hover:opacity-90">
            Open workspace <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative radial-glow">
      <div className="absolute inset-0 grid-bg opacity-[0.5] pointer-events-none" />
      <div className="relative max-w-[1280px] mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-12 gap-10 items-start">
          <div className="col-span-12 lg:col-span-5">
            <div className="pill mb-5"><span className="pill-dot bg-violet" />Q2 FY26 · Cycle now open</div>
            <h1 className="text-[44px] leading-[1.05] tracking-tight font-semibold text-pri">
              The operating system for <span className="text-teal">goal execution</span> across the enterprise.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-sec max-w-[480px]">
              ATOMQUEST unifies goal-setting, approvals, quarterly tracking and performance visibility into a single auditable system — built for finance-grade governance and modern team velocity.
            </p>
            <div className="mt-7 flex items-center gap-3">
              <Link to="/login" className="h-10 px-4 rounded-md bg-teal text-[#0D0F12] text-[13px] font-medium flex items-center gap-2 hover:opacity-90">
                Launch dashboard <ChevronRight className="h-4 w-4" />
              </Link>
              <a className="h-10 px-4 rounded-md hairline bg-surface text-pri text-[13px] font-medium flex items-center gap-2 hover:bg-elevated">
                Book a walkthrough
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-[460px]">
              {[
                { k: "98.6%", v: "Goal coverage" },
                { k: "<24h", v: "Approval cycle" },
                { k: "SOC 2", v: "Type II audited" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-[20px] font-semibold text-pri tabular-nums">{s.k}</div>
                  <div className="text-[11.5px] text-mut mt-0.5">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7">
            <DashboardPreview />
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-subtle">
          <div className="label-eyebrow mb-4">Trusted by performance teams at</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center">
            {["NORTHWIND", "ATLAS-IO", "CIRRUS", "MERIDIAN", "BLACKBIRD", "HELIOS"].map((n, i) => (
              <div key={i} className="text-[12px] tracking-[0.22em] text-mut hover:text-sec text-center">{n}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-[#4FD1C5]/10 via-transparent to-[#A78BFA]/10 blur-2xl pointer-events-none" />
      <div className="relative rounded-xl border border-subtle bg-app-2 overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
        {/* fake topbar */}
        <div className="h-9 border-b border-subtle flex items-center px-3 gap-1.5 bg-app-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2A3038]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2A3038]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2A3038]" />
          </div>
          <div className="mx-auto text-[11px] text-mut">atomquest.io / workspace / acme</div>
        </div>

        <div className="grid grid-cols-12">
          {/* mini sidebar */}
          <div className="col-span-3 border-r border-subtle p-3 bg-app-2 hidden sm:block">
            <div className="text-[10.5px] text-mut uppercase tracking-wider mb-2 px-1.5">Workspace</div>
            {["Dashboard","Goals","Approvals","Team","Analytics"].map((l,i)=>(
              <div key={i} className={`text-[12px] px-2 py-1.5 rounded-md mb-0.5 ${i===0?"bg-elevated text-pri":"text-sec"}`}>{l}</div>
            ))}
            <div className="text-[10.5px] text-mut uppercase tracking-wider mb-2 px-1.5 mt-4">Governance</div>
            {["Cycles","Audit","Reports"].map((l,i)=>(
              <div key={i} className="text-[12px] px-2 py-1.5 rounded-md mb-0.5 text-sec">{l}</div>
            ))}
          </div>

          {/* content */}
          <div className="col-span-12 sm:col-span-9 p-4 bg-app">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[12.5px] font-semibold text-pri">Q2 Performance Overview</div>
                <div className="text-[10.5px] text-mut">Updated 4 min ago · 312 goals · 14 departments</div>
              </div>
              <div className="flex gap-1.5">
                <span className="pill">All cycles</span>
                <span className="pill"><span className="pill-dot bg-teal" />Live</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[
                { k: "Goal completion", v: "76%", d: "+4.2", tone: "#7DD87D", spark: [40,52,48,56,61,63,72,76] },
                { k: "Pending approvals", v: "18", d: "-6", tone: "#F59E0B", spark: [32,28,30,22,20,24,19,18] },
                { k: "At-risk goals", v: "11", d: "+2", tone: "#F87171", spark: [6,7,8,7,9,8,10,11] },
                { k: "Avg cycle time", v: "1.8d", d: "-0.3", tone: "#A78BFA", spark: [3.1,2.8,2.5,2.4,2.2,2.0,1.9,1.8] },
              ].map((c,i)=>(
                <div key={i} className="rounded-lg hairline bg-surface p-2.5">
                  <div className="text-[9.5px] text-mut uppercase tracking-wider">{c.k}</div>
                  <div className="flex items-end justify-between mt-1">
                    <div className="text-[16px] font-semibold text-pri tabular-nums">{c.v}</div>
                    <div className="text-[10px]" style={{ color: c.tone }}>{c.d}</div>
                  </div>
                  <div className="mt-1.5"><Sparkline data={c.spark} color={c.tone} width={110} height={22} /></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-2.5">
              <div className="col-span-2 rounded-lg hairline bg-surface p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-medium text-pri">Quarterly completion velocity</div>
                  <div className="flex gap-2 text-[10px] text-mut">
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-teal" />Approved</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-violet" />Submitted</span>
                  </div>
                </div>
                <div className="h-[150px]">
                  <LineChart series={[
                    { name: "Approved", color: "#4FD1C5", data: [22,38,46,55,61,70,74,78] },
                    { name: "Submitted", color: "#A78BFA", data: [40,52,58,62,66,71,75,80] },
                  ]} height={150} />
                </div>
              </div>
              <div className="rounded-lg hairline bg-surface p-3 flex flex-col items-center">
                <div className="text-[11px] font-medium text-pri self-start mb-1">Goal status</div>
                <Donut size={110} label="312" sub="total goals" segments={[
                  { value: 62, color: "#4FD1C5" },
                  { value: 18, color: "#A78BFA" },
                  { value: 12, color: "#F59E0B" },
                  { value: 8, color: "#F87171" },
                ]} />
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10.5px] self-start">
                  <span className="text-sec flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-teal" />Approved 62%</span>
                  <span className="text-sec flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-violet" />Submitted 18%</span>
                  <span className="text-sec flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber" />Returned 12%</span>
                  <span className="text-sec flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-danger" />At-risk 8%</span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 rounded-lg hairline bg-surface">
              <div className="flex items-center justify-between px-3 py-2 border-b border-subtle">
                <div className="text-[11px] font-medium text-pri">Approval queue</div>
                <div className="text-[10px] text-mut">8 waiting · SLA 24h</div>
              </div>
              <div className="divide-y divide-[#2A3038]">
                {[
                  { who: "Maya Lin", role: "PM · Growth", goal: "Increase activation 18%", status: "Submitted", time: "4m" },
                  { who: "Daniel Okafor", role: "Eng · Platform", goal: "Cut p95 latency to 180ms", status: "Submitted", time: "12m" },
                  { who: "Priya Raman", role: "Ops · EU", goal: "Ship procurement Q2 SLA", status: "Returned", time: "1h" },
                ].map((r,i)=>(
                  <div key={i} className="grid grid-cols-12 items-center px-3 py-2 text-[11.5px]">
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-elevated grid place-items-center text-[9px] text-teal font-medium">{r.who.split(" ").map(x=>x[0]).join("")}</div>
                      <div className="leading-tight">
                        <div className="text-pri">{r.who}</div>
                        <div className="text-mut text-[10px]">{r.role}</div>
                      </div>
                    </div>
                    <div className="col-span-5 text-sec truncate">{r.goal}</div>
                    <div className="col-span-2">
                      <span className="pill" style={{ color: r.status === "Submitted" ? "#A78BFA" : "#F59E0B" }}>
                        <span className="pill-dot" style={{ background: r.status === "Submitted" ? "#A78BFA" : "#F59E0B" }} />{r.status}
                      </span>
                    </div>
                    <div className="col-span-1 text-right text-mut">{r.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleWorkflow() {
  const roles = [
    { name: "Employee", desc: "Draft goals, post check-ins, track quarterly progress and request feedback.", to: "/employee", icon: Users, color: "#4FD1C5" },
    { name: "Manager", desc: "Review approvals, monitor at-risk goals, run quarterly reviews across the team.", to: "/manager", icon: Activity, color: "#A78BFA" },
    { name: "Admin", desc: "Configure cycles, enforce governance and audit the entire performance system.", to: "/admin", icon: Shield, color: "#F59E0B" },
  ];
  return (
    <section className="border-t border-subtle bg-app-2">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid grid-cols-12 gap-10 items-end mb-10">
          <div className="col-span-12 lg:col-span-7">
            <div className="label-eyebrow">Role-based workflows</div>
            <h2 className="mt-3 text-[32px] tracking-tight font-semibold text-pri leading-tight">
              One platform. Three operating modes — engineered for the people who run them.
            </h2>
          </div>
          <p className="col-span-12 lg:col-span-5 text-[14px] text-sec leading-relaxed">
            Every role gets a calm, dedicated surface — without losing the shared audit trail, hierarchy and reporting that finance and HR teams depend on.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r, i) => {
            const I = r.icon;
            return (
              <Link to={r.to} key={i} className="group card-soft p-5 hover:bg-elevated transition relative overflow-hidden">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 group-hover:opacity-100 transition" style={{ background: `radial-gradient(circle, ${r.color}22 0%, transparent 70%)` }} />
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-md hairline bg-elevated grid place-items-center"><I className="h-4 w-4" style={{ color: r.color }} /></div>
                  <ArrowUpRight className="h-4 w-4 text-mut group-hover:text-pri" />
                </div>
                <div className="mt-5 text-[16px] font-semibold text-pri">{r.name}</div>
                <p className="mt-1.5 text-[13px] text-sec leading-relaxed">{r.desc}</p>
                <div className="mt-5 pt-4 border-t border-subtle flex items-center justify-between text-[11px] text-mut">
                  <span>Open dashboard</span>
                  <span className="text-pri">{r.name.toLowerCase()}.atomquest</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Lifecycle() {
  const steps = [
    { k: "01", t: "Draft", d: "Author goals against company OKRs with templates, baselines and target ranges." },
    { k: "02", t: "Submit", d: "Route to the right approver chain with policy-aware checks before submission." },
    { k: "03", t: "Approve", d: "Managers approve, return or escalate — every decision logged immutably." },
    { k: "04", t: "Execute", d: "Quarterly check-ins, evidence attachments and live health scoring." },
    { k: "05", t: "Review", d: "Quarter-close calibration with reviewer notes and final score." },
    { k: "06", t: "Close", d: "Sealed performance record exported to HRIS and the audit warehouse." },
  ];
  return (
    <section className="border-t border-subtle">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="label-eyebrow">Goal lifecycle</div>
            <h2 className="mt-3 text-[28px] font-semibold text-pri tracking-tight">A single, auditable path from draft to close.</h2>
          </div>
          <a className="text-[13px] text-sec hover:text-pri flex items-center gap-1">View lifecycle docs <ArrowUpRight className="h-3.5 w-3.5" /></a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#2A3038] rounded-xl overflow-hidden border border-subtle">
          {steps.map((s, i) => (
            <div key={i} className="bg-surface p-5">
              <div className="flex items-center gap-2 text-mut text-[10.5px] tracking-wider uppercase">
                <span className="font-mono text-teal">{s.k}</span>
                <span className="h-px w-6 bg-[#2A3038]" />
              </div>
              <div className="mt-3 text-[15px] font-medium text-pri">{s.t}</div>
              <p className="mt-1.5 text-[12px] text-sec leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Analytics() {
  return (
    <section className="border-t border-subtle bg-app-2">
      <div className="max-w-[1280px] mx-auto px-6 py-20 grid grid-cols-12 gap-10 items-center">
        <div className="col-span-12 lg:col-span-5">
          <div className="label-eyebrow">Reporting & analytics</div>
          <h2 className="mt-3 text-[30px] font-semibold text-pri tracking-tight leading-tight">
            Performance data your CFO and your VP of People will both trust.
          </h2>
          <p className="mt-4 text-[14px] text-sec leading-relaxed">
            Roll up goal completion, calibration variance and quarterly velocity across the entire org. Every metric is built on the same approval-grade source of truth — no second spreadsheet, no second story.
          </p>
          <ul className="mt-6 space-y-2.5 text-[13px]">
            {[
              "Department-level completion benchmarks",
              "Goal calibration variance and bias detection",
              "Quarterly cycle velocity with SLA tracking",
              "Executive board-ready exports",
            ].map((f,i)=>(
              <li key={i} className="flex items-start gap-2.5 text-sec">
                <Check className="h-4 w-4 text-teal mt-0.5" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <div className="card-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[13px] font-medium text-pri">Department completion · Q2 FY26</div>
                <div className="text-[11px] text-mut mt-0.5">Compared to Q1 baseline · 14 departments</div>
              </div>
              <div className="flex gap-1.5">
                <span className="pill">Q2</span>
                <span className="pill">Cycle: 26w</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <BarRows rows={[
                { label: "Engineering", value: 84, color: "#4FD1C5" },
                { label: "Product",     value: 78, color: "#4FD1C5" },
                { label: "Design",      value: 71, color: "#A78BFA" },
                { label: "Marketing",   value: 66, color: "#A78BFA" },
                { label: "Sales",       value: 59, color: "#F59E0B" },
                { label: "Operations",  value: 52, color: "#F59E0B" },
                { label: "Finance",     value: 47, color: "#F87171" },
              ]} />
              <div>
                <div className="text-[11px] text-mut mb-2 label-eyebrow">Cycle velocity</div>
                <div className="h-[180px]">
                  <LineChart height={180} series={[
                    { name: "FY26", color: "#4FD1C5", data: [30,42,55,60,68,72,76,80] },
                    { name: "FY25", color: "#7E827D", data: [28,36,42,48,52,58,62,66] },
                  ]} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div><div className="label-eyebrow">Median</div><div className="text-[15px] font-medium text-pri tabular-nums">1.8d</div></div>
                  <div><div className="label-eyebrow">P95</div><div className="text-[15px] font-medium text-pri tabular-nums">3.4d</div></div>
                  <div><div className="label-eyebrow">SLA met</div><div className="text-[15px] font-medium text-success tabular-nums">96.2%</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Governance() {
  const items = [
    { t: "Immutable audit log", d: "Every approval, return and edit is signed and append-only.", i: Shield },
    { t: "Granular hierarchy", d: "Mirror your real-world org with delegation, dotted lines and acting managers.", i: GitBranch },
    { t: "Policy-aware workflows", d: "Pre-submission checks for OKR alignment, minimum count and SMART formatting.", i: Layers },
    { t: "SOC 2 · ISO 27001", d: "Single sign-on, SCIM provisioning, field-level encryption and data residency controls.", i: Lock },
  ];
  return (
    <section className="border-t border-subtle">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid grid-cols-12 gap-10 mb-10">
          <div className="col-span-12 lg:col-span-6">
            <div className="label-eyebrow">Governance & audit</div>
            <h2 className="mt-3 text-[30px] font-semibold text-pri tracking-tight leading-tight">Built for the way enterprises actually run.</h2>
          </div>
          <p className="col-span-12 lg:col-span-6 text-[14px] text-sec leading-relaxed self-end">
            Goal data eventually becomes performance data, and performance data eventually becomes a legal record. ATOMQUEST treats it that way from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#2A3038] rounded-xl overflow-hidden border border-subtle">
          {items.map((it, i) => {
            const I = it.i;
            return (
              <div key={i} className="bg-surface p-5">
                <div className="h-9 w-9 rounded-md hairline bg-elevated grid place-items-center mb-4">
                  <I className="h-4 w-4 text-teal" />
                </div>
                <div className="text-[14px] font-medium text-pri">{it.t}</div>
                <p className="mt-1.5 text-[12.5px] text-sec leading-relaxed">{it.d}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 card-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12.5px] font-medium text-pri flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-teal" />Audit trail · live preview</div>
            <span className="text-[11px] text-mut">Streaming · last 6 events</span>
          </div>
          <div className="font-mono text-[11.5px] divide-y divide-[#2A3038]">
            {[
              ["10:24:11", "approval.granted", "manager.priya@acme.io", "goal_3829 · 'Reduce p95 to 180ms'"],
              ["10:23:47", "goal.submitted",   "daniel.o@acme.io",     "goal_3829 · v2"],
              ["10:21:02", "cycle.opened",     "system",                "Q2-FY26 · 14 departments"],
              ["10:18:55", "review.returned",  "manager.maya@acme.io", "goal_3811 · feedback attached"],
              ["10:15:31", "policy.flag",      "system",                "goal_3812 · missing baseline"],
              ["10:12:08", "delegation.set",   "admin@acme.io",        "acting=jordan · scope=eng/platform"],
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 py-1.5">
                <div className="col-span-2 text-mut">{row[0]}</div>
                <div className="col-span-3 text-teal">{row[1]}</div>
                <div className="col-span-3 text-sec">{row[2]}</div>
                <div className="col-span-4 text-pri truncate">{row[3]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-subtle relative overflow-hidden">
      <div className="absolute inset-0 radial-glow" />
      <div className="relative max-w-[1280px] mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-1.5 pill mb-5"><Sparkles className="h-3 w-3 text-teal" />Built for FY26 performance cycles</div>
        <h2 className="text-[42px] font-semibold text-pri tracking-tight leading-tight max-w-3xl mx-auto">
          Stop running performance reviews in spreadsheets.<br/>
          <span className="text-sec">Start running them in production.</span>
        </h2>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/login" className="h-11 px-5 rounded-md bg-teal text-[#0D0F12] text-[13.5px] font-medium flex items-center gap-2 hover:opacity-90">
            Open the workspace <ArrowUpRight className="h-4 w-4" />
          </Link>
          <a className="h-11 px-5 rounded-md hairline bg-surface text-pri text-[13.5px] font-medium flex items-center gap-2 hover:bg-elevated">
            Talk to enterprise
          </a>
        </div>
        <div className="mt-6 text-[11.5px] text-mut">No credit card · SSO included · 30-day pilot for teams of 50+</div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-subtle bg-app-2">
      <div className="max-w-[1280px] mx-auto px-6 py-10 grid grid-cols-12 gap-6 text-[12.5px]">
        <div className="col-span-12 md:col-span-4">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[13px] font-semibold tracking-[0.18em] text-pri">ATOMQUEST</span>
          </div>
          <p className="mt-3 text-mut max-w-xs">The enterprise operating system for goal execution, approvals, and quarterly performance.</p>
        </div>
        {[
          ["Platform", ["Workflows","Analytics","Governance","Integrations"]],
          ["Resources", ["Docs","Changelog","Security","Status"]],
          ["Company", ["Customers","Pricing","Contact","Legal"]],
        ].map(([h, items]: any, i) => (
          <div key={i} className="col-span-6 md:col-span-2">
            <div className="label-eyebrow mb-3">{h}</div>
            <ul className="space-y-2">
              {items.map((x: string) => <li key={x}><a className="text-sec hover:text-pri">{x}</a></li>)}
            </ul>
          </div>
        ))}
        <div className="col-span-12 md:col-span-2">
          <div className="label-eyebrow mb-3">System</div>
          <div className="flex items-center gap-2 text-sec"><span className="h-1.5 w-1.5 rounded-full bg-success" />All systems normal</div>
          <div className="text-mut text-[11px] mt-2">SOC 2 · ISO 27001 · GDPR</div>
        </div>
      </div>
      <div className="border-t border-subtle">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between text-[11px] text-mut">
          <div>© 2026 ATOMQUEST, Inc.</div>
          <div className="font-mono">build 4.2.118 · region us-east-1</div>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-app">
      <Nav />
      <Hero />
      <RoleWorkflow />
      <Lifecycle />
      <Analytics />
      <Governance />
      <CTA />
      <Footer />
    </div>
  );
}
