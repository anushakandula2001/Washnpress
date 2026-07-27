"use client";
import { LayoutGrid, Table2, Map } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { SocietyViewMode } from "./types";

export function SocietyToolbar({
  viewMode,
  onViewModeChange,
  
}: {
  viewMode: SocietyViewMode;
  onViewModeChange: (mode: SocietyViewMode) => void;
  
}) {
  const viewModes: { mode: SocietyViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { mode: "cards", icon: LayoutGrid, label: "Cards" },
    { mode: "table", icon: Table2, label: "Table" },
    { mode: "map", icon: Map, label: "Map" },
  ];

  return (
  <div className="mb-4 flex">
    <div className="flex rounded-lg border border-border p-0.5 w-fit">
      {viewModes.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          type="button"
          title={label}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
            viewMode === mode
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          onClick={() => onViewModeChange(mode)}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  </div>
);
  
}
