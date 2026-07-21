import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success"; className?: string }> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "secondary" },
  blocked: { label: "Blocked", variant: "destructive" },
  deleted: { label: "Deleted", variant: "destructive" },
  pending: { label: "Pending", variant: "default", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  premium: { label: "Premium", variant: "default", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  verified: { label: "Verified", variant: "success" },
  paused: { label: "Paused", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  expired: { label: "Expired", variant: "secondary" },
  coming_soon: { label: "Coming Soon", variant: "default", className: "bg-sky-500/10 text-sky-700" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status?.toLowerCase() ?? "";
  const config = STATUS_MAP[key] ?? { label: status || "—", variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className={cn("capitalize", config.className, className)}>
      {config.label}
    </Badge>
  );
}
