"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Bell, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils/cn";
import { api } from "@/frontend/api-client";

export function AdminShell({
  children,
  greeting,
  subtitle,
}: {
  children: ReactNode;
  greeting?: string;
  subtitle?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    void api
      .me()
      .then((d) => {
        const u = d.user as Record<string, unknown>;
        setUserName(String(u.fullName ?? u.full_name ?? "Admin"));
      })
      .catch(() => null);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex">
        <AdminSidebar portalLabel="Admin Portal" />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex h-full w-72 flex-col bg-card shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-lg p-2 hover:bg-muted"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <AdminSidebar portalLabel="Admin Portal" onNavigate={() => setMobileOpen(false)} className="w-full border-0" />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-border p-2 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              {greeting && (
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">{greeting}</h1>
                  {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              {mounted && (
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              )}
              <button
                type="button"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-primary/10 text-primary",
                )}
                aria-label="Profile"
              >
                <User className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
