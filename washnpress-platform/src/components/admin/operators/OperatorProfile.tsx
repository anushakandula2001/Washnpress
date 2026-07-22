"use client";

import { StatusBadge } from "./StatusBadge";
import { PermissionsCard } from "./PermissionsCard";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{value}</span>
    </div>
  );
}

export function OperatorProfile({ data }: { data: Record<string, unknown> }) {
  const op = data.operator as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <Field label="Operator ID" value={String(op.operator_code ?? op.id)} />
        <Field label="Full Name" value={String(op.full_name ?? "—")} />
        <Field label="Phone" value={`+91 ${String(op.phone)}`} />
        <Field label="Email" value={String(op.email ?? op.user_email ?? "—")} />
        <Field label="Address" value={String(op.address_line_1 ?? "—")} />
        <Field
          label="Location"
          value={`${String(op.city ?? "—")}, ${String(op.state ?? "—")} ${String(op.pincode ?? "")}`}
        />
        <Field label="Status" value={<StatusBadge status={String(op.status ?? "active")} />} />
        <Field
          label="Joined"
          value={
            op.created_at || op.joined_at
              ? new Date(String(op.created_at ?? op.joined_at)).toLocaleDateString()
              : "—"
          }
        />
        <Field
          label="Last Login"
          value={op.last_login_at ? new Date(String(op.last_login_at)).toLocaleString() : "Never"}
        />
      </div>
      {/* <PermissionsCard status={String(op.status ?? "active")} /> */}
    </div>
  );
}
