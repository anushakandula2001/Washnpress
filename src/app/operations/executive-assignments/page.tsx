"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/frontend/api-client";
import { operationsNav } from "@/lib/portal-nav";

export default function ExecutiveAssignmentsPage() {
  const [societies, setSocieties] = useState<Array<{ id: string; name: string }>>([]);
  const [executives, setExecutives] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState({ societyId: "", fullName: "", phone: "" });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [soc, exec] = await Promise.all([
      api.operationsMaster.get({ type: "societies" }),
      api.operationsMaster.get({ type: "executives" }),
    ]);
    const list = ((soc.societies as Array<{ id: string; name: string }>) ?? []).map((s) => ({
      id: String(s.id),
      name: String(s.name),
    }));
    setSocieties(list);
    setForm((f) => ({ ...f, societyId: f.societyId || list[0]?.id || "" }));
    setExecutives((exec.executives as Array<Record<string, unknown>>) ?? []);
  }, []);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  async function create() {
    if (!form.societyId || !form.fullName || form.phone.length !== 10) {
      setError("Society, name and valid phone are required");
      return;
    }
    setError(null);
    try {
      await api.operationsMaster.create({
        kind: "executive",
        societyId: form.societyId,
        fullName: form.fullName,
        phone: form.phone,
      });
      setForm((f) => ({ ...f, fullName: "", phone: "" }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Executive Assignments"
      subtitle="Assign pickup executives to societies / service areas"
    >
      {error && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assign executive</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.societyId}
              onChange={(e) => setForm({ ...form, societyId: e.target.value })}
            >
              {societies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <Input
              placeholder="Mobile"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
            />
            <Button onClick={() => void create()}>Save assignment</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {executives.map((e) => (
              <div key={String(e.id)} className="rounded-xl border border-border p-3">
                <div className="flex justify-between">
                  <p className="font-medium">{String(e.full_name)}</p>
                  <Badge>{String(e.status)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  +91 {String(e.phone)} · {String(e.society_name)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
