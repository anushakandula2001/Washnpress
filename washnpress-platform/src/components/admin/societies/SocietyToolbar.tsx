"use client";

import { Download, Plus, RefreshCw, Upload, LayoutGrid, Table2, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";
import type { SocietyViewMode } from "./types";

export function SocietyToolbar({
  viewMode,
  onViewModeChange,
  onRefresh,
  onExport,
  onImport,
  onAdd,
  loading,
}: {
  viewMode: SocietyViewMode;
  onViewModeChange: (mode: SocietyViewMode) => void;
  onRefresh: () => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  onImport: () => void;
  onAdd: () => void;
  loading?: boolean;
}) {
  const viewModes: { mode: SocietyViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { mode: "cards", icon: LayoutGrid, label: "Cards" },
    { mode: "table", icon: Table2, label: "Table" },
    { mode: "map", icon: Map, label: "Map" },
  ];

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={() => onViewModeChange(mode)}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" className="gap-1.5" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Society
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onImport}>
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted">
            <Download className="h-4 w-4" />
            Export
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onExport("csv")}>CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("excel")}>Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("pdf")}>PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
