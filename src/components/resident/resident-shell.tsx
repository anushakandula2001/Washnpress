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
  MapPin,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useLogout } from "@/components/auth/use-logout";
import { useResident } from "@/components/resident/resident-provider";

const navItems = [
  { href: "/resident/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/resident/pickup", label: "Schedule Pickup", icon: CalendarClock },
  { href: "/resident/orders", label: "My Orders", icon: Package },
  { href: "/resident/subscription", label: "Subscription", icon: CreditCard },
  { href: "/resident/wallet", label: "Wallet", icon: Wallet },
  { href: "/resident/support", label: "Support", icon: Headphones },
  { href: "/resident/profile", label: "Profile", icon: User },
];

function Logo() {
  return (
    <div className="flex items-center px-2">
      <img src="/logo.png" alt="Wash N Press" className="h-10 w-auto object-contain" />
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

function ProfileAvatar({ name }: { name?: string }) {
  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "R";

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-foreground">
      {initials}
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout, loggingOut } = useLogout();

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
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-foreground",
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        disabled={loggingOut}
        onClick={() => {
          onNavigate?.();
          void logout();
        }}
        className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
      >
        <LogOut className="h-4.5 w-4.5 shrink-0" />
        {loggingOut ? "Signing out…" : "Logout"}
      </button>
    </nav>
  );
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { notifications } = useResident();
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-foreground"
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
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-border bg-white p-3 shadow-xl">
            <p className="mb-2 text-sm font-semibold">Notifications</p>
            <div className="max-h-64 space-y-2 overflow-auto">
              {notifications.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
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
                ))
              )}
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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white/90 lg:flex">
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
        <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-xl">
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
            <div className="flex items-center gap-3">
              <NotificationsBell />
              <div className="hidden items-center gap-3 rounded-full border border-border bg-card px-3 py-2 lg:flex">
                <ProfileAvatar name={useResident().profile?.name} />
                <span className="text-sm font-medium text-foreground">{useResident().profile?.name ?? "Resident"}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
