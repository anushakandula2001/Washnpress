"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/frontend/api-client";
import { operationsNav } from "@/lib/portal-nav";

type Society = { id: string; name: string };
type TowerNode = {
  id: string;
  name: string;
  floors: Array<{
    id: string;
    label: string;
    floor_number: number;
    flats: Array<{ id: string; flat_number: string; status: string }>;
  }>;
};

export default function MasterDataPage() {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [societyId, setSocietyId] = useState("");
  const [hierarchy, setHierarchy] = useState<TowerNode[]>([]);
  const [towerName, setTowerName] = useState("");
  const [floorNumber, setFloorNumber] = useState("1");
  const [selectedTowerId, setSelectedTowerId] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSocieties = useCallback(async () => {
    const data = await api.operationsMaster.get({ type: "societies" });
    const list = (data.societies as Society[]) ?? [];
    setSocieties(list.map((s) => ({ id: String(s.id), name: String(s.name) })));
    if (!societyId && list[0]) setSocietyId(String(list[0].id));
  }, [societyId]);

  const loadHierarchy = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.operationsMaster.get({ type: "hierarchy", societyId: id });
      setHierarchy((data.hierarchy as TowerNode[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hierarchy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSocieties().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load societies"),
    );
  }, [loadSocieties]);

  useEffect(() => {
    if (societyId) void loadHierarchy(societyId);
  }, [societyId, loadHierarchy]);

  async function addTower() {
    if (!societyId || !towerName.trim()) return;
    setError(null);
    try {
      await api.operationsMaster.create({
        kind: "tower",
        societyId,
        name: towerName.trim(),
      });
      setTowerName("");
      setMessage("Tower created");
      await loadHierarchy(societyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tower");
    }
  }

  async function addFloor() {
    if (!selectedTowerId || !floorNumber) return;
    setError(null);
    try {
      await api.operationsMaster.create({
        kind: "floor",
        towerId: selectedTowerId,
        floorNumber: Number(floorNumber),
      });
      setMessage("Floor created");
      await loadHierarchy(societyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create floor");
    }
  }

  async function addFlat() {
    if (!selectedFloorId || !flatNumber.trim()) return;
    setError(null);
    try {
      await api.operationsMaster.create({
        kind: "flat",
        floorId: selectedFloorId,
        flatNumber: flatNumber.trim(),
      });
      setFlatNumber("");
      setMessage("Flat created");
      await loadHierarchy(societyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flat");
    }
  }

  const floors =
    hierarchy.find((t) => t.id === selectedTowerId)?.floors ??
    hierarchy.flatMap((t) => t.floors);

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Master Data"
      subtitle="Societies → Towers → Floors → Flats. Residents pick from this catalog only."
    >
      {message && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="text-sm">
          <span className="text-muted-foreground">Society</span>
          <select
            className="mt-1 flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm"
            value={societyId}
            onChange={(e) => setSocietyId(e.target.value)}
          >
            {societies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Tower</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="e.g. Tower A"
              value={towerName}
              onChange={(e) => setTowerName(e.target.value)}
            />
            <Button onClick={() => void addTower()}>Create Tower</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Floor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedTowerId}
              onChange={(e) => setSelectedTowerId(e.target.value)}
            >
              <option value="">Select tower</option>
              {hierarchy.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <Input
              type="number"
              value={floorNumber}
              onChange={(e) => setFloorNumber(e.target.value)}
            />
            <Button onClick={() => void addFloor()} disabled={!selectedTowerId}>
              Create Floor
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Flat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedFloorId}
              onChange={(e) => setSelectedFloorId(e.target.value)}
            >
              <option value="">Select floor</option>
              {floors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <Input
              placeholder="e.g. B-805"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
            />
            <Button onClick={() => void addFlat()} disabled={!selectedFloorId}>
              Create Flat
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Hierarchy</CardTitle>
          <CardDescription>Live catalog from PostgreSQL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : hierarchy.length === 0 ? (
            <p className="text-sm text-muted-foreground">No towers yet. Create the first tower above.</p>
          ) : (
            hierarchy.map((tower) => (
              <div key={tower.id} className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-semibold">Tower {tower.name}</p>
                  <Badge variant="secondary">{tower.floors.length} floors</Badge>
                </div>
                <div className="space-y-2 pl-2">
                  {tower.floors.map((floor) => (
                    <div key={floor.id} className="rounded-lg bg-muted/40 p-3 text-sm">
                      <p className="font-medium">{floor.label}</p>
                      <p className="mt-1 text-muted-foreground">
                        {floor.flats.map((f) => f.flat_number).join(", ") || "No flats"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
