import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function BulkActionBar({
  count,
  actions,
  onClear,
  className,
}: {
  count: number;
  actions: React.ReactNode;
  onClear: () => void;
  className?: string;
}) {
  if (count === 0) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3",
        className,
      )}
    >
      <span className="text-sm font-medium text-foreground">
        {count} selected
      </span>
      <div className="flex flex-wrap gap-2">{actions}</div>
      <Button variant="ghost" size="sm" className="ml-auto" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
