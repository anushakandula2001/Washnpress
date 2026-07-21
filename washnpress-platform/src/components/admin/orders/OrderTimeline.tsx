"use client";

import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/EmptyState";

export function OrderTimeline({ events }: { events: Array<Record<string, unknown>> }) {
  if (!events.length) {
    return (
      <EmptyState
        icon={Clock}
        title="No timeline events"
        description="Status changes and system events will appear here as the order progresses."
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <ul className="relative space-y-0 border-l-2 border-primary/20 pl-4">
          {events.map((e, i) => (
            <li key={String(e.id)} className="relative pb-6 last:pb-0">
              <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
              <p className="font-medium capitalize">{String(e.event_type).replace(/_/g, " ")}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(String(e.created_at)).toLocaleString()}
              </p>
              {e.event_payload && Object.keys(e.event_payload as object).length > 0 ? (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-muted/40 p-2 text-xs">
                  {JSON.stringify(e.event_payload, null, 2)}
                </pre>
              ) : null}
              {i < events.length - 1 ? null : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
