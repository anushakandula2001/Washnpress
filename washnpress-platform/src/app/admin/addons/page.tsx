"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminNav } from "@/lib/portal-nav";

type Addon = {
  id: string;
  code: string;
  name: string;
  description: string;
  price_inr: string | number;
  is_active: boolean;
};

const emptyForm = { code: "", name: "", description: "", priceInr: "" };

export default function AdminAddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/addons", { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed to load add-ons");
    setAddons((data.addons as Addon[]) ?? []);
  }, []);

  useEffect(() => {
    void load().catch((e) => setErr(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  async function post(body: Record<string, unknown>) {
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/admin/addons", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Save failed");
    setMsg("Saved.");
    setForm(emptyForm);
    setEditId(null);
    await load();
  }

  function startEdit(a: Addon) {
    setEditId(a.id);
    setForm({
      code: a.code,
      name: a.name,
      description: a.description,
      priceInr: String(a.price_inr),
    });
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Add-on Services"
      subtitle="Manage optional services shown during resident pickup booking"
    >
      {msg && <p className="mb-3 text-sm text-primary">{msg}</p>}
      {err && <p className="mb-3 text-sm text-destructive">{err}</p>}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editId ? "Edit add-on" : "Create add-on"}</CardTitle>
            <CardDescription>Code, name, description, and price in INR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                placeholder="Code (e.g. express_iron)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Price INR"
                value={form.priceInr}
                onChange={(e) => setForm({ ...form, priceInr: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  void post({
                    action: "upsert",
                    id: editId ?? undefined,
                    code: form.code,
                    name: form.name,
                    description: form.description,
                    priceInr: Number(form.priceInr),
                  }).catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
                }
              >
                {editId ? "Update" : "Create"}
              </Button>
              {editId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All add-ons</CardTitle>
            <CardDescription>{addons.length} services</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-2">Code</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {addons.map((a) => (
                  <tr key={a.id} className="border-b border-border/60">
                    <td className="py-2 font-mono text-xs">{a.code}</td>
                    <td className="font-medium">{a.name}</td>
                    <td className="max-w-[200px] truncate text-muted-foreground">{a.description}</td>
                    <td>₹{a.price_inr}</td>
                    <td>
                      <Badge variant={a.is_active ? "success" : "secondary"}>
                        {a.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="space-x-1 py-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(a)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void post({
                            action: "toggle",
                            id: a.id,
                            code: a.code,
                            name: a.name,
                            description: a.description,
                            priceInr: Number(a.price_inr),
                            isActive: !a.is_active,
                          }).catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
                        }
                      >
                        {a.is_active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void post({
                            action: "delete",
                            id: a.id,
                            code: a.code,
                            name: a.name,
                            description: a.description,
                            priceInr: Number(a.price_inr),
                          }).catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
                        }
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {addons.length === 0 && <p className="py-4 text-sm text-muted-foreground">No add-ons yet.</p>}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
