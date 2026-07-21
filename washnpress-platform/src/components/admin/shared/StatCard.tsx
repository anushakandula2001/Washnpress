import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  accent = "primary",
  onClick,
  className,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  accent?: "primary" | "green" | "gold" | "blue" | "orange" | "red";
  onClick?: () => void;
  className?: string;
}) {
  const accents = {
    primary: "bg-primary/10 text-primary",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    gold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    blue: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const Wrapper = onClick ? "button" : "div";

  return (
    <Card
      className={cn(
        "group border-border/70 bg-card/90 shadow-[0_18px_45px_-35px_rgba(0,77,77,0.65)] backdrop-blur-sm transition-all duration-200",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg",
        className,
      )}
    >
      <CardContent className="p-5">
        <Wrapper
          type={onClick ? "button" : undefined}
          className="w-full text-left"
          onClick={onClick}
        >
          <div className="flex items-start justify-between gap-3">
            <div className={cn("rounded-xl p-2.5 transition-transform group-hover:scale-105", accents[accent])}>
              <Icon className="h-5 w-5" />
            </div>
            {typeof trend === "number" && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  trend >= 0 ? "text-emerald-600" : "text-red-500",
                )}
              >
                {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {trend >= 0 ? "+" : ""}
                {trend}%
              </div>
            )}
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground md:text-3xl">{value}</p>
          {trendLabel && <p className="mt-1 text-xs text-muted-foreground">{trendLabel}</p>}
        </Wrapper>
      </CardContent>
    </Card>
  );
}
