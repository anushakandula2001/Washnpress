"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import type { SocietyOpt } from "./types";

export function AssignSocietyDialog({
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
  const [selected, setSelected] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const available = societies.filter((s) => !assignedIds.includes(s.id));

  async function assign() {
    if (!operatorId || !selected) {
      toast("Select a society to assign", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/operators", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatorId, transferSocietyId: selected }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Assign failed");
      toast("Society assigned successfully", "success");
      setSelected("");
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
          <DialogTitle>Assign Society</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add a society to {operatorName ?? "this operator"}&apos;s portfolio.
          </p>
        </DialogHeader>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">All societies are already assigned.</p>
          ) : (
            available.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/30 hover:bg-primary/5"
              >
                <Checkbox checked={selected === s.id} onCheckedChange={() => setSelected(s.id)} />
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  {s.city && <p className="text-xs text-muted-foreground">{s.city}</p>}
                </div>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={saving || !selected} onClick={() => void assign()}>
            {saving ? "Assigning…" : "Assign Society"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
