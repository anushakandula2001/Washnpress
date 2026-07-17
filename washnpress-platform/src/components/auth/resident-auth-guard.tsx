"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, needsOnboarding, type AuthUser } from "@/frontend/api-client";

export function ResidentAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const { user } = await api.me();
        if (cancelled) return;

        const sessionUser = user as AuthUser;
        if (needsOnboarding(sessionUser)) {
          router.replace("/onboarding");
          return;
        }

        setReady(true);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading your account…</p>
      </main>
    );
  }

  return children;
}
