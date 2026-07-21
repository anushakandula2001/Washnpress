"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/admin/shared/Avatar";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { User } from "lucide-react";

export function PickupOperatorTab({
  data,
  onAssignOperator,
}: {
  data: Record<string, unknown>;
  onAssignOperator?: () => void;
}) {
  const operators = (data.operators as Array<Record<string, unknown>>) ?? [];
  const p = data.pickup as Record<string, unknown>;

  if (operators.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="No operator assigned"
        description={`No operator is linked to ${String(p.society_name)}. Assign one to handle this pickup.`}
        actions={
          onAssignOperator && (
            <Button size="sm" onClick={onAssignOperator}>
              Assign Operator
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {operators.map((op) => (
        <Card key={String(op.id)}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Avatar name={String(op.full_name)} size="md" />
                <div>
                  <CardTitle className="text-base">{String(op.full_name)}</CardTitle>
                  <p className="font-mono text-sm text-primary">{String(op.operator_code ?? "—")}</p>
                </div>
              </div>
              <StatusBadge status={String(op.status ?? "active")} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p>+91 {String(op.phone ?? "—")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p>{String(op.email ?? "—")}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {onAssignOperator && (
        <Button variant="outline" size="sm" onClick={onAssignOperator}>
          Change Operator
        </Button>
      )}
    </div>
  );
}
