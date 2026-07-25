"use client";

import { Download, Plus, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ResidentsToolbar({
  onRefresh,
  onExport,
  onImport,
  onAdd,
  loading,
}: {
  onRefresh: () => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  onImport: () => void;
  onAdd: () => void;
  loading?: boolean;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" className="gap-1.5" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Resident
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
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
