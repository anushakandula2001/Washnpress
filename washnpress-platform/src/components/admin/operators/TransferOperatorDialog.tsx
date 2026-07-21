"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { SocietyOpt } from "./types";

export function TransferOperatorDialog({
  open,
  onOpenChange,
  operatorId,
  operatorName,
  societies,
  assignedIds,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operatorId: string | null;
  operatorName?: string;
  societies: SocietyOpt[];
  assignedIds: string[];
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const [fromSocietyId, setFromSocietyId] = useState("");
  const [toSocietyId, setToSocietyId] = useState("");
  const [saving, setSaving] = useState(false);

  const assigned = societies.filter((s) => assignedIds.includes(s.id));
  const available = societies.filter((s) => !assignedIds.includes(s.id));

  async function transfer() {
    if (!operatorId || !fromSocietyId || !toSocietyId) {
      toast("Select both source and destination societies", "error");
      return;
    }
    if (fromSocietyId === toSocietyId) {
      toast("Source and destination must differ", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/operators", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorId,
          transferSocietyId: toSocietyId,
          replaceSocietyId: fromSocietyId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Transfer failed");
      toast("Society transferred successfully", "success");
      setFromSocietyId("");
      setToSocietyId("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Transfer failed", "error");
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Society</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Replace a society assignment for {operatorName ?? "this operator"}.
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="text-muted-foreground">From (current)</span>
            <select
              className={`${selectClass} mt-1`}
              value={fromSocietyId}
              onChange={(e) => setFromSocietyId(e.target.value)}
            >
              <option value="">Select society to remove</option>
              {assigned.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">To (new)</span>
            <select
              className={`${selectClass} mt-1`}
              value={toSocietyId}
              onChange={(e) => setToSocietyId(e.target.value)}
            >
              <option value="">Select society to add</option>
              {available.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={saving || !fromSocietyId || !toSocietyId} onClick={() => void transfer()}>
            {saving ? "Transferring…" : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
