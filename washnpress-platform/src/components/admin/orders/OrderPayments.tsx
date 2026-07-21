"use client";

import { Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/EmptyState";

export function OrderPayments({
  payments,
  refunds,
}: {
  payments: Array<Record<string, unknown>>;
  refunds: Array<Record<string, unknown>>;
}) {
  if (!payments.length && !refunds.length) {
    return (
      <EmptyState
        icon={Banknote}
        title="No payment records"
        description="Payments and refunds linked to this order will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {payments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-medium">Transactions</p>
            <ul className="space-y-2 text-sm">
              {payments.map((p) => (
                <li key={String(p.id)} className="rounded-lg border border-border p-3">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium capitalize">{String(p.type)}</span>
                    <span>₹{Number(p.amount_inr ?? 0).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {String(p.status)} · {new Date(String(p.created_at)).toLocaleString()}
                    {p.gateway_ref ? ` · ${String(p.gateway_ref)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {refunds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-medium">Refunds</p>
            <ul className="space-y-2 text-sm">
              {refunds.map((r) => (
                <li key={String(r.id)} className="rounded-lg border border-border p-3">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{String(r.status)}</span>
                    <span>₹{Number(r.amount_inr ?? 0).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{String(r.reason)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(String(r.created_at)).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
