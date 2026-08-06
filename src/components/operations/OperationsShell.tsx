"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarClock,
  Truck,
  ClipboardList,
  Factory,
  CheckCircle2,
  Users,
  Bell,
  Headphones,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useLogout } from "@/components/auth/use-logout";

const navItems = [
  { href: "/operations/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true, section: "Overview" },
  { href: "/operations/pickups", label: "Today's Pickups", icon: CalendarClock, section: "Operations" },
  { href: "/operations/delivery", label: "Today's Deliveries", icon: Truck, section: "Operations" },
  { href: "/operations/pickup-queue", label: "Assigned Orders", icon: ClipboardList, section: "Operations" },
  { href: "/operations/processing-center", label: "Laundry Processing", icon: Factory, section: "Operations" },
  { href: "/operations/completed", label: "Completed Orders", icon: CheckCircle2, section: "Operations" },
  { href: "/operations/customers", label: "Customers", icon: Users, section: "People" },
  { href: "/operations/notifications", label: "Notifications", icon: Bell, section: "Support" },
  { href: "/operations/support-center", label: "Support Tickets", icon: Headphones, section: "Support" },
  { href: "/operations/profile", label: "Profile", icon: User, section: "Account" },
  { href: "/operations/settings", label: "Settings", icon: Settings, section: "Account" },
];

function Logo() {
  return (
    <div className="flex items-center gap-3 px-2">
      <img src="/logo.png" alt="Wash N Press" className="h-9 w-auto object-contain" />
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout, loggingOut } = useLogout();

  const sections = navItems.reduce<Array<{ section: string; items: typeof navItems }>>(
    (acc, item) => {
      const last = acc[acc.length - 1];
      if (last && last.section === item.section) {
        last.items.push(item);
      } else {
        acc.push({ section: item.section ?? "", items: [item] });
      }
      return acc;
    },
    [],
  );

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
      {sections.map((group, idx) => (
        <div key={`${group.section}-${idx}`}>
          <p className="mb-1 mt-4 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60 first:mt-0">
            {group.section}
          </p>
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
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(14,165,164,0.15)]"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
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
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {loggingOut ? "Signing out…" : "Logout"}
      </button>
    </nav>
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
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-border bg-card p-3 shadow-2xl">
            <p className="mb-3 text-sm font-bold text-foreground">Notifications</p>
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl p-3 transition-colors cursor-pointer hover:bg-muted/50",
                    n.unread ? "bg-primary/5 border border-primary/10" : "bg-muted/20",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function OperationsShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="p-5 pb-3 border-b border-border/50">
          <Logo />
          <p className="mt-2 pl-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Operations Portal
          </p>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden pt-2">
          <SidebarNav />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col border-r border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 p-5">
              <div>
                <Logo />
                <p className="mt-1 pl-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Operations Portal
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden pt-2">
              <SidebarNav onNavigate={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              type="button"
              className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search bar */}
            <div className="relative hidden sm:block w-56 lg:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders, residents..."
                className="h-9 w-full rounded-xl border border-border bg-muted/30 pl-9 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Date */}
            <div className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <span>{today}</span>
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile */}
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
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
