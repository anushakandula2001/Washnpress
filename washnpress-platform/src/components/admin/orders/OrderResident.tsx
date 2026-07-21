"use client";

import Link from "next/link";
import { User, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function OrderResident({ order }: { order: Record<string, unknown> }) {
  const residentId = String(order.resident_uuid ?? order.resident_id ?? "");

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{String(order.resident_name ?? "—")}</p>
            <p className="text-sm text-muted-foreground">
              {order.resident_code ? String(order.resident_code) : `ID: ${residentId.slice(0, 8)}…`}
            </p>
          </div>
        </div>
        <InfoRow
          label="Phone"
          value={
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              +91 {String(order.resident_phone ?? "—")}
            </span>
          }
        />
        <InfoRow label="Society" value={String(order.society_name ?? "—")} />
        <InfoRow
          label="Unit"
          value={[order.tower_block, order.unit_number].filter(Boolean).join(" · ") || "—"}
        />
        {residentId && (
          <Link
            href={`/admin/residents?id=${residentId}`}
            className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
          >
            Open Resident Profile
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
