import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Checkbox({
  checked,
  onCheckedChange,
  className,
  id,
  "aria-label": ariaLabel,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input bg-background transition-colors",
        checked && "border-primary bg-primary text-primary-foreground",
        className,
      )}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {checked ? <Check className="h-3 w-3" /> : null}
    </button>
  );
}
