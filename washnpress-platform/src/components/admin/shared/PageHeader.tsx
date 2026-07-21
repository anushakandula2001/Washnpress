import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function HeaderAction({
  icon: Icon,
  label,
  onClick,
  variant = "outline",
  disabled,
}: {
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  return (
    <Button variant={variant} size="sm" onClick={onClick} disabled={disabled} className="gap-1.5">
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Button>
  );
}
