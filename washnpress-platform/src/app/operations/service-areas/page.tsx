"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/frontend/api-client";
import { operationsNav } from "@/lib/portal-nav";

export default function ServiceAreasPage() {
  const [societies, setSocieties] = useState<Array<{ id: string; name: string }>>([]);
  const [areas, setAreas] = useState<Array<Record<string, unknown>>>([]);
  const [societyId, setSocietyId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [soc, areaData] = await Promise.all([
      api.operationsMaster.get({ type: "societies" }),
      api.operationsMaster.get({ type: "service-areas" }),
    ]);
    const list = ((soc.societies as Array<{ id: string; name: string }>) ?? []).map((s) => ({
      id: String(s.id),
      name: String(s.name),
    }));
    setSocieties(list);
    if (!societyId && list[0]) setSocietyId(list[0].id);
    setAreas((areaData.serviceAreas as Array<Record<string, unknown>>) ?? []);
  }, [societyId]);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  async function create() {
    if (!societyId || !name.trim()) return;
    setError(null);
    try {
      await api.operationsMaster.create({
        kind: "service-area",
        societyId,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Service Areas"
      subtitle="Pickup zones within assigned societies"
    >
      {error && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create service area</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={societyId}
              onChange={(e) => setSocietyId(e.target.value)}
            >
              {societies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Input placeholder="Zone name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button onClick={() => void create()}>Save</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Areas</CardTitle>
            <CardDescription>Stored in PostgreSQL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {areas.map((a) => (
              <div key={String(a.id)} className="rounded-xl border border-border p-3">
                <div className="flex justify-between gap-2">
                  <p className="font-medium">{String(a.name)}</p>
                  <Badge variant="secondary">{String(a.society_name ?? "")}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{String(a.description ?? "")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
