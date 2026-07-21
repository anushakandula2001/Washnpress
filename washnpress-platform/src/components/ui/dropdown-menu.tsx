"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

type DropdownContextValue = { open: boolean; setOpen: (v: boolean) => void };
const DropdownContext = React.createContext<DropdownContextValue | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(DropdownContext);
  return (
    <button
      type="button"
      className={className}
      aria-expanded={ctx?.open}
      aria-haspopup="menu"
      onClick={() => ctx?.setOpen(!ctx.open)}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end";
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx?.open) return null;
  return (
    <div
      role="menu"
      className={cn(
        "absolute z-50 mt-1 min-w-[180px] rounded-xl border border-border bg-card p-1 shadow-lg",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  destructive,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}) {
  const ctx = React.useContext(DropdownContext);
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
        destructive && "text-destructive hover:bg-destructive/10",
        className,
      )}
      onClick={() => {
        onClick?.();
        ctx?.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
