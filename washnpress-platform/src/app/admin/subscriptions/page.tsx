"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminNav } from "@/lib/portal-nav";

type Plan = {
  id: string;
  tier: string;
  name: string | null;
  description: string | null;
  monthly_inr: string | number;
  quarterly_inr: string | number | null;
  yearly_inr: string | number | null;
  garment_cap: number;
  max_pickups: number | null;
  priority_pickup: boolean;
  free_delivery: boolean;
  express_discount_percent: string | number | null;
  validity_days: number | null;
  is_active: boolean;
};

type Enrollment = {
  id: string;
  status: string;
  tier: string;
  plan_name: string | null;
  monthly_inr: number;
  garment_cap: number;
  garments_used: number;
  full_name: string;
  phone: string;
  resident_id: string;
  society_name: string;
  cycle_start: string;
  cycle_end: string;
};

const emptyPlan = {
  tier: "",
  name: "",
  description: "",
  monthlyInr: "",
  quarterlyInr: "",
  yearlyInr: "",
  garmentCap: "30",
  maxPickups: "4",
  priorityPickup: false,
  freeDelivery: false,
  expressDiscountPercent: "0",
  validityDays: "30",
  isActive: true,
};

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [form, setForm] = useState(emptyPlan);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/subscriptions", { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed");
    setPlans((data.plans as Plan[]) ?? []);
    setEnrollments((data.enrollments as Enrollment[]) ?? []);
  }, []);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  async function post(body: Record<string, unknown>) {
    setMsg(null);
    setError(null);
    const res = await fetch("/api/admin/subscriptions", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Save failed");
    setMsg("Plan saved.");
    setForm(emptyPlan);
    setEditId(null);
    await load();
  }

  function startEdit(p: Plan) {
    setEditId(p.id);
    setForm({
      tier: p.tier,
      name: p.name ?? "",
      description: p.description ?? "",
      monthlyInr: String(p.monthly_inr),
      quarterlyInr: p.quarterly_inr != null ? String(p.quarterly_inr) : "",
      yearlyInr: p.yearly_inr != null ? String(p.yearly_inr) : "",
      garmentCap: String(p.garment_cap),
      maxPickups: p.max_pickups != null ? String(p.max_pickups) : "4",
      priorityPickup: p.priority_pickup,
      freeDelivery: p.free_delivery,
      expressDiscountPercent: String(p.express_discount_percent ?? 0),
      validityDays: p.validity_days != null ? String(p.validity_days) : "30",
      isActive: p.is_active,
    });
  }

  function planPayload(extra: Record<string, unknown> = {}) {
    return {
      action: "upsert",
      id: editId ?? undefined,
      tier: form.tier,
      name: form.name || undefined,
      description: form.description || undefined,
      monthlyInr: Number(form.monthlyInr),
      quarterlyInr: form.quarterlyInr ? Number(form.quarterlyInr) : undefined,
      yearlyInr: form.yearlyInr ? Number(form.yearlyInr) : undefined,
      garmentCap: Number(form.garmentCap),
      maxPickups: Number(form.maxPickups),
      priorityPickup: form.priorityPickup,
      freeDelivery: form.freeDelivery,
      expressDiscountPercent: Number(form.expressDiscountPercent),
      validityDays: Number(form.validityDays),
      isActive: form.isActive,
      ...extra,
    };
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Subscriptions"
      subtitle={`${plans.length} plans · ${enrollments.length} enrollments`}
    >
      {msg && <p className="mb-3 text-sm text-primary">{msg}</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editId ? "Edit plan" : "Create plan"}</CardTitle>
            <CardDescription>Subscription tiers shown to residents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Input placeholder="Tier (e.g. gold)" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} />
              <Input placeholder="Display name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type="number" placeholder="Monthly INR" value={form.monthlyInr} onChange={(e) => setForm({ ...form, monthlyInr: e.target.value })} />
              <Input type="number" placeholder="Quarterly INR" value={form.quarterlyInr} onChange={(e) => setForm({ ...form, quarterlyInr: e.target.value })} />
              <Input type="number" placeholder="Yearly INR" value={form.yearlyInr} onChange={(e) => setForm({ ...form, yearlyInr: e.target.value })} />
              <Input type="number" placeholder="Garment cap" value={form.garmentCap} onChange={(e) => setForm({ ...form, garmentCap: e.target.value })} />
              <Input type="number" placeholder="Max pickups" value={form.maxPickups} onChange={(e) => setForm({ ...form, maxPickups: e.target.value })} />
              <Input type="number" placeholder="Express discount %" value={form.expressDiscountPercent} onChange={(e) => setForm({ ...form, expressDiscountPercent: e.target.value })} />
              <Input type="number" placeholder="Validity days" value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: e.target.value })} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.priorityPickup} onChange={(e) => setForm({ ...form, priorityPickup: e.target.checked })} />
                Priority pickup
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.freeDelivery} onChange={(e) => setForm({ ...form, freeDelivery: e.target.checked })} />
                Free delivery
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void post(planPayload()).catch((e) => setError(e instanceof Error ? e.message : "Failed"))}>
                {editId ? "Update plan" : "Create plan"}
              </Button>
              {editId && (
                <Button variant="outline" onClick={() => { setEditId(null); setForm(emptyPlan); }}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {plans.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium">{p.name ?? p.tier}</p>
                  <p className="text-muted-foreground">
                    ₹{p.monthly_inr}/mo · cap {p.garment_cap} · {p.max_pickups ?? "—"} pickups
                    {p.priority_pickup ? " · priority" : ""}
                    {p.free_delivery ? " · free delivery" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.is_active ? "success" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void post({
                        action: "toggle",
                        id: p.id,
                        tier: p.tier,
                        monthlyInr: Number(p.monthly_inr),
                        garmentCap: p.garment_cap,
                        isActive: !p.is_active,
                      }).catch((e) => setError(e instanceof Error ? e.message : "Failed"))
                    }
                  >
                    {p.is_active ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            ))}
            {plans.length === 0 && <p className="text-muted-foreground">No plans configured.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrollments</CardTitle>
            <CardDescription>Active and past resident subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {enrollments.map((s) => (
              <div key={s.id} className="rounded-xl border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/admin/residents/${s.resident_id}`} className="font-medium text-primary hover:underline">
                    {s.full_name}
                  </Link>
                  <Badge variant={s.status === "active" ? "success" : "secondary"}>{s.status}</Badge>
                </div>
                <p className="text-muted-foreground">
                  {s.plan_name ?? s.tier} · ₹{s.monthly_inr} · {s.garments_used}/{s.garment_cap} garments · {s.society_name} · +91 {s.phone}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cycle {new Date(s.cycle_start).toLocaleDateString()} – {new Date(s.cycle_end).toLocaleDateString()}
                </p>
              </div>
            ))}
            {enrollments.length === 0 && <p className="text-muted-foreground">No enrollments yet.</p>}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
