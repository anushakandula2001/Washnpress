"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import {
  emptyCreateSocietyForm,
  type CreateSocietyForm,
  type OperatorOpt,
} from "./types";

const STEPS = [
  "Basic Info",
  "Address",
  "Assign Operator",
  "Pickup Slots",
  "Default Settings",
  "Review",
];

export function CreateSocietyWizard({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateSocietyForm>(emptyCreateSocietyForm);
  const [operators, setOperators] = useState<OperatorOpt[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    void fetch("/api/admin/operators", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setOperators((d.operators as OperatorOpt[]) ?? []))
      .catch(() => null);
  }, [open]);

  function patch(p: Partial<CreateSocietyForm>) {
    setForm((f) => ({ ...f, ...p }));
  }

  function reset() {
    setStep(0);
    setForm(emptyCreateSocietyForm);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/societies", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          city: form.city,
          state: form.state,
          addressLine1: form.addressLine1 || undefined,
          pincode: form.pincode || undefined,
          status: form.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to create society");

      const societyId = (data.society as { id: string }).id;

      if (!form.assignLater && form.operatorId) {
        await fetch("/api/admin/operators", {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operatorId: form.operatorId, transferSocietyId: societyId }),
        });
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const slotDate = tomorrow.toISOString().slice(0, 10);

      for (const slot of form.slots.filter((s) => s.enabled)) {
        await fetch("/api/admin/slots", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            societyId,
            slotDate,
            slotWindow: slot.slotWindow,
            startTime: slot.startTime,
            endTime: slot.endTime,
            capacityTotal: slot.capacityTotal,
          }),
        });
      }

      toast(`Society "${form.name}" created successfully`, "success");
      onOpenChange(false);
      reset();
      onCreated();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Create failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-2xl" title="Create Society">
        <div className="mb-6 flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <Badge key={label} variant={i === step ? "default" : i < step ? "success" : "secondary"}>
              {i + 1}. {label}
            </Badge>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Society Name *</label>
              <Input value={form.name} onChange={(e) => patch({ name: e.target.value })} placeholder="e.g. Green Valley Apartments" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select className={selectClass} value={form.status} onChange={(e) => patch({ status: e.target.value as CreateSocietyForm["status"] })}>
                <option value="Pending Setup">Pending Setup (Handover to Operations)</option>
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Address Line 1</label>
              <Input value={form.addressLine1} onChange={(e) => patch({ addressLine1: e.target.value })} placeholder="Street address" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">City *</label>
                <Input value={form.city} onChange={(e) => patch({ city: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">State *</label>
                <Input value={form.state} onChange={(e) => patch({ state: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Pincode</label>
              <Input value={form.pincode} onChange={(e) => patch({ pincode: e.target.value })} maxLength={6} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.assignLater} onCheckedChange={(c) => patch({ assignLater: c, operatorId: c ? "" : form.operatorId })} />
              Assign operator later
            </label>
            {!form.assignLater && (
              <div>
                <label className="mb-1 block text-sm font-medium">Select Operator</label>
                <select className={selectClass} value={form.operatorId} onChange={(e) => patch({ operatorId: e.target.value })}>
                  <option value="">Choose operator…</option>
                  {operators.filter((o) => o.status === "active").map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.operator_code ?? "—"} · {o.full_name} · +91 {o.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Configure default pickup slot templates (created for tomorrow).</p>
            {form.slots.map((slot, i) => (
              <div key={slot.slotWindow} className="rounded-lg border border-border p-3">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={slot.enabled}
                    onCheckedChange={(c) => {
                      const slots = [...form.slots];
                      slots[i] = { ...slot, enabled: c };
                      patch({ slots });
                    }}
                  />
                  {slot.slotWindow}
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input type="time" value={slot.startTime} onChange={(e) => {
                    const slots = [...form.slots];
                    slots[i] = { ...slot, startTime: e.target.value };
                    patch({ slots });
                  }} />
                  <Input type="time" value={slot.endTime} onChange={(e) => {
                    const slots = [...form.slots];
                    slots[i] = { ...slot, endTime: e.target.value };
                    patch({ slots });
                  }} />
                  <Input type="number" min={1} value={slot.capacityTotal} onChange={(e) => {
                    const slots = [...form.slots];
                    slots[i] = { ...slot, capacityTotal: Number(e.target.value) };
                    patch({ slots });
                  }} placeholder="Capacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Default Turnaround (hours)</label>
              <Input type="number" min={12} value={form.defaultTurnaroundHours} onChange={(e) => patch({ defaultTurnaroundHours: Number(e.target.value) })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.allowSubscriptions} onCheckedChange={(c) => patch({ allowSubscriptions: c })} />
              Allow subscription plans for residents
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.notifyResidents} onCheckedChange={(c) => patch({ notifyResidents: c })} />
              Send launch notification to interested residents
            </label>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p><strong>Name:</strong> {form.name}</p>
            <p><strong>Status:</strong> {form.status}</p>
            <p><strong>Address:</strong> {form.addressLine1 || "—"}, {form.city}, {form.state} {form.pincode}</p>
            <p><strong>Operator:</strong> {form.assignLater ? "Assign later" : operators.find((o) => o.id === form.operatorId)?.full_name ?? "—"}</p>
            <p><strong>Pickup Slots:</strong> {form.slots.filter((s) => s.enabled).map((s) => s.slotWindow).join(", ") || "None"}</p>
            <p><strong>Turnaround:</strong> {form.defaultTurnaroundHours}h · Subscriptions: {form.allowSubscriptions ? "Yes" : "No"}</p>
          </div>
        )}

        <div className="mt-6 flex justify-between gap-2">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 0 && !form.name) || (step === 1 && (!form.city || !form.state))}
            >
              Next
            </Button>
          ) : (
            <Button onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? "Creating…" : "Create Society"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
