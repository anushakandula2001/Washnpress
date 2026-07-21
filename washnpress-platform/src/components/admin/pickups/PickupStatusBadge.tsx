"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  rescheduled: { label: "Rescheduled", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  completed: { label: "Completed", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
  missed: { label: "Missed", className: "bg-orange-500/10 text-orange-700 dark:text-orange-300" },
};

export function PickupStatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status?.toLowerCase() ?? "";
  const config = STATUS_MAP[key] ?? { label: status || "—", className: "bg-muted text-muted-foreground" };
  return (
    <Badge variant="secondary" className={cn("capitalize", config.className, className)}>
      {config.label}
    </Badge>
  );
}
