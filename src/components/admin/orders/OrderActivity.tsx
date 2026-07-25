"use client";

import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/EmptyState";

type ActivityEntry = {
  id: string;
  kind: "event" | "audit";
  title: string;
  detail?: string;
  created_at: string;
};

export function OrderActivity({
  events,
  auditLogs,
}: {
  events: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
}) {
  const entries: ActivityEntry[] = [
    ...events.map((e) => ({
      id: `event-${String(e.id)}`,
      kind: "event" as const,
      title: String(e.event_type).replace(/_/g, " "),
      detail: e.event_payload ? JSON.stringify(e.event_payload) : undefined,
      created_at: String(e.created_at),
    })),
    ...auditLogs.map((a) => ({
      id: `audit-${String(a.id)}`,
      kind: "audit" as const,
      title: String(a.action),
      detail: a.metadata ? JSON.stringify(a.metadata) : undefined,
      created_at: String(a.created_at),
    })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (!entries.length) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity"
        description="Order events and admin audit logs will appear here."
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <ul className="space-y-3 text-sm">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium capitalize">{entry.title}</span>
                <span className="text-xs capitalize text-muted-foreground">{entry.kind}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(entry.created_at).toLocaleString()}
              </p>
              {entry.detail && entry.detail !== "{}" ? (
                <pre className="mt-2 overflow-x-auto rounded bg-muted/40 p-2 text-xs">{entry.detail}</pre>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
