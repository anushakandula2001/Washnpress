import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
  "picked up": { label: "Picked Up", className: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  "in wash": { label: "In Wash", className: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  dry: { label: "Dry", className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300" },
  iron: { label: "Iron", className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" },
  "qc hold": { label: "QC Hold", className: "bg-orange-500/10 text-orange-700 dark:text-orange-300" },
  "ready for delivery": {
    label: "Ready For Delivery",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  packing: { label: "Packing", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  packed: { label: "Packed", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  "out for delivery": {
    label: "Out for Delivery",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  delivered: { label: "Delivered", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-700 dark:text-red-300" },
};

export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status?.toLowerCase() ?? "";
  const config = STATUS_MAP[key] ?? { label: status || "—", className: "bg-muted text-muted-foreground" };
  return (
    <Badge variant="secondary" className={cn("font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
