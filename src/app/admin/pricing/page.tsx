"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminNav } from "@/lib/portal-nav";

type Garment = {
  id: string;
  name: string;
  wash_price_inr: string | number;
  wash_iron_price_inr: string | number;
  iron_price_inr: string | number;
  dry_clean_price_inr: string | number;
  is_active: boolean;
};

type Addon = {
  id: string;
  code: string;
  name: string;
  description: string;
  price_inr: string | number;
  is_active: boolean;
};

type Settings = {
  min_order_amount_inr: string | number;
  delivery_fee_inr: string | number;
  free_delivery_threshold_inr: string | number;
  gst_percent: string | number;
  service_tax_percent: string | number;
  other_charges_label: string;
  other_charges_inr: string | number;
};

type Plan = {
  id: string;
  tier: string;
  name: string | null;
  monthly_inr: string | number;
  garment_cap: number;
  is_active: boolean;
};

export default function AdminPricingPage() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [gForm, setGForm] = useState({
    name: "",
    wash: "40",
    washIron: "60",
    iron: "25",
    dryClean: "80",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/pricing", { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed");
    setGarments((data.garments as Garment[]) ?? []);
    setAddons((data.addons as Addon[]) ?? []);
    setSettings((data.settings as Settings) ?? null);
    setPlans((data.plans as Plan[]) ?? []);
  }, []);

  useEffect(() => {
    void load().catch((e) => setErr(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  async function post(body: Record<string, unknown>) {
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/admin/pricing", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Save failed");
    setMsg("Saved — Resident & Operator portals will see updates immediately.");
    await load();
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Pricing"
      subtitle="Garments, add-ons, delivery fees, taxes — source of truth for all portals"
    >
      {msg && <p className="mb-3 text-sm text-primary">{msg}</p>}
      {err && <p className="mb-3 text-sm text-destructive">{err}</p>}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Garment pricing</CardTitle>
            <CardDescription>Residents see these prices when scheduling pickup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-5">
              <Input placeholder="Garment name" value={gForm.name} onChange={(e) => setGForm({ ...gForm, name: e.target.value })} />
              <Input type="number" placeholder="Wash" value={gForm.wash} onChange={(e) => setGForm({ ...gForm, wash: e.target.value })} />
              <Input type="number" placeholder="Wash+Iron" value={gForm.washIron} onChange={(e) => setGForm({ ...gForm, washIron: e.target.value })} />
              <Input type="number" placeholder="Iron" value={gForm.iron} onChange={(e) => setGForm({ ...gForm, iron: e.target.value })} />
              <Input type="number" placeholder="Dry clean" value={gForm.dryClean} onChange={(e) => setGForm({ ...gForm, dryClean: e.target.value })} />
            </div>
            <Button
              onClick={() =>
                void post({
                  section: "garment",
                  garment: {
                    name: gForm.name,
                    washPriceInr: Number(gForm.wash),
                    washIronPriceInr: Number(gForm.washIron),
                    ironPriceInr: Number(gForm.iron),
                    dryCleanPriceInr: Number(gForm.dryClean),
                  },
                }).catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
              }
            >
              Add garment
            </Button>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="py-2">Garment</th>
                    <th>Wash</th>
                    <th>Wash+Iron</th>
                    <th>Iron</th>
                    <th>Dry Clean</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {garments.map((g) => (
                    <tr key={g.id} className="border-b border-border/60">
                      <td className="py-2 font-medium">{g.name}</td>
                      <td>₹{g.wash_price_inr}</td>
                      <td>₹{g.wash_iron_price_inr}</td>
                      <td>₹{g.iron_price_inr}</td>
                      <td>₹{g.dry_clean_price_inr}</td>
                      <td>
                        <Badge variant={g.is_active ? "success" : "secondary"}>
                          {g.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="space-x-1 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void post({
                              section: "garment",
                              garment: {
                                id: g.id,
                                name: g.name,
                                washPriceInr: Number(g.wash_price_inr),
                                washIronPriceInr: Number(g.wash_iron_price_inr),
                                ironPriceInr: Number(g.iron_price_inr),
                                dryCleanPriceInr: Number(g.dry_clean_price_inr),
                                action: "toggle",
                                isActive: !g.is_active,
                              },
                            })
                          }
                        >
                          {g.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void post({
                              section: "garment",
                              garment: {
                                id: g.id,
                                name: g.name,
                                washPriceInr: 0,
                                washIronPriceInr: 0,
                                ironPriceInr: 0,
                                dryCleanPriceInr: 0,
                                action: "delete",
                              },
                            })
                          }
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Add-on services</CardTitle>
            <CardDescription>Full CRUD also on /admin/addons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {addons.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-muted-foreground">{a.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span>₹{a.price_inr}</span>
                  <Badge variant={a.is_active ? "success" : "secondary"}>
                    {a.is_active ? "On" : "Off"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void post({
                        section: "addon",
                        addon: {
                          id: a.id,
                          code: a.code,
                          name: a.name,
                          description: a.description,
                          priceInr: Number(a.price_inr),
                          action: "toggle",
                          isActive: !a.is_active,
                        },
                      })
                    }
                  >
                    Toggle
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">3. Delivery charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings && (
                <>
                  <label className="block text-sm">
                    Min order amount
                    <Input
                      className="mt-1"
                      type="number"
                      defaultValue={String(settings.min_order_amount_inr)}
                      id="minOrder"
                    />
                  </label>
                  <label className="block text-sm">
                    Delivery fee
                    <Input className="mt-1" type="number" defaultValue={String(settings.delivery_fee_inr)} id="delFee" />
                  </label>
                  <label className="block text-sm">
                    Free delivery threshold
                    <Input
                      className="mt-1"
                      type="number"
                      defaultValue={String(settings.free_delivery_threshold_inr)}
                      id="freeThr"
                    />
                  </label>
                  <Button
                    onClick={() => {
                      const min = Number((document.getElementById("minOrder") as HTMLInputElement).value);
                      const fee = Number((document.getElementById("delFee") as HTMLInputElement).value);
                      const thr = Number((document.getElementById("freeThr") as HTMLInputElement).value);
                      void post({
                        section: "settings",
                        settings: {
                          minOrderAmountInr: min,
                          deliveryFeeInr: fee,
                          freeDeliveryThresholdInr: thr,
                        },
                      });
                    }}
                  >
                    Save delivery
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">4. Taxes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings && (
                <>
                  <label className="block text-sm">
                    GST %
                    <Input className="mt-1" type="number" defaultValue={String(settings.gst_percent)} id="gst" />
                  </label>
                  <label className="block text-sm">
                    Service tax %
                    <Input className="mt-1" type="number" defaultValue={String(settings.service_tax_percent)} id="svcTax" />
                  </label>
                  <label className="block text-sm">
                    Other charges label
                    <Input className="mt-1" defaultValue={settings.other_charges_label} id="otherLbl" />
                  </label>
                  <label className="block text-sm">
                    Other charges ₹
                    <Input className="mt-1" type="number" defaultValue={String(settings.other_charges_inr)} id="otherAmt" />
                  </label>
                  <Button
                    onClick={() =>
                      void post({
                        section: "settings",
                        settings: {
                          gstPercent: Number((document.getElementById("gst") as HTMLInputElement).value),
                          serviceTaxPercent: Number((document.getElementById("svcTax") as HTMLInputElement).value),
                          otherChargesLabel: (document.getElementById("otherLbl") as HTMLInputElement).value,
                          otherChargesInr: Number((document.getElementById("otherAmt") as HTMLInputElement).value),
                        },
                      })
                    }
                  >
                    Save taxes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription plan prices (quick)</CardTitle>
            <CardDescription>Full plan editor on /admin/subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {plans.map((p) => (
              <div key={p.id} className="flex justify-between rounded-lg border border-border px-3 py-2">
                <span>
                  {p.name ?? p.tier} · cap {p.garment_cap}
                </span>
                <span>₹{p.monthly_inr}/mo</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
