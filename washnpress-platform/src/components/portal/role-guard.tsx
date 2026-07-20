"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { api, needsOnboarding, type AuthUser } from "@/frontend/api-client";
import { homePathForUser, primaryRole, type PortalRole } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogout } from "@/components/auth/use-logout";

type RoleGuardProps = {
  allow: PortalRole[];
  children: ReactNode;
};

const ROLE_LABEL: Record<PortalRole, string> = {
  admin: "Admin",
  operator: "Operations",
  resident: "Resident",
};

function isAllowed(role: PortalRole, allow: PortalRole[], pathname: string): boolean {
  if (allow.includes(role)) return true;
  // Admins may enter the Operations portal.
  if (role === "admin" && allow.includes("operator") && pathname.startsWith("/operations")) {
    return true;
  }
  return false;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const pathname = usePathname();
  const { logout, loggingOut } = useLogout();
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState<AuthUser | null>(null);
  const [bootError, setBootError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setReady(false);
      setDenied(null);
      setBootError(false);

      try {
        const { user } = await api.me();
        if (cancelled) return;

        const authUser = user as unknown as AuthUser;
        const role = primaryRole(authUser.roles ?? []);

        if (role === "resident" && needsOnboarding(authUser) && !pathname.startsWith("/onboarding")) {
          window.location.replace("/onboarding");
          return;
        }

        if (!isAllowed(role, allow, pathname)) {
          setDenied(authUser);
          setReady(true);
          return;
        }

        setDenied(null);
        setReady(true);
      } catch {
        if (!cancelled) {
          setBootError(true);
          window.location.replace("/login");
        }
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [allow, pathname]);

  if (bootError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Redirecting to login…
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading your workspace…
      </div>
    );
  }

  if (denied) {
    const role = primaryRole(denied.roles ?? []);
    const home = homePathForUser(denied);
    const needed = allow.map((r) => ROLE_LABEL[r]).join(" or ");

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              This area requires a {needed} account. You are signed in with a different role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Phone:</span>{" "}
                <span className="font-medium">+91 {denied.phone}</span>
              </p>
              <p className="mt-1">
                <span className="text-muted-foreground">Current role:</span>{" "}
                <span className="font-medium">{ROLE_LABEL[role]}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                disabled={loggingOut}
                onClick={() => void logout()}
              >
                {loggingOut ? "Signing out…" : "Logout & sign in with another account"}
              </Button>
              <Link href={home} className="flex-1 no-underline">
                <Button variant="outline" className="w-full">
                  Go to my portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
