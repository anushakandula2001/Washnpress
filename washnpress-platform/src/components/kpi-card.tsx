import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function KpiCard({
  label,
  value,
  trend,
  footnote,
}: {
  label: string;
  value: string;
  trend?: number;
  footnote?: string;
}) {
  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_18px_45px_-35px_rgba(0,77,77,0.65)] backdrop-blur-sm">
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          {typeof trend === "number" ? (
            <Badge variant={trend >= 0 ? "success" : "destructive"}>
              {trend >= 0 ? `+${trend}%` : `${trend}%`}
            </Badge>
          ) : null}
        </div>
        <p className="text-2xl font-semibold text-foreground md:text-3xl">{value}</p>
        {footnote ? <p className="text-xs text-muted-foreground">{footnote}</p> : null}
      </CardContent>
    </Card>
  );
}
