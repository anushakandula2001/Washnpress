"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { DeliveryRow } from "./types";

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RescheduleDeliveryDialog({
  open,
  onOpenChange,
  delivery,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: DeliveryRow | null;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const [scheduledFor, setScheduledFor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setScheduledFor(toLocalInputValue(delivery?.scheduled_for));
  }, [open, delivery]);

  async function reschedule() {
    if (!delivery || !scheduledFor) {
      toast("Select a new delivery time", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/deliveries", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: delivery.id,
          scheduledFor: new Date(scheduledFor).toISOString(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Reschedule failed");
      toast("Delivery rescheduled", "success");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Reschedule failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Delivery</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Update the scheduled delivery window for {delivery?.order_code ?? "this order"}.
          </p>
        </DialogHeader>
        <div>
          <label className="mb-1 block text-sm font-medium">New scheduled time</label>
          <Input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void reschedule()} disabled={saving}>
            {saving ? "Saving…" : "Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
