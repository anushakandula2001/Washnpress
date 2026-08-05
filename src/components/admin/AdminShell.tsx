"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Bell, Moon, Sun, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProfileDropdown } from "@/components/admin/ProfileDropdown";
import { LogoutModal } from "@/components/admin/LogoutModal";
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
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [userName, setUserName] = useState("Platform Admin");
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
            <div className="flex shrink-0 items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground mr-4">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              
              <div className="relative hidden sm:block w-64 mr-2">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search globally..."
                  className="h-9 w-full rounded-full border border-border bg-muted/30 pl-9 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive border border-card" />
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
              <div className="pl-2 border-l border-border/50">
                <ProfileDropdown
                  userName={userName || "Platform Admin"}
                  roleTitle="Administrator"
                  email="admin@washnpress.com"
                  onLogoutClick={() => setLogoutModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <LogoutModal
          isOpen={logoutModalOpen}
          onClose={() => setLogoutModalOpen(false)}
        />
      </div>
    </div>
  );
}
