"use client";

import { Users } from "lucide-react";

export function OperatorResidents({ data }: { data: Record<string, unknown> }) {
  const stats = (data.stats as Record<string, number>) ?? {};
  const societies = (data.societies as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total Residents</p>
          <p className="text-2xl font-bold text-primary">{stats.residents ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Societies</p>
          <p className="text-2xl font-bold">{societies.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <Users className="h-4 w-4 text-primary" />
          Residents by Society
        </h4>
        {societies.length === 0 ? (
          <p className="text-sm text-muted-foreground">Assign societies to view residents.</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {stats.residents ?? 0} residents across {societies.length} societ
            {societies.length === 1 ? "y" : "ies"}. Open a society page for detailed resident lists.
          </p>
        )}
      </div>
    </div>
  );
}
