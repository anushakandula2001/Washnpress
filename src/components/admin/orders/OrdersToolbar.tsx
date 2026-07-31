"use client";

import { Download, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function OrdersToolbar({
  search,
  onSearchChange,
  onRefresh,
  onExport,
  loading,
  placeholder = "Search order code, resident, phone, society, operator…",
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => void;
  onExport?: (format: "csv" | "excel" | "pdf") => void;
  loading?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-11 pl-10"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
