"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { DeliveryRow, OperatorOpt } from "./types";

export function AssignOperatorDialog({
  open,
  onOpenChange,
  delivery,
  operators,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: DeliveryRow | null;
  operators: OperatorOpt[];
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const [operatorId, setOperatorId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOperatorId(delivery?.operator_id ?? "");
  }, [open, delivery]);

  const societyOperators = delivery
    ? operators
    : operators;

  async function assign() {
    if (!delivery || !operatorId) {
      toast("Select an operator", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/deliveries", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: delivery.id, operatorId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Assign failed");
      toast("Operator assigned — order marked out for delivery", "success");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Assign failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Operator</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Assign a delivery operator for {delivery?.order_code ?? "this order"}.
          </p>
        </DialogHeader>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={operatorId}
          onChange={(e) => setOperatorId(e.target.value)}
        >
          <option value="">Select operator…</option>
          {societyOperators.map((o) => (
            <option key={o.id} value={o.id}>
              {o.operator_code ? `${o.operator_code} · ` : ""}
              {o.full_name} (+91 {o.phone})
            </option>
          ))}
        </select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void assign()} disabled={saving}>
            {saving ? "Assigning…" : "Assign Operator"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
