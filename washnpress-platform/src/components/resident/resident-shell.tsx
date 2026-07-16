"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  CalendarClock,
  Package,
  Wallet,
  Puzzle,
  Headphones,
  Leaf,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Gift,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { residentNotifications } from "@/lib/resident-data";

const navItems = [
  { href: "/resident", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/resident/subscription", label: "Subscription", icon: CreditCard },
  { href: "/resident/pickup", label: "Schedule Pickup", icon: CalendarClock },
  { href: "/resident/orders", label: "My Orders", icon: Package },
  { href: "/resident/wallet", label: "Wallet", icon: Wallet },
  { href: "/resident/addons", label: "Add-on Services", icon: Puzzle },
  { href: "/resident/support", label: "Support", icon: Headphones },
  { href: "/resident/impact", label: "Impact", icon: Leaf },
  { href: "/resident/profile", label: "Profile", icon: User },
];

function Logo() {
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
        <p className="text-[10px] leading-tight text-muted-foreground">Clean Clothes, Clear Water</p>
      </div>
    </div>
  );
}

function ReferCard() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-primary p-4 text-primary-foreground">
      <div className="relative z-10">
        <p className="text-sm font-bold">Refer & Earn</p>
        <p className="mt-1 text-xs leading-relaxed opacity-90">
          Refer a friend and get ₹100 wallet credits.
        </p>
        <Link
          href="/resident/wallet"
          className="mt-2 inline-flex items-center text-xs font-semibold text-primary-foreground hover:underline"
        >
          Learn More →
        </Link>
      </div>
      <Gift className="absolute -bottom-1 -right-1 h-16 w-16 opacity-20" />
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/login"
        onClick={onNavigate}
        className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <LogOut className="h-4.5 w-4.5 shrink-0" />
        Logout
      </Link>
    </nav>
  );
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const unread = residentNotifications.filter((n) => n.unread).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-card p-3 shadow-xl">
            <p className="mb-2 text-sm font-semibold">Notifications</p>
            <div className="max-h-64 space-y-2 overflow-auto">
              {residentNotifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "rounded-lg border border-border p-3",
                    n.unread ? "bg-primary/5" : "bg-background",
                  )}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ResidentShell({
  children,
  greeting,
  subtitle,
}: {
  children: ReactNode;
  greeting?: string;
  subtitle?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="p-5">
          <Logo />
        </div>
        <SidebarNav />
        <div className="mt-auto p-4">
          <ReferCard />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between p-5">
              <Logo />
              <button onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setSidebarOpen(false)} />
            <div className="mt-auto p-4">
              <ReferCard />
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
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
            <NotificationsBell />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
