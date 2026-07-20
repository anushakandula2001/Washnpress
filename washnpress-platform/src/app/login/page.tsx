"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PhoneOtpForm } from "@/components/auth/phone-otp-form";
import { useLogout } from "@/components/auth/use-logout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, type AuthUser } from "@/frontend/api-client";
import { homePathForUser, primaryRole, type PortalRole } from "@/lib/auth-redirect";

const ROLE_LABEL: Record<PortalRole, string> = {
  admin: "Admin",
  operator: "Operations",
  resident: "Resident",
};

export default function LoginPage() {
  const { logout, loggingOut } = useLogout();
  const [existing, setExisting] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { user } = await api.me();
        if (cancelled) return;
        setExisting(user as unknown as AuthUser);
      } catch {
        if (!cancelled) setExisting(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const role = existing ? primaryRole(existing.roles ?? []) : null;
  const home = existing ? homePathForUser(existing) : "/";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid w-full gap-6 lg:grid-cols-2">
        <div className="order-2 space-y-4 lg:order-1">
          {checking ? (
            <Card>
              <CardContent className="p-8 text-sm text-muted-foreground">
                Checking existing session…
              </CardContent>
            </Card>
          ) : existing && !showForm ? (
            <Card>
              <CardHeader>
                <CardTitle>You&apos;re already signed in</CardTitle>
                <CardDescription>
                  Continue to your portal, or sign out to switch accounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    <span className="font-medium">+91 {existing.phone}</span>
                  </p>
                  <p className="mt-1">
                    <span className="text-muted-foreground">Role:</span>{" "}
                    <span className="font-medium">
                      {role ? ROLE_LABEL[role] : "Unknown"}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link href={home} className="flex-1 no-underline">
                    <Button className="w-full">Continue to portal</Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={loggingOut}
                    onClick={() => void logout()}
                  >
                    {loggingOut ? "Signing out…" : "Logout and switch account"}
                  </Button>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setShowForm(true)}
                >
                  Sign in with a different number without leaving
                </button>
              </CardContent>
            </Card>
          ) : (
            <>
              {existing && showForm && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                  A session is still active (+91 {existing.phone}). Prefer{" "}
                  <button
                    type="button"
                    className="font-semibold underline"
                    disabled={loggingOut}
                    onClick={() => void logout()}
                  >
                    logout first
                  </button>{" "}
                  so roles don’t get mixed up.
                </div>
              )}
              <PhoneOtpForm mode="login" />
            </>
          )}
        </div>

        <Card className="order-1 lg:order-2">
          <CardHeader>
            <CardTitle>WashNPress Admin Login</CardTitle>
            <CardDescription>
              Default entry for the platform. Sign in with OTP — you are routed by role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Admin</strong> → Admin Dashboard · <strong>Operator</strong> → Operations ·{" "}
              <strong>Resident</strong> → Resident Dashboard.
            </p>
            <p>No role picker. Wrong portal access is blocked.</p>
            <p>
              Demo phones: Admin <strong>9876500001</strong>, Ops <strong>9876500002</strong>,
              Resident <strong>9876543210</strong>.
            </p>
            <p>In development, OTP is printed in the server terminal.</p>
            <p>
              New residents: <Link href="/register">create an account</Link>.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
