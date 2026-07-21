"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatUnit } from "./types";

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function OrderOverview({
  order,
  row,
}: {
  order: Record<string, unknown>;
  row?: { order_code: string; status: string; society_name: string; resident_name: string };
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <InfoRow
          label="Order Code"
          value={<span className="font-mono text-primary">{String(order.order_code ?? row?.order_code ?? "—")}</span>}
        />
        <InfoRow label="Status" value={<OrderStatusBadge status={String(order.status ?? row?.status ?? "")} />} />
        <InfoRow
          label="Garments"
          value={`${order.pickup_garment_count ?? "—"}${order.delivered_garment_count != null ? ` delivered (${order.delivered_garment_count})` : ""}`}
        />
        <InfoRow label="QC Status" value={String(order.qc_status ?? "—")} />
        <InfoRow
          label="Scheduled"
          value={order.scheduled_for ? new Date(String(order.scheduled_for)).toLocaleString() : "—"}
        />
        <InfoRow
          label="Created"
          value={order.created_at ? new Date(String(order.created_at)).toLocaleString() : "—"}
        />
        <InfoRow
          label="Last Updated"
          value={order.updated_at ? new Date(String(order.updated_at)).toLocaleString() : "—"}
        />
        <InfoRow label="Resident" value={String(order.resident_name ?? row?.resident_name ?? "—")} />
        <InfoRow label="Society" value={String(order.society_name ?? row?.society_name ?? "—")} />
        <InfoRow
          label="Unit"
          value={formatUnit({
            tower_block: order.tower_block ? String(order.tower_block) : null,
            unit_number: order.unit_number ? String(order.unit_number) : null,
          })}
        />
        {order.qr_batch_code ? (
          <InfoRow label="QR Batch" value={String(order.qr_batch_code)} />
        ) : null}
      </CardContent>
    </Card>
  );
}
