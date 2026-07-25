"use client";

import { StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/EmptyState";

export function OrderNotes({
  order,
  tickets,
}: {
  order: Record<string, unknown>;
  tickets: Array<Record<string, unknown>>;
}) {
  const specialInstructions = order.special_instructions ? String(order.special_instructions) : null;
  const qcReason = order.qc_reason ? String(order.qc_reason) : null;
  const hasNotes = specialInstructions || qcReason || tickets.length > 0;

  if (!hasNotes) {
    return (
      <EmptyState
        icon={StickyNote}
        title="No notes"
        description="Special instructions, QC notes, and support tickets will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {specialInstructions && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-medium">Special Instructions</p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{specialInstructions}</p>
          </CardContent>
        </Card>
      )}
      {qcReason && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-medium">QC Notes</p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{qcReason}</p>
          </CardContent>
        </Card>
      )}
      {tickets.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-medium">Support Tickets</p>
            <ul className="space-y-2 text-sm">
              {tickets.map((t) => (
                <li key={String(t.id)} className="rounded-lg border border-border p-3">
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-primary">{String(t.ticket_code)}</span>
                    <span className="text-xs capitalize">{String(t.status)}</span>
                  </div>
                  <p className="mt-1 font-medium">{String(t.category)}</p>
                  <p className="text-muted-foreground">{String(t.description)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(String(t.created_at)).toLocaleString()}
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
