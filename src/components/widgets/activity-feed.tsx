import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityFeed({
  items,
}: {
  items: Array<{ time: string; text: string; type: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const Icon =
            item.type === "success" ? CheckCircle2 : item.type === "warning" ? AlertCircle : Info;

          return (
            <div key={`${item.time}-${item.text}`} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <Icon className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.time} ago</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
