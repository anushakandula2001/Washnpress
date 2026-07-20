"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/frontend/api-client";
import { adminNav } from "@/lib/portal-nav";

type Step = 1 | 2 | 3;

type OperatorRow = {
  id: string;
  operator_code: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  status: string;
  city?: string | null;
  societies: string[];
  residents_count?: number;
  orders_managed?: number;
  created_at?: string;
  last_login_at: string | null;
};

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  status: "active" as "active" | "inactive",
  societyName: "",
  address: "",
  towerName: "",
  flatUnit: "",
  city: "",
  state: "",
  pincode: "",
};

export default function OperatorsAdminPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState(emptyForm);
  const [operators, setOperators] = useState<OperatorRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    const ops = await api.admin.users.listOperators();
    const rows = (ops.operators as OperatorRow[]).map((o) => ({
      ...o,
      societies: Array.isArray(o.societies) ? o.societies : [],
    }));
    setOperators(rows);
  }, []);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  function canStep1() {
    return Boolean(form.fullName.trim() && form.phone.length === 10);
  }

  function canStep2() {
    return Boolean(
      form.societyName.trim() &&
        form.address.trim() &&
        form.towerName.trim() &&
        form.city.trim() &&
        form.state.trim() &&
        form.pincode.trim(),
    );
  }

  async function createOperator() {
    if (saving) return;
    if (!canStep1() || !canStep2()) {
      setError("Please complete all required fields");
      return;
    }
    setSaving(true);
    setError(null);
    setCreatedCode(null);
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
        addressLine1: form.address.trim(),
        community: {
          societyName: form.societyName.trim(),
          towerName: form.towerName.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          address: form.address.trim(),
          flatUnit: form.flatUnit.trim() || undefined,
        },
      })) as { operatorCode?: string | null; user?: { operatorCode?: string | null } };

      const code = res.operatorCode ?? res.user?.operatorCode ?? null;
      setCreatedCode(code);
      setForm(emptyForm);
      setStep(1);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create operator");
    } finally {
      setSaving(false);
    }
  }

  const filtered = operators.filter((op) => {
    if (statusFilter && op.status !== statusFilter) return false;
    if (!q.trim()) return true;
    const hay = `${op.full_name} ${op.phone} ${op.operator_code ?? ""} ${op.societies.join(" ")}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Operators"
      subtitle="Create operators and manage society assignments"
    >
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Operators</p>
            <p className="mt-1 text-2xl font-bold">{operators.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-bold">
              {operators.filter((o) => o.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Societies Covered</p>
            <p className="mt-1 text-2xl font-bold">
              {new Set(operators.flatMap((o) => o.societies)).size}
            </p>
          </CardContent>
        </Card>
      </section>

      {createdCode && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          Operator created. Operator ID: <strong>{createdCode}</strong>. They can login via OTP on
          /login.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create Operator</CardTitle>
            <CardDescription>Step {step} of 3 — operators cannot self-register</CardDescription>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3].map((s) => (
                <Badge key={s} variant={step === s ? "default" : "secondary"}>
                  {s === 1 ? "Basic" : s === 2 ? "Society" : "Review"}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
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
                  <span className="text-muted-foreground">Society Name *</span>
                  <Input
                    className="mt-1"
                    value={form.societyName}
                    onChange={(e) => setForm({ ...form, societyName: e.target.value })}
                    placeholder="Type society / community name"
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="text-muted-foreground">Address *</span>
                  <textarea
                    className="mt-1 min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </label>
                <label className="text-sm">
                  <span className="text-muted-foreground">Tower Name *</span>
                  <Input
                    className="mt-1"
                    value={form.towerName}
                    onChange={(e) => setForm({ ...form, towerName: e.target.value })}
                  />
                </label>
                <label className="text-sm">
                  <span className="text-muted-foreground">Flat / Unit</span>
                  <Input
                    className="mt-1"
                    value={form.flatUnit}
                    onChange={(e) => setForm({ ...form, flatUnit: e.target.value })}
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
                      setForm({
                        ...form,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                {[
                  ["Name", form.fullName],
                  ["Mobile", `+91 ${form.phone}`],
                  ["Email", form.email || "—"],
                  ["Operator Role", "Operator"],
                  ["Generated Operator ID", "Assigned on create (OPR-######)"],
                  ["Society", form.societyName],
                  ["Address", form.address],
                  ["Tower", form.towerName],
                  ["Flat", form.flatUnit || "—"],
                  ["City", form.city],
                  ["State", form.state],
                  ["Pincode", form.pincode],
                  ["Status", form.status],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="max-w-[60%] text-right font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {step > 1 && (
                <Button variant="outline" disabled={saving} onClick={() => setStep((s) => (s - 1) as Step)}>
                  Back
                </Button>
              )}
              {step < 3 && (
                <Button
                  disabled={
                    saving || (step === 1 && !canStep1()) || (step === 2 && !canStep2())
                  }
                  onClick={() => {
                    setError(null);
                    setStep((s) => (s + 1) as Step);
                  }}
                >
                  Continue
                </Button>
              )}
              {step === 3 && (
                <Button disabled={saving || !canStep1() || !canStep2()} onClick={() => void createOperator()}>
                  {saving ? "Creating…" : "Create Operator"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operators list</CardTitle>
            <CardDescription>{filtered.length} shown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="max-h-[560px] space-y-2 overflow-y-auto">
              {filtered.map((op) => (
                <Link
                  key={op.id}
                  href={`/admin/operators/${op.id}`}
                  className="block rounded-xl border border-border p-3 no-underline transition hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{op.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {op.operator_code ?? "—"} · +91 {op.phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {op.societies.join(", ") || "No society"} · Residents{" "}
                        {op.residents_count ?? 0} · Orders {op.orders_managed ?? 0}
                      </p>
                    </div>
                    <Badge variant={op.status === "active" ? "success" : "secondary"}>
                      {op.status}
                    </Badge>
                  </div>
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground">No operators match filters.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
