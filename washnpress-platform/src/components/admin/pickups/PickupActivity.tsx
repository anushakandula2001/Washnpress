"use client";

import { Activity } from "lucide-react";

export function PickupActivity({ data }: { data: Record<string, unknown> }) {
  const logs = (data.activity as Array<Record<string, unknown>>) ?? [];

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity recorded for this pickup.</p>;
  }

  return (
    <div className="relative space-y-0 pl-6">
      <div className="absolute bottom-0 left-[11px] top-0 w-px bg-border" />
      {logs.map((l) => (
        <div key={String(l.id)} className="relative pb-6">
          <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card">
            <Activity className="h-3 w-3 text-primary" />
          </div>
          <p className="text-sm font-medium capitalize">{String(l.action ?? "").replace(/_/g, " ")}</p>
          <p className="text-xs text-muted-foreground">
            {l.created_at ? new Date(String(l.created_at)).toLocaleString() : "—"} · {String(l.actor_role ?? "system")}
          </p>
          {l.entity_name != null && l.entity_name !== "" ? (
            <p className="text-xs text-muted-foreground">{String(l.entity_name)}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
