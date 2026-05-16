import { FormEvent, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Lock, Mail, Shield, UserRound } from "lucide-react";
import { authApi, setStoredToken } from "@/lib/api";

export const Route = createFileRoute("/login")({ component: Login });

type Role = "employee" | "manager" | "admin";

const demoAccounts: Record<Role, string> = {
  employee: "employee@demo.com",
  manager: "manager@demo.com",
  admin: "admin@demo.com",
};

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("employee");
  const [email, setEmail] = useState(demoAccounts.employee);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectRole = (nextRole: Role) => {
    setRole(nextRole);
    setEmail(demoAccounts[nextRole]);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login({ email, password, role });
      setStoredToken(response.data.accessToken);
      await navigate({ to: `/${role}` });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen radial-glow grid-bg text-pri">
      <header className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-md hairline-strong bg-elevated text-teal">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-[0.18em]">ATOMQUEST</div>
            <div className="text-[10px] uppercase tracking-wider text-mut">Goal OS</div>
          </div>
        </Link>

        <Link to="/" className="flex h-8 items-center gap-1.5 rounded-md hairline bg-surface px-3 text-[12px] text-sec hover:bg-elevated hover:text-pri">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to overview
        </Link>
      </header>

      <section className="mx-auto grid max-w-[1180px] grid-cols-[0.9fr_1.1fr] gap-10 px-6 py-16">
        <div className="pt-10">
          <div className="pill mb-5">
            <span className="pill-dot bg-teal" />
            Secure role-based access
          </div>
          <h1 className="max-w-[620px] text-[52px] font-semibold leading-[1.04] tracking-tight">
            Sign in to your ATOMQUEST workspace.
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] leading-7 text-sec">
            Choose your role, use the associated account, and continue into the employee, manager, or admin journey.
          </p>

          <div className="mt-8 grid max-w-[520px] gap-3">
            {[
              ["employee", "Employee", "Create goals and update quarterly achievements."],
              ["manager", "Manager", "Review approvals and add check-in comments."],
              ["admin", "Admin", "Manage cycles, windows, reports, and governance."],
            ].map(([key, title, text]) => (
              <button
                key={key}
                type="button"
                onClick={() => selectRole(key as Role)}
                className={`rounded-lg border p-4 text-left transition ${
                  role === key ? "border-teal bg-teal/10" : "border-subtle bg-surface hover:bg-elevated"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-semibold text-pri">{title}</div>
                  <div className="text-[11px] text-mut">{demoAccounts[key as Role]}</div>
                </div>
                <p className="mt-1 text-[12.5px] leading-5 text-sec">{text}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card-soft self-start overflow-hidden">
          <div className="flex h-11 items-center justify-between border-b border-subtle bg-app-2 px-4">
            <div className="text-[12px] font-medium text-pri">Workspace Login</div>
            <div className="pill">
              <span className="pill-dot bg-teal" />
              {role}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 p-6">
            <div>
              <label className="label-eyebrow">Role</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["employee", "manager", "admin"] as Role[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectRole(item)}
                    className={`h-10 rounded-md text-[12.5px] font-medium capitalize transition ${
                      role === item ? "bg-teal text-[#0D0F12]" : "hairline bg-surface text-sec hover:bg-elevated hover:text-pri"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="label-eyebrow">Email</span>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-subtle bg-app-2 px-3 focus-within:border-strong">
                <Mail className="h-4 w-4 text-mut" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-full flex-1 bg-transparent text-[13px] text-pri outline-none placeholder:text-mut"
                  placeholder="employee@demo.com"
                  type="email"
                />
              </div>
            </label>

            <label className="block">
              <span className="label-eyebrow">Password</span>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-subtle bg-app-2 px-3 focus-within:border-strong">
                <Lock className="h-4 w-4 text-mut" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-full flex-1 bg-transparent text-[13px] text-pri outline-none placeholder:text-mut"
                  placeholder="Enter password"
                  type="password"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="flex h-11 items-center justify-center gap-2 rounded-md bg-teal text-[13px] font-semibold text-[#0D0F12] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="rounded-md border border-subtle bg-app-2 p-3 text-[12px] leading-5 text-mut">
              <div className="mb-1 flex items-center gap-2 text-sec">
                <UserRound className="h-3.5 w-3.5 text-teal" />
                Demo account helper
              </div>
              The email changes when you select a role. Use the password that exists in your seeded user data.
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
