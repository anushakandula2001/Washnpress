"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, Bell, Search, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { PortalNavItem } from "@/lib/portal-nav";
import { useLogout } from "@/components/auth/use-logout";
import { AdminShell } from "@/components/admin/AdminShell";

function Logo({ portalLabel }: { portalLabel: string }) {
  return (
    <div className="flex flex-col items-start px-2">
      <img src="/logo.png" alt="Wash N Press" className="h-30 w-auto object-contain" />
      {portalLabel && (
        <p className="text-[10px] leading-tight text-muted-foreground pl-1 -mt-1 font-bold uppercase tracking-widest">{portalLabel}</p>
      )}
    </div>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);

  const notifications = [
    { title: "Pickup Delayed", body: "#ORD-1094 — Ramesh K. delayed pickup by 30 min", time: "5m ago", unread: true },
    { title: "New Order Assigned", body: "#ORD-1097 assigned to your area (Sobha City)", time: "12m ago", unread: true },
    { title: "Reschedule Request", body: "Resident Priya Singh requested reschedule", time: "1h ago", unread: false },
    { title: "Payment Completed", body: "₹850 received for #ORD-1092", time: "2h ago", unread: false },
  ];

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl z-50">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <button className="text-xs text-primary hover:underline">Mark all read</button>
          </div>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className={`flex flex-col gap-1 rounded-xl p-3 ${n.unread ? "bg-muted/50" : "hover:bg-muted/30"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
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
      {sections.map((group, index) => (
        <div key={`${group.section ?? group.items[0]?.href}-${index}`}>
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

  if (portalLabel === "Admin Portal") {
    return (
      <AdminShell greeting={greeting} subtitle={subtitle}>
        {children}
      </AdminShell>
    );
  }



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
                <div className={portalLabel === "Operations Portal" ? "hidden lg:block" : ""}>
                  <h1 className="text-xl font-bold text-foreground">{greeting}</h1>
                  {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
              )}
            </div>

            {portalLabel === "Operations Portal" && (
              <>
                <div className="relative hidden sm:block w-56 lg:w-72 ml-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search orders, residents..."
                    className="h-9 w-full rounded-xl border border-border bg-muted/30 pl-9 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-4">
                  <div className="hidden text-sm font-medium text-muted-foreground md:block">
                    {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <NotificationBell />
                  <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      RK
                    </div>
                    <div className="leading-tight">
                      <p className="text-xs font-semibold text-foreground">Ramesh Kumar</p>
                      <p className="text-[10px] text-muted-foreground">Operator</p>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </>
            )}

            {portalLabel !== "Operations Portal" && (
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
