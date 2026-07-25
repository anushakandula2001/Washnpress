"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

type TabsContextValue = { value: string; onChange: (v: string) => void };
const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-border pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-b-2 border-primary text-primary"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
      onClick={() => ctx?.onChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div role="tabpanel" className={cn("pt-4", className)}>
      {children}
    </div>
  );
}
