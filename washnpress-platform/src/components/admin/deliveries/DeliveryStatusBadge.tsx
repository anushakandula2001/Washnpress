import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  packing: { label: "Packing", className: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  packed: { label: "Packed", className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" },
  "ready for delivery": {
    label: "Ready for Delivery",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  "out for delivery": {
    label: "Out for Delivery",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  delivered: { label: "Delivered", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  "failed delivery": { label: "Failed Delivery", className: "bg-red-500/10 text-red-700 dark:text-red-300" },
  "delivery failed": { label: "Delivery Failed", className: "bg-red-500/10 text-red-700 dark:text-red-300" },
};

export function DeliveryStatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status?.toLowerCase() ?? "";
  const config = STATUS_MAP[key] ?? { label: status || "—", className: "bg-muted text-muted-foreground" };
  return (
    <Badge variant="secondary" className={cn("font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
