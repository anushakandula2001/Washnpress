"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { StatusBadge } from "./StatusBadge";
import type { SocietyOperator } from "./types";

export function SocietyOperators({
  operators,
  onAssign,
}: {
  operators: SocietyOperator[];
  onAssign: () => void;
}) {
  if (operators.length === 0) {
    return (
      <EmptyState
        title="No operators assigned"
        description="Assign an operator to handle pickups and deliveries for this society."
        actions={<Button size="sm" onClick={onAssign}>Assign Operator</Button>}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Assigned Operators</CardTitle>
        <Button size="sm" variant="outline" onClick={onAssign}>Assign Another</Button>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {operators.map((o) => (
          <Link
            key={o.id}
            href={`/admin/operators/${o.id}`}
            className="rounded-lg border border-border p-4 no-underline transition hover:border-primary/40 hover:bg-muted/30"
          >
            <p className="font-medium">{o.full_name}</p>
            <p className="text-sm text-muted-foreground">{o.operator_code} · +91 {o.phone}</p>
            <div className="mt-2"><StatusBadge status={o.status} /></div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
