"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  adminNavGroups,
  adminQuickActions,
  getAllAdminNavItems,
  type AdminNavGroup,
  type AdminNavItem,
} from "@/lib/navigation/admin-navigation";
import { useLogout } from "@/components/auth/use-logout";

const STORAGE_KEY = "wnp_admin_nav_expanded";
const COLLAPSED_KEY = "wnp_admin_sidebar_collapsed";

function Logo({ collapsed, portalLabel }: { collapsed?: boolean; portalLabel: string }) {
  return (
    <div className={cn("flex flex-col transition-all duration-300", collapsed ? "items-center px-1" : "items-start px-2")}>
      <img src="/logo.png" alt="Wash N Press" className={cn("object-contain transition-all duration-300", collapsed ? "h-8 w-8" : "h-16 w-auto")} />
      {!collapsed && portalLabel && (
        <p className="mt-1 pl-1 text-[10px] font-bold tracking-wider uppercase text-primary/80">{portalLabel}</p>
      )}
    </div>
  );
}

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: AdminNavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const hrefPath = item.href.split("?")[0];
  const isActive = item.exact
    ? pathname === hrefPath
    : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        collapsed && "justify-center px-2 py-2.5",
        isActive
          ? "bg-primary/10 text-primary shadow-sm font-semibold"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary" />
      )}
      <Icon className={cn("h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-110", isActive && "text-primary")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge ? (
        <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {item.badge}
        </span>
      ) : null}
      {collapsed && (
        <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs font-semibold shadow-md transition-all duration-200 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 hidden group-hover:block">
          {item.label}
        </span>
      )}
    </Link>
  );
}

function NavGroup({
  group,
  collapsed,
  expanded,
  onToggle,
  onNavigate,
}: {
  group: AdminNavGroup;
  collapsed?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  if (!group.label) {
    return (
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  if (collapsed) {
    return (
      <div className="space-y-1 border-t border-border/40 pt-2 first:border-0 first:pt-0">
        {group.items.map((item) => (
          <NavLink key={item.href} item={item} collapsed onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <div className="border-t border-border/40 pt-2 first:border-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>{group.label}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", expanded && "rotate-180")} />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-0.5 pb-1">
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarSearch({ collapsed, onResult }: { collapsed?: boolean; onResult?: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [dbResults, setDbResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const items = useMemo(() => getAllAdminNavItems(), []);

  const pageResults = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(term) ||
        i.keywords?.some((k) => k.includes(term)),
    );
  }, [q, items]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setDbResults([]);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(term)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.results) {
            setDbResults(data.results);
          }
        })
        .catch(() => null)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [q]);

  if (collapsed) return null;

  return (
    <div className="relative px-3 pb-3">
      <Search className="absolute left-6 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        className="h-9 w-full rounded-lg border border-border bg-muted/30 pl-8 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        placeholder="Search pages, orders, residents…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && (pageResults.length > 0 || dbResults.length > 0) && (
        <div className="absolute left-3 right-3 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
          {pageResults.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                setQ("");
                setOpen(false);
                onResult?.();
              }}
            >
              <r.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{r.label}</span>
            </Link>
          ))}
          {dbResults.map((r, idx) => (
            <Link
              key={`${r.type}-${r.id}-${idx}`}
              href={r.href}
              className="flex flex-col px-3 py-2 text-xs hover:bg-muted border-t border-border/50 first:border-0"
              onClick={() => {
                setQ("");
                setOpen(false);
                onResult?.();
              }}
            >
              <span className="font-semibold text-foreground">{r.title}</span>
              <span className="text-[10px] text-muted-foreground">{r.subtitle}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarFooter({ collapsed }: { collapsed?: boolean }) {
  const [health, setHealth] = useState<{ db: string; redis: string } | null>(null);

  useEffect(() => {
    void fetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        setHealth({
          db: d.services?.database ?? "unknown",
          redis: d.services?.redis ?? "unknown",
        });
      })
      .catch(() => setHealth({ db: "unknown", redis: "unknown" }));
  }, []);

  if (collapsed) return null;

  return (
    <div className="border-t border-border/50 px-3 py-3 text-[10px] text-muted-foreground bg-muted/10">
      <div className="flex justify-between items-center">
        <span className="font-medium text-foreground">WashNPress v0.1.0</span>
        <span className="uppercase text-[8px] bg-muted px-1.5 py-0.5 rounded font-semibold text-muted-foreground">
          {process.env.NODE_ENV ?? "development"}
        </span>
      </div>
      <div className="mt-2 flex gap-3">
        <span className="flex items-center gap-1">
          <span className={cn("h-1.5 w-1.5 rounded-full", health?.db === "up" ? "bg-emerald-500" : "bg-amber-500")} />
          DB {health?.db === "up" ? "Online" : "Offline"}
        </span>
        <span className="flex items-center gap-1">
          <span className={cn("h-1.5 w-1.5 rounded-full", health?.redis === "up" ? "bg-emerald-500" : "bg-amber-500")} />
          Redis {health?.redis === "up" ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}

export function AdminSidebar({
  portalLabel,
  onNavigate,
  className,
}: {
  portalLabel: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { logout, loggingOut } = useLogout();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setExpanded(JSON.parse(saved) as Record<string, boolean>);
      else {
        const defaults: Record<string, boolean> = {};
        adminNavGroups.forEach((g) => {
          if (g.label) defaults[g.id] = g.defaultExpanded !== false;
        });
        setExpanded(defaults);
      }
      const col = localStorage.getItem(COLLAPSED_KEY);
      if (col === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleGroup = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-card transition-all duration-300 shadow-sm",
        collapsed ? "w-[72px]" : "w-64",
        className,
      )}
    >
      <div className={cn("flex items-center justify-between p-4", collapsed && "flex-col gap-2 p-3")}>
        <Logo collapsed={collapsed} portalLabel={portalLabel} />
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted transition-colors lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <SidebarSearch collapsed={collapsed} onResult={onNavigate} />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-2 scrollbar-none">
        {adminNavGroups.map((group) => (
          <NavGroup
            key={group.id}
            group={group}
            collapsed={collapsed}
            expanded={expanded[group.id] !== false}
            onToggle={() => toggleGroup(group.id)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-border/50 px-3 py-3 bg-muted/5">
          <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </p>
          <div className="space-y-0.5">
            {adminQuickActions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                onClick={onNavigate}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/5 hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="px-3 py-2 border-t border-border/50 bg-muted/5">
        <button
          type="button"
          disabled={loggingOut}
          onClick={() => {
            onNavigate?.();
            void logout();
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50",
            collapsed && "justify-center px-2 py-2.5",
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && (loggingOut ? "Signing out…" : "Logout")}
        </button>
      </div>

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
