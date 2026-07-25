"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OperatorSocieties({
  data,
  onAssign,
  onTransfer,
}: {
  data: Record<string, unknown>;
  onAssign?: () => void;
  onTransfer?: () => void;
}) {
  const societies = (data.societies as Array<Record<string, unknown>>) ?? [];
  const towers = (data.towers as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onAssign}>
          Assign Society
        </Button>
        <Button size="sm" variant="outline" onClick={onTransfer}>
          Transfer Society
        </Button>
      </div>

      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <Building2 className="h-4 w-4 text-primary" />
          Assigned Societies ({societies.length})
        </h4>
        {societies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No societies assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {societies.map((s) => (
              <Link
                key={String(s.id)}
                href={`/admin/societies/${String(s.id)}`}
                className="block rounded-lg border border-border/60 p-3 text-sm no-underline transition hover:border-primary/30 hover:bg-primary/5"
              >
                <p className="font-medium text-foreground">{String(s.name)}</p>
                <p className="text-xs text-muted-foreground">
                  {String(s.city ?? "—")}, {String(s.state ?? "—")} · {String(s.pincode ?? "")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{String(s.address_line_1 ?? "")}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-3 font-medium">Towers ({towers.length})</h4>
        {towers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No towers in assigned societies.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {towers.map((t) => (
              <li key={String(t.id)} className="flex justify-between border-b border-border/40 py-1.5 last:border-0">
                <span>{String(t.name)}</span>
                <span className="text-muted-foreground">{String(t.society_name)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
