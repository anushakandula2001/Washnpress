"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { adminNav } from "@/lib/portal-nav";
import { SocietyProfile } from "@/components/admin/societies/SocietyProfile";
import { AssignOperatorDialog } from "@/components/admin/societies/AssignOperatorDialog";
import type { SocietyDetailData } from "@/components/admin/societies/types";

export default function AdminSocietyDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [data, setData] = useState<SocietyDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(searchParams.get("tab") ?? "profile");
  const [assignOpen, setAssignOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/societies?id=${params.id}`, { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to load");
      setData(json as SocietyDetailData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setTab(t);
  }, [searchParams]);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting={data?.society.name ?? "Society"}
      subtitle="Full society management"
    >
      <Link href="/admin/societies" className="mb-4 inline-block text-sm text-primary no-underline hover:underline">
        ← Back to societies
      </Link>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading && !data && (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {data && (
        <>
          <SocietyProfile
            data={data}
            tab={tab}
            onTabChange={setTab}
            onAssignOperator={() => setAssignOpen(true)}
            onUpdated={() => void load()}
          />
          <AssignOperatorDialog
            open={assignOpen}
            onOpenChange={setAssignOpen}
            societyId={data.society.id}
            societyName={data.society.name}
            currentOperatorIds={data.operators.map((o) => o.id)}
            onAssigned={() => void load()}
          />
        </>
      )}
    </PortalShell>
  );
}
