import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LifecycleWidget({
  items,
}: {
  items: Array<{ label: string; count: number; delta: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Lifecycle Mission Control</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <div className="mt-1 flex items-end justify-between">
                <p className="text-2xl font-semibold">{item.count}</p>
                <Badge variant={item.delta >= 0 ? "success" : "destructive"}>
                  {item.delta >= 0 ? `+${item.delta}%` : `${item.delta}%`}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
