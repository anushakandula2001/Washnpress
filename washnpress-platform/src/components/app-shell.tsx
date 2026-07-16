"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Bell, Search, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { notificationCenter } from "@/lib/experience-data";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/resident", label: "Resident" },
  { href: "/operations", label: "Operations" },
  { href: "/admin", label: "Admin" },
];

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const unreadCount = notificationCenter.filter((item) => item.unread).length;

  const commandItems = useMemo(
    () =>
      [
        { href: "/", label: "Go to Mission Dashboard" },
        { href: "/resident", label: "Open Resident Portal" },
        { href: "/operations", label: "Open Operator Portal" },
        { href: "/admin", label: "Open Admin Console" },
        { href: "/login", label: "Open Login" },
      ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">
                Wash N Press
              </p>
              <h1 className="text-2xl text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2">
              <button
                className="hidden h-9 min-w-56 items-center justify-between rounded-md border border-border bg-background px-3 text-sm text-muted-foreground md:flex"
                onClick={() => setPaletteOpen(true)}
                aria-label="Open command palette"
              >
                <span className="inline-flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search screens, orders, societies
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs">
                  <Command className="h-3 w-3" />K
                </span>
              </button>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative"
                  onClick={() => setShowNotifications((open) => !open)}
                  aria-label="Open notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                      {unreadCount}
                    </span>
                  ) : null}
                </Button>

                {showNotifications ? (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-3 shadow-xl">
                    <p className="mb-2 text-sm font-semibold">Notification Center</p>
                    <div className="space-y-2">
                      {notificationCenter.map((item) => (
                        <article
                          key={item.title}
                          className="rounded-md border border-border bg-background p-2"
                        >
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.body}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <ThemeToggle />
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Login
              </Link>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 text-sm sm:flex sm:flex-wrap">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md border px-3 py-2 text-center transition ${
                  pathname === item.href
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {paletteOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-3 shadow-2xl">
            <div className="mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search workflows, pages, or commands"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring focus:ring-2"
                aria-label="Command palette search"
              />
              <button
                onClick={() => setPaletteOpen(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                aria-label="Close command palette"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 space-y-1 overflow-auto">
              {commandItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setPaletteOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
