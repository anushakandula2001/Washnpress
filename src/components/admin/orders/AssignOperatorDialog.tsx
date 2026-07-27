"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import type { OperatorOpt } from "./types";

export function AssignOperatorDialog({
  open,
  onOpenChange,
  societyId,
  societyName,
  orderCode,
  onAssigned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  societyId: string;
  societyName: string;
  orderCode?: string;
  onAssigned: () => void;
}) {
  const { toast } = useToast();
  const [operators, setOperators] = useState<OperatorOpt[]>([]);
  const [operatorId, setOperatorId] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    void fetch("/api/admin/operators", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setOperators((d.operators as OperatorOpt[]) ?? []))
      .catch(() => null);
    setOperatorId("");
    setReplaceExisting(false);
  }, [open]);

  async function handleAssign() {
    if (!operatorId) {
      toast("Select an operator", "error");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        operatorId,
        transferSocietyId: societyId,
      };
      if (replaceExisting) {
        body.replaceSocietyId = societyId;
      }
      const res = await fetch("/api/admin/operators", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Assignment failed");
      toast(
        `Operator assigned to ${societyName}${orderCode ? ` for ${orderCode}` : ""}`,
        "success",
      );
      onOpenChange(false);
      onAssigned();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Assignment failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={`Assign Operator${orderCode ? ` — ${orderCode}` : ""}`}>
        <p className="mb-4 text-sm text-muted-foreground">
          Assign an operator to {societyName} via society assignment. This applies to all orders in the
          society.
        </p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Operator</label>
            <select className={selectClass} value={operatorId} onChange={(e) => setOperatorId(e.target.value)}>
              <option value="">Select operator…</option>
              {operators
                .filter((o) => o.status !== "inactive")
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.operator_code ?? "—"} · {o.full_name}
                  </option>
                ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="rounded border-input"
            />
            Replace existing operator assignment for this society
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleAssign()} disabled={submitting}>
            {submitting ? "Assigning…" : "Assign Operator"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
