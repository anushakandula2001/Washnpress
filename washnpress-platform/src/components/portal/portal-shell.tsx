"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, Bell } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { PortalNavItem } from "@/lib/portal-nav";
import { useLogout } from "@/components/auth/use-logout";

function Logo({ portalLabel }: { portalLabel: string }) {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <svg viewBox="0 0 32 32" className="h-6 w-6 text-primary" fill="currentColor">
          <path d="M4 20c4-8 8-12 12-12s8 4 12 12c-2 2-6 4-12 4S6 22 4 20z" opacity="0.3" />
          <path d="M6 22c3-6 7-9 10-9s7 3 10 9c-1.5 1.5-4 2.5-10 2.5S7.5 23.5 6 22z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold tracking-wide text-foreground">WASH N PRESS</p>
        <p className="text-[10px] leading-tight text-muted-foreground">{portalLabel}</p>
      </div>
    </div>
  );
}

function SidebarNav({
  items,
  onNavigate,
}: {
  items: PortalNavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { logout, loggingOut } = useLogout();

  const sections = items.reduce<Array<{ section?: string; items: PortalNavItem[] }>>(
    (acc, item) => {
      const section = item.section;
      const last = acc[acc.length - 1];
      if (last && last.section === section) {
        last.items.push(item);
      } else {
        acc.push({ section, items: [item] });
      }
      return acc;
    },
    [],
  );

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
      {sections.map((group) => (
        <div key={group.section ?? group.items[0]?.href}>
          {group.section && (
            <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground first:mt-0">
              {group.section}
            </p>
          )}
          {group.items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
      <button
        type="button"
        disabled={loggingOut}
        onClick={() => {
          onNavigate?.();
          void logout();
        }}
        className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {loggingOut ? "Signing out…" : "Logout"}
      </button>
    </nav>
  );
}

export function PortalShell({
  children,
  navItems,
  portalLabel,
  greeting,
  subtitle,
}: {
  children: ReactNode;
  navItems: PortalNavItem[];
  portalLabel: string;
  greeting?: string;
  subtitle?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="p-5">
          <Logo portalLabel={portalLabel} />
        </div>
        <SidebarNav items={navItems} />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between p-5">
              <Logo portalLabel={portalLabel} />
              <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav items={navItems} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-border p-2 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              {greeting && (
                <div>
                  <h1 className="text-xl font-bold text-foreground">{greeting}</h1>
                  {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
              )}
            </div>
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
