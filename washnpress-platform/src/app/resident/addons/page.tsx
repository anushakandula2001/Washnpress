"use client";

import { useEffect, useState, type ComponentType } from "react";
import {
  Shirt,
  Footprints,
  Sparkles,
  Zap,
  Droplets,
  Check,
} from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/frontend/api-client";
import type { AddonService } from "@/lib/resident-data";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  shirt: Shirt,
  footprints: Footprints,
  sparkles: Sparkles,
  zap: Zap,
  droplets: Droplets,
};

export default function AddonsPage() {
  const { balance } = useResident();
  const [addons, setAddons] = useState<AddonService[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.addons()
      .then((data) => {
        setAddons(
          data.addons.map((a) => ({
            id: String(a.id),
            name: String(a.name),
            description: String(a.description ?? ""),
            priceInr: Number(a.priceInr ?? 0),
            icon: String(a.icon ?? "sparkles"),
          })),
        );
      })
      .catch(() => setAddons([]))
      .finally(() => setLoading(false));
  }, []);

  const total = addons
    .filter((a) => selected.has(a.id))
    .reduce((sum, a) => sum + a.priceInr, 0);

  function toggleAddon(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setAdded(false);
  }

  function handleAddToOrder() {
    if (selected.size > 0) setAdded(true);
  }

  return (
    <ResidentShell greeting="Add-on Services" subtitle="Enhance your laundry with optional extras">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Wallet balance: ₹{balance.toFixed(2)}</p>
        {added && <Badge variant="success">Added to next order</Badge>}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading add-ons…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addons.map((addon) => {
            const Icon = iconMap[addon.icon] ?? Sparkles;
            const isSelected = selected.has(addon.id);
            return (
              <Card
                key={addon.id}
                className={isSelected ? "border-primary/50 bg-primary/5" : undefined}
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{addon.name}</CardTitle>
                  <CardDescription>{addon.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="font-semibold">₹{addon.priceInr}</p>
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleAddon(addon.id)}
                    className="gap-1"
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                    {isSelected ? "Selected" : "Select"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <p className="text-sm">
          Selected total: <span className="font-semibold">₹{total}</span>
        </p>
        <Button onClick={handleAddToOrder} disabled={selected.size === 0}>
          Add to Order
        </Button>
      </div>
    </ResidentShell>
  );
}
