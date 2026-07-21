"use client";

import { Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
        icon={Truck}
        title="No operator assigned"
        description="Assign an operator to this society to handle pickups and deliveries."
        actions={
          onAssign ? (
            <Button size="sm" onClick={onAssign}>
              Assign Operator
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {assigned && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">{String(assigned.full_name ?? "—")}</p>
                <p className="text-sm text-muted-foreground">{String(assigned.operator_code ?? "—")}</p>
              </div>
            </div>
            <InfoRow label="Phone" value={assigned.phone ? `+91 ${String(assigned.phone)}` : "—"} />
          </>
        )}
        {operators.length > 1 && (
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Society Operators</p>
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
          <Button variant="outline" size="sm" onClick={onAssign}>
            {assigned ? "Reassign Operator" : "Assign Operator"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
