"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { operationsNav } from "@/lib/portal-nav";

type ResidentRow = {
  id: string;
  resident_code?: string | null;
  full_name?: string | null;
  phone?: string;
  email?: string | null;
  society_name?: string;
  unit_number?: string | null;
  tower_block?: string | null;
};

export default function OperationsCustomersPage() {
  const [residents, setResidents] = useState<ResidentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/operations/customers", { credentials: "same-origin" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed to load residents");
        if (!cancelled) setResidents((data.residents as ResidentRow[]) ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load failed");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Residents"
      subtitle="Only residents in your assigned societies"
    >
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Directory</CardTitle>
          <CardDescription>{residents.length} resident(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {residents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No residents in your assigned societies.</p>
          ) : (
            residents.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-1 rounded-xl border border-border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{r.full_name ?? "Resident"}</p>
                  <p className="text-muted-foreground">
                    +91 {r.phone}
                    {r.resident_code ? ` · ${r.resident_code}` : ""}
                  </p>
                </div>
                <div className="text-muted-foreground">
                  {r.society_name}
                  {r.tower_block ? ` · ${r.tower_block}` : ""}
                  {r.unit_number ? ` · ${r.unit_number}` : ""}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
