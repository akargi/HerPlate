import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/LogoMark";
import { getAdminSession } from "@/lib/admin/session";
import { adminConfig } from "@/lib/admin/config";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const devCreds =
    process.env.NODE_ENV !== "production" &&
    adminConfig.password === "hptf-admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <LogoMark className="size-10" />
          <span className="font-display text-xl font-bold text-white">
            HPTF Admin
          </span>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="font-display text-2xl font-bold text-brand-900">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Manage inquiries, news posts, and events.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
          {devCreds && (
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Development mode — sign in with{" "}
              <code className="font-mono">{adminConfig.username}</code> /{" "}
              <code className="font-mono">{adminConfig.password}</code>. Set{" "}
              <code className="font-mono">ADMIN_EMAIL</code> and{" "}
              <code className="font-mono">ADMIN_PASSWORD</code> env vars before
              launch.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
