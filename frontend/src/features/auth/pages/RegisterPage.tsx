import { Link, Navigate } from "react-router-dom";
import { useRegister } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export const RegisterPage = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const register = useRegister();

  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        className="surface-card w-full max-w-3xl space-y-4 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          register.mutate({
            tenantName: tenantName.trim(),
            tenantSlug: tenantSlug.trim().toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            password
          });
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-brand-700">Create workspace</p>
          <h1 className="mt-1 text-3xl font-semibold">Set up your CRM tenant</h1>
          <p className="mt-1 text-sm text-slate-600">Provision your organization, owner access, and billing-ready CRM environment.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tenant Name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
          <Input label="Tenant Slug" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} required />
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="sm:col-span-2" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="sm:col-span-2" />
        </div>
        <Button
          className="w-full"
          type="submit"
          disabled={
            register.isPending ||
            !tenantName.trim() ||
            !tenantSlug.trim() ||
            !firstName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !password
          }
        >
          {register.isPending ? "Creating workspace..." : "Create Account"}
        </Button>
        <p className="text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link></p>
      </form>
    </div>
  );
};
