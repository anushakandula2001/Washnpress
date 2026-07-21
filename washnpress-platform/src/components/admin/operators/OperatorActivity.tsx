"use client";

import { Activity, Clock } from "lucide-react";

export function OperatorActivity({ data }: { data: Record<string, unknown> }) {
  const op = data.operator as Record<string, unknown>;

  const events = [
    {
      label: "Account Created",
      at: op.created_at ?? op.joined_at,
      detail: `Operator ${String(op.operator_code ?? "")} registered`,
    },
    {
      label: "Last Login",
      at: op.last_login_at,
      detail: op.last_login_at ? "Logged in via OTP" : "Never logged in",
    },
    {
      label: "Status",
      at: op.updated_at ?? op.created_at,
      detail: `Current status: ${String(op.status ?? "active")}`,
    },
  ].filter((e) => e.at || e.label === "Last Login");

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <Activity className="h-4 w-4 text-primary" />
          Activity Timeline
        </h4>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((e, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{e.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.at ? new Date(String(e.at)).toLocaleString() : "—"} · {e.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
