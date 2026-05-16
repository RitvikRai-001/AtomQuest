import { Link, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  LayoutDashboard, Target, ClipboardList, Users, BarChart3, Shield,
  Settings, Bell, Search, ChevronDown, Plus, FileText, Calendar,
  GitBranch, Activity, Building2, CheckCircle2,
} from "lucide-react";
import { getStoredToken, notificationApi } from "@/lib/api";

type Role = "Employee" | "Manager" | "Admin";

const NAV: Record<Role, { group: string; items: { label: string; to: string; icon: any }[] }[]> = {
  Employee: [
    { group: "Workspace", items: [
      { label: "Dashboard", to: "/employee", icon: LayoutDashboard },
      { label: "My Goals", to: "/employee/goals", icon: Target },
      { label: "Check-ins", to: "/employee/checkins", icon: Calendar },
      { label: "Feedback", to: "/employee/feedback", icon: FileText },
    ]},
    { group: "Performance", items: [
      { label: "Quarterly Review", to: "/employee/review", icon: ClipboardList },
      { label: "Activity", to: "/employee/activity", icon: Activity },
    ]},
  ],
  Manager: [
    { group: "Team", items: [
      { label: "Dashboard", to: "/manager", icon: LayoutDashboard },
      { label: "Approvals", to: "/manager", icon: ClipboardList },
      { label: "My Team", to: "/manager", icon: Users },
      { label: "Shared Goals", to: "/manager", icon: GitBranch },
    ]},
    { group: "Insight", items: [
      { label: "Analytics", to: "/manager", icon: BarChart3 },
      { label: "Reviews", to: "/manager", icon: FileText },
    ]},
  ],
  Admin: [
    { group: "Governance", items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
      { label: "Cycles", to: "/admin", icon: Calendar },
      { label: "Departments", to: "/admin", icon: Building2 },
      { label: "Audit Log", to: "/admin", icon: Shield },
    ]},
    { group: "Platform", items: [
      { label: "Reporting", to: "/admin", icon: BarChart3 },
      { label: "Settings", to: "/admin", icon: Settings },
    ]},
  ],
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-7 w-7 rounded-md hairline-strong bg-elevated grid place-items-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="2.2" fill="#4FD1C5"/>
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#4FD1C5" strokeOpacity="0.7" strokeWidth="1.2"/>
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#A78BFA" strokeOpacity="0.5" strokeWidth="1.2" transform="rotate(60 12 12)"/>
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#F4F1EA" strokeOpacity="0.3" strokeWidth="1.2" transform="rotate(-60 12 12)"/>
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[13px] font-semibold tracking-[0.18em] text-pri">ATOMQUEST</div>
        <div className="text-[10px] tracking-wider text-mut uppercase">Goal OS</div>
      </div>
    </div>
  );
}

