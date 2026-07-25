"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import type { ExecutiveRow } from "./types";

export function SocietyExecutives({ societyId }: { societyId: string }) {
  const [rows, setRows] = useState<ExecutiveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/operations/master?type=executives&societyId=${societyId}`,
          { credentials: "same-origin" },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed to load executives");
        if (!cancelled) setRows((data.executives as ExecutiveRow[]) ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [societyId]);

  if (loading) {
    return <Skeleton className="h-48 rounded-xl" />;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No executives"
        description="Executive assignments can be configured via Operations Master Data."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Executive Assignments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
            <div>
              <p className="font-medium">{e.full_name}</p>
              <p className="text-muted-foreground">+91 {e.phone}</p>
            </div>
            {e.service_area_name && (
              <span className="text-xs text-muted-foreground">{e.service_area_name}</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
