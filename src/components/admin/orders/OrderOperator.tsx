"use client";

import { Truck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/shared/EmptyState";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function OrderOperator({
  order,
  operators,
  onAssign,
}: {
  order: Record<string, unknown>;
  operators: Array<Record<string, unknown>>;
  onAssign?: () => void;
}) {
  const assigned =
    operators.find((o) => o.id === order.operator_id) ??
    (order.operator_name
      ? { full_name: order.operator_name, operator_code: order.operator_code, phone: order.operator_phone }
      : operators[0]);

  if (!assigned && !operators.length) {
    return (
      <EmptyState
        icon={Users}
        title="No staff assigned"
        description="Assign staff to this order to handle processing and logistics."
        actions={
          onAssign ? (
            <Button size="sm" onClick={onAssign}>
               Assign Staff
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Assigned Staff
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {assigned && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{String(assigned.full_name ?? "—")}</p>
                  <p className="text-sm text-muted-foreground">{String(assigned.operator_code ?? "Operator")}</p>
                </div>
              </div>
              <InfoRow label="Phone" value={assigned.phone ? `+91 ${String(assigned.phone)}` : "—"} />
              <InfoRow label="Role" value={assigned.role ? String(assigned.role) : "Field Operator"} />
              <InfoRow label="Current Stage" value={String(order.status ?? "Unknown")} />
              <InfoRow label="Last Updated" value={order.updated_at ? new Date(String(order.updated_at)).toLocaleString() : "—"} />
            </>
          )}
          
          {operators.length > 1 && (
            <div className="rounded-lg border border-border p-3 mt-4">
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Society Team</p>
              <ul className="space-y-1 text-sm">
                {operators.map((o) => (
                  <li key={String(o.id)}>
                    {String(o.operator_code ?? "")} · {String(o.full_name)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {onAssign && (
            <Button variant="outline" size="sm" onClick={onAssign} className="w-full mt-2">
              {assigned ? "Reassign Staff" : "Assign Staff"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