export function AppShell({
  role, title, breadcrumb, primaryAction, children,
}: {
  role: Role;
  title: string;
  breadcrumb?: string;
  primaryAction?: { label: string; icon?: any; onClick?: () => void };
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const groups = NAV[role];
  const hasToken = Boolean(getStoredToken());
  const queryClient = useQueryClient();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationsQuery = useQuery({
    queryKey: ["notifications", role],
    queryFn: notificationApi.getMyNotifications,
    enabled: hasToken,
    retry: false,
  });

  const notificationPayload = (notificationsQuery.data as any)?.data;
  const notifications = notificationPayload?.notifications || [];
  const unreadCount = notificationPayload?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", role] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", role] }),
  });

  return (
    <div className="min-h-screen bg-app text-pri flex">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 border-r border-subtle bg-app-2 flex flex-col sticky top-0 h-screen">
        <div className="px-4 h-14 flex items-center border-b border-subtle">
          <Logo />
        </div>

        <div className="px-3 py-3 border-b border-subtle">
          <button className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hairline bg-surface hover:bg-elevated transition">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-elevated grid place-items-center text-[10px] font-semibold text-teal">AC</div>
              <div className="text-left">
                <div className="text-[12px] font-medium text-pri">Acme Corp</div>
                <div className="text-[10px] text-mut">FY26 · Q2 Cycle</div>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-mut" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
          {groups.map((g, gi) => (
            <div key={gi}>
              <div className="label-eyebrow px-2.5 mb-1.5">{g.group}</div>
              <div className="space-y-0.5">
                {g.items.map((it, i) => {
                  const Icon = it.icon;
                  const active = pathname === it.to;
                  return (
                    <Link
                      key={i}
                      to={it.to}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition ${
                        active
                          ? "bg-elevated text-pri hairline"
                          : "text-sec hover:bg-surface hover:text-pri"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                      <span>{it.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-subtle p-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-surface">
            <div className="h-7 w-7 rounded-full bg-elevated grid place-items-center text-[11px] font-medium text-pri">SK</div>
            <div className="leading-tight flex-1 min-w-0">
              <div className="text-[12px] font-medium text-pri truncate">Sana Khatri</div>
              <div className="text-[10.5px] text-mut truncate">{role} · Product</div>
            </div>
            <Settings className="h-3.5 w-3.5 text-mut" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-14 border-b border-subtle bg-app-2/80 backdrop-blur flex items-center px-6 gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {breadcrumb && (
              <>
                <span className="text-[12px] text-mut">{breadcrumb}</span>
                <span className="text-mut">/</span>
              </>
            )}
            <h1 className="text-[14px] font-semibold text-pri truncate">{title}</h1>
            <span className="pill ml-2"><span className="pill-dot bg-teal" />Live</span>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mut" />
              <input
                placeholder="Search goals, people, cycles…"
                className="w-[300px] pl-8 pr-16 h-8 rounded-md bg-surface hairline text-[12.5px] text-pri placeholder:text-mut focus:outline-none focus:hairline-strong focus:ring-1 focus:ring-[#4FD1C5]/40"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-mut border border-subtle rounded px-1.5 py-0.5 bg-app-2">⌘K</kbd>
            </div>

            <button className="h-8 px-2.5 rounded-md hairline bg-surface hover:bg-elevated flex items-center gap-1.5 text-[12px] text-sec">
              {role}
              <ChevronDown className="h-3 w-3" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="h-8 w-8 rounded-md hairline bg-surface hover:bg-elevated grid place-items-center relative"
              >
                <Bell className="h-3.5 w-3.5 text-sec" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber px-1 text-[9px] font-semibold text-[#0D0F12]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-10 z-50 w-[360px] overflow-hidden rounded-md border border-subtle bg-app-2 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-subtle px-3 py-2.5">
                    <div>
                      <div className="text-[13px] font-semibold text-pri">Notifications</div>
                      <div className="text-[11px] text-mut">{unreadCount} unread</div>
                    </div>
                    <button
                      type="button"
                      disabled={!unreadCount || markAllReadMutation.isPending}
                      onClick={() => markAllReadMutation.mutate()}
                      className="h-7 rounded-md border border-subtle bg-surface px-2.5 text-[11.5px] text-sec hover:bg-elevated hover:text-pri disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[390px] overflow-y-auto">
                    {!hasToken ? (
                      <div className="p-4 text-[12px] leading-5 text-sec">Sign in to view notifications.</div>
                    ) : notificationsQuery.isLoading ? (
                      <div className="p-4 text-[12px] leading-5 text-sec">Loading notifications...</div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification: any) => (
                        <button
                          key={notification._id}
                          type="button"
                          onClick={() => {
                            if (!notification.read) markReadMutation.mutate(notification._id);
                          }}
                          className={`grid w-full grid-cols-[32px_1fr] gap-3 border-b border-subtle px-3 py-3 text-left transition last:border-b-0 ${
                            notification.read ? "bg-app-2 hover:bg-surface" : "bg-teal/10 hover:bg-teal/15"
                          }`}
                        >
                          <div className="grid h-8 w-8 place-items-center rounded-md bg-surface">
                            {notification.read ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <Bell className="h-4 w-4 text-amber" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-[12.5px] font-semibold text-pri">{notification.title}</span>
                              <span className="rounded border border-subtle px-1.5 py-0.5 text-[9.5px] uppercase tracking-wide text-mut">
                                {notification.type}
                              </span>
                            </div>
                            <p className="mt-1 text-[11.5px] leading-5 text-sec">{notification.message}</p>
                            <div className="mt-1 text-[10.5px] text-mut">{formatNotificationTime(notification.createdAt)}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-[12px] leading-5 text-sec">No notifications yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="h-8 px-3 rounded-md bg-teal text-[#0D0F12] text-[12.5px] font-medium flex items-center gap-1.5 hover:opacity-90"
              >
                {primaryAction.icon ? <primaryAction.icon className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {primaryAction.label}
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className={`mx-auto w-full ${pathname.includes("admin") || pathname.includes("manager") || pathname.includes("employee") ? "max-w-[1280px]" : "max-w-[1280px]"} px-6 py-6`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- shared primitives ---------- */

export function StatusPill({ kind }: { kind: "Draft" | "Submitted" | "Approved" | "Returned" | "At Risk" | "Completed" | "On Track" }) {
  const map: Record<string, { color: string; bg: string }> = {
    Draft:      { color: "#B8B4AA", bg: "#7E827D" },
    Submitted:  { color: "#A78BFA", bg: "#A78BFA" },
    Approved:   { color: "#7DD87D", bg: "#7DD87D" },
    Returned:   { color: "#F59E0B", bg: "#F59E0B" },
    "At Risk":  { color: "#F87171", bg: "#F87171" },
    Completed:  { color: "#7DD87D", bg: "#7DD87D" },
    "On Track": { color: "#4FD1C5", bg: "#4FD1C5" },
  };
  const c = map[kind];
  return (
    <span className="pill" style={{ color: c.color }}>
      <span className="pill-dot" style={{ background: c.bg }} />
      {kind}
    </span>
  );
}

export function KpiCard({
  label, value, delta, deltaTone = "up", sub,
}: { label: string; value: string; delta?: string; deltaTone?: "up" | "down" | "flat"; sub?: string }) {
  const tone = deltaTone === "up" ? "text-success" : deltaTone === "down" ? "text-danger" : "text-mut";
  return (
    <div className="card-soft p-4">
      <div className="label-eyebrow">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-[26px] font-semibold text-pri tracking-tight tabular-nums">{value}</div>
        {delta && <div className={`text-[11.5px] font-medium ${tone}`}>{delta}</div>}
      </div>
      {sub && <div className="mt-1 text-[11.5px] text-mut">{sub}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = "teal" }: { value: number; tone?: "teal" | "violet" | "amber" | "success" | "danger" }) {
  const colors: Record<string, string> = { teal: "#4FD1C5", violet: "#A78BFA", amber: "#F59E0B", success: "#7DD87D", danger: "#F87171" };
  return (
    <div className="h-1.5 w-full rounded-full bg-[#20252D] overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: colors[tone] }} />
    </div>
  );
}

export function SectionHeader({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <h2 className="text-[14px] font-semibold text-pri">{title}</h2>
        {hint && <p className="text-[12px] text-mut mt-0.5">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

function formatNotificationTime(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
