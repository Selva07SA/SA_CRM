import { NavLink, Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", hint: "KPIs and operational pulse" },
  { to: "/employees", label: "Team", hint: "Roles and workforce control", permission: "employee.manage" },
  { to: "/leads", label: "Leads", hint: "Pipeline and conversion" },
  { to: "/clients", label: "Clients", hint: "Accounts and relationships" },
  { to: "/subscriptions", label: "Subscriptions", hint: "Lifecycle and renewals" },
  { to: "/invoices", label: "Invoices", hint: "Cash flow and collections" }
];

export const AppLayout = () => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const permissionKeys = useAuthStore((s) => s.permissionKeys);
  const clearSession = useAuthStore((s) => s.clearSession);

  const items = navItems.filter((item) => !item.permission || permissionKeys.includes(item.permission));
  const finalItems = user?.systemRole === "SYSTEM_ADMIN" ? [...items, { to: "/plans", label: "Plans", hint: "Global pricing control" }] : items;

  return (
    <div className="crm-shell min-h-screen lg:grid lg:grid-cols-[300px_1fr]">
      <aside className="border-b border-slate-200/80 bg-[#14251f] p-4 text-slate-100 lg:min-h-screen lg:border-b-0 lg:border-r lg:border-r-white/10 lg:p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">SA CRM</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Revenue Command Center</h2>
          <p className="mt-1 text-sm text-slate-300">Operate your sales-to-cash workflow from one secure tenant boundary.</p>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="mt-1 text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
          <p className="truncate text-xs text-slate-300">{user?.email}</p>
        </div>

        <nav className="mt-5 grid gap-2">
          {finalItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "rounded-xl border px-3 py-2.5 transition",
                  isActive
                    ? "border-cyan-300/40 bg-cyan-500/20"
                    : "border-white/10 bg-white/0 hover:border-white/20 hover:bg-white/10"
                )
              }
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-xs text-slate-300">{item.hint}</p>
            </NavLink>
          ))}
        </nav>

        <Button variant="secondary" className="mt-6 w-full" onClick={clearSession}>
          Sign out
        </Button>
      </aside>

      <main className="px-4 pb-8 pt-6 sm:px-6 lg:px-10">
        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-soft backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Workspace</p>
          <p className="text-sm font-medium text-slate-700">
            {location.pathname === "/dashboard" ? "Executive summary" : "Operational view"}
          </p>
        </div>
        <Outlet />
      </main>
    </div>
  );
};
