"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/frontend/api-client";

export function useLogout() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    setError(null);
    try {
      await api.auth.logout();
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed. Try again.");
      // Still send user to login so they can switch accounts.
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  }, [router]);

  return { logout, loggingOut, error };
}
