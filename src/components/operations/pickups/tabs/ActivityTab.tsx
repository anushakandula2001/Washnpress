import * as React from "react";
import { Activity, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ActivityTab({
  events,
  auditLogs,
}: {
  events: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
}) {
  const combined = [...events, ...auditLogs].sort((a, b) => {
    return new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime();
  });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Order Activity Timeline
        </h3>
      </div>

      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {combined.map((item, index) => {
          const isAudit = "action" in item;
          const title = isAudit ? String(item.action) : String(item.event_type);
          const time = new Date(String(item.created_at));
          
          let description = "";
          if (isAudit) {
            description = `Action on ${item.entity_name} (${item.entity_id})`;
          } else {
            try {
              description = JSON.stringify(item.event_payload);
              // Clean up display slightly if it's simple JSON
              if (description === "{}" || description === "null") description = "";
            } catch {
              // ignore
            }
          }

          return (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {isAudit ? <Activity className="w-4 h-4" /> : <Clock className="w-4 h-4 text-primary" />}
              </div>
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm capitalize">{title.replace(/_/g, " ")}</h4>
                      <time className="text-xs text-muted-foreground font-mono">
                        {time.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      </time>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {time.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-2 rounded-md break-all">
                        {description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}

        {combined.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
