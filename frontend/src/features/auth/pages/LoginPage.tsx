import { Link, Navigate, useLocation } from "react-router-dom";
import { useLogin } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export const LoginPage = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useLogin();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/dashboard";

  const [tenantSlug, setTenantSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-3xl bg-[#13231d] p-8 text-white shadow-card lg:block">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">SA CRM</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">From lead intake to paid invoice, one operating system.</h1>
          <p className="mt-4 text-sm text-slate-200">Designed for subscription-first businesses that need strict tenant isolation, role control, and billing reliability.</p>
          <div className="mt-8 grid gap-3 text-sm text-slate-200">
            <p>Tenant-isolated pipeline and client records</p>
            <p>Role-aware views for sales, managers, and billing</p>
            <p>Subscription and invoice workflows in one dashboard</p>
          </div>
        </section>

        <form
          className="surface-card w-full space-y-4 p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate({
              tenantSlug: tenantSlug.trim().toLowerCase(),
              email: email.trim().toLowerCase(),
              password
            });
          }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-brand-700">Welcome back</p>
            <h2 className="mt-1 text-3xl font-semibold">Sign in</h2>
          </div>
          <Input label="Tenant Slug" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button
            className="w-full"
            type="submit"
            disabled={login.isPending || !tenantSlug.trim() || !email.trim() || !password}
          >
            {login.isPending ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-sm text-slate-600">No account? <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create workspace</Link></p>
        </form>
      </div>
    </div>
  );
};
