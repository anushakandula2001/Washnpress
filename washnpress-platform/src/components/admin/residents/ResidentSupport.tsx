"use client";

import { StatusBadge } from "./StatusBadge";

export function ResidentSupport({ data }: { data: Record<string, unknown> }) {
  const tickets = (data.tickets as Array<Record<string, unknown>>) ?? [];
  const open = tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length;
  const resolved = tickets.length - open;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Open</p>
          <p className="text-xl font-bold">{open}</p>
        </div>
        <div className="rounded-lg border border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Resolved</p>
          <p className="text-xl font-bold">{resolved}</p>
        </div>
      </div>
      <div className="space-y-2">
        {tickets.map((t) => (
          <div key={String(t.id)} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <div>
              <p className="font-medium">{String(t.ticket_code)}</p>
              <p className="text-xs text-muted-foreground">{String(t.category)}</p>
            </div>
            <StatusBadge status={String(t.status)} />
          </div>
        ))}
        {tickets.length === 0 && <p className="text-sm text-muted-foreground">No support tickets</p>}
      </div>
    </div>
  );
}
