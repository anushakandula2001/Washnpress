"use client";

import { UserCog } from "lucide-react";

export function OperatorExecutives({ data }: { data: Record<string, unknown> }) {
  const op = data.operator as Record<string, unknown>;
  const societies = (data.societies as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <UserCog className="h-4 w-4 text-primary" />
          Field Executives
        </h4>
        <p className="text-sm text-muted-foreground">
          Executives reporting to <strong>{String(op.full_name)}</strong> in assigned societies will appear here
          once the executive assignment module is linked.
        </p>
        {societies.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {societies.map((s) => (
              <li key={String(s.id)} className="rounded-md bg-muted/40 px-2 py-1">
                {String(s.name)} — no executives assigned
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
