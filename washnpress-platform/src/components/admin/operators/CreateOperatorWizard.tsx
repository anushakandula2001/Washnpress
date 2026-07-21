"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api } from "@/frontend/api-client";
import {
  emptyCreateOperatorForm,
  type CreateOperatorForm,
  type SocietyOpt,
} from "./types";

type Step = 1 | 2 | 3 | 4;

export function CreateOperatorWizard({
  open,
  onOpenChange,
  societies,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  societies: SocietyOpt[];
  onSuccess?: (operatorCode: string | null) => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<CreateOperatorForm>(emptyCreateOperatorForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep(1);
    setForm(emptyCreateOperatorForm);
    setError(null);
  }

  function canStep1() {
    return Boolean(form.fullName.trim() && form.phone.length === 10);
  }

  function canStep2() {
    return Boolean(form.addressLine1.trim() && form.city.trim() && form.state.trim() && form.pincode.length === 6);
  }

  function canStep3() {
    return form.societyIds.length > 0;
  }

  function toggleSociety(id: string) {
    setForm((f) => ({
      ...f,
      societyIds: f.societyIds.includes(id) ? f.societyIds.filter((s) => s !== id) : [...f.societyIds, id],
    }));
  }

  async function create() {
    if (saving || !canStep1() || !canStep2() || !canStep3()) {
      setError("Please complete all required fields");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = (await api.admin.users.create({
        phone: form.phone,
        fullName: form.fullName.trim(),
        email: form.email || undefined,
        roles: ["operator"],
        status: form.status,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        addressLine1: form.addressLine1.trim(),
        societyIds: form.societyIds,
      })) as { operatorCode?: string | null; user?: { operatorCode?: string | null } };

      const code = res.operatorCode ?? res.user?.operatorCode ?? null;
      toast(
        code ? `Operator created — ID: ${code}` : "Operator created successfully",
        "success",
      );
      reset();
      onOpenChange(false);
      onSuccess?.(code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create operator";
      setError(msg);
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  const stepLabels = ["Basic Info", "Address", "Societies", "Review"];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Operator</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Step {step} of 4 — operators cannot self-register
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {stepLabels.map((label, i) => (
              <Badge key={label} variant={step === i + 1 ? "default" : "secondary"}>
                {i + 1}. {label}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              <span className="text-muted-foreground">Full Name *</span>
              <Input
                className="mt-1"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Mobile Number *</span>
              <Input
                className="mt-1"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Email</span>
              <Input
                className="mt-1"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Role</span>
              <Input className="mt-1" value="Operator" disabled />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Status</span>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "active" | "inactive" })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              <span className="text-muted-foreground">Address *</span>
              <textarea
                className="mt-1 min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.addressLine1}
                onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">City *</span>
              <Input
                className="mt-1"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">State *</span>
              <Input
                className="mt-1"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Pincode *</span>
              <Input
                className="mt-1"
                value={form.pincode}
                onChange={(e) =>
                  setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                }
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {societies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No societies available. Create a society first.</p>
            ) : (
              societies.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/30 hover:bg-primary/5"
                >
                  <Checkbox
                    checked={form.societyIds.includes(s.id)}
                    onCheckedChange={() => toggleSociety(s.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    {s.city && <p className="text-xs text-muted-foreground">{s.city}</p>}
                  </div>
                </label>
              ))
            )}
            <p className="text-xs text-muted-foreground">{form.societyIds.length} societ(ies) selected</p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
            {[
              ["Name", form.fullName],
              ["Mobile", `+91 ${form.phone}`],
              ["Email", form.email || "—"],
              ["Operator ID", "Assigned on create (OPR-######)"],
              ["Address", form.addressLine1],
              ["City", form.city],
              ["State", form.state],
              ["Pincode", form.pincode],
              ["Societies", form.societyIds.map((id) => societies.find((s) => s.id === id)?.name ?? id).join(", ")],
              ["Status", form.status],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between gap-4 border-b border-border/60 py-1.5 last:border-0"
              >
                <span className="text-muted-foreground">{k}</span>
                <span className="max-w-[60%] text-right font-medium">{v}</span>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" disabled={saving} onClick={() => setStep((s) => (s - 1) as Step)}>
              Back
            </Button>
          )}
          {step < 4 && (
            <Button
              disabled={
                saving ||
                (step === 1 && !canStep1()) ||
                (step === 2 && !canStep2()) ||
                (step === 3 && !canStep3())
              }
              onClick={() => {
                setError(null);
                setStep((s) => (s + 1) as Step);
              }}
            >
              Continue
            </Button>
          )}
          {step === 4 && (
            <Button disabled={saving || !canStep1() || !canStep2() || !canStep3()} onClick={() => void create()}>
              {saving ? "Creating…" : "Create Operator"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
