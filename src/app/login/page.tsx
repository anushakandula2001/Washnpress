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
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background to-primary/5">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="mb-6 inline-block">
            <img src="/logo.png" alt="Wash N Press" className="h-16 w-auto object-contain" />
          </Link>
        </div>

        <div className="space-y-4">
          {checking ? (
            <Card className="border-none shadow-xl glass">
              <CardContent className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                Checking existing session…
              </CardContent>
            </Card>
          ) : existing && !showForm ? (
            <Card className="border-none shadow-xl glass overflow-hidden">
              <CardHeader className="bg-primary/5 pb-6 border-b border-border/50">
                <CardTitle className="text-xl">Welcome back</CardTitle>
                <CardDescription>
                  You are already signed in to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="rounded-xl border border-border bg-white/50 backdrop-blur-sm p-4 text-sm shadow-inner">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Mobile</span>
                    <span className="font-semibold text-foreground">+91 {existing.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-semibold text-primary">
                      {role ? ROLE_LABEL[role] : "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full shadow-md shadow-primary/20">
                    <Link href={home}>Continue to portal</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-border hover:bg-muted"
                    disabled={loggingOut}
                    onClick={() => void logout()}
                  >
                    {loggingOut ? "Signing out…" : "Sign out"}
                  </Button>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setShowForm(true)}
                  >
                    Sign in with a different account
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {existing && showForm && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-50/80 backdrop-blur-sm px-4 py-3 text-sm text-amber-800 shadow-sm">
                  Active session (+91 {existing.phone}). You may want to{" "}
                  <button
                    type="button"
                    className="font-bold underline text-amber-900"
                    disabled={loggingOut}
                    onClick={() => void logout()}
                  >
                    log out first
                  </button>.
                </div>
              )}
              <div className="shadow-xl rounded-xl overflow-hidden glass border-none">
                <PhoneOtpForm mode="login" />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>
    </main>
  );
}
