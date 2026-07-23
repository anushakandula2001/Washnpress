"use client";

import { useEffect, useState } from "react";
import { Building2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SocietyItem } from "@/components/operations/SocietySetupWizard";

export default function AssignedSocietiesPage() {
  const [societies, setSocieties] = useState<SocietyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void fetch("/api/operations/societies/pending", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setSocieties(d.societies || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const filtered = societies.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Assigned Societies"
      subtitle="Overview of all societies assigned to the Operations team"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter assigned societies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href="/operations/society-setup">
          <Button className="gap-2">
            <Building2 className="h-4 w-4" /> Go to Society Setup Workflow
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Loading societies...</p>
        ) : filtered.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No societies found.</p>
        ) : (
          filtered.map((s) => (
            <Card key={s.id} className="border-border/80 hover:border-primary/50 transition shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold">{s.name}</CardTitle>
                  <Badge variant={s.status === "Completed" ? "success" : "secondary"}>
                    {s.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.address_line_1 ? `${s.address_line_1}, ` : ""}{s.city}, {s.state}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/40 p-3 text-xs flex justify-between">
                  <span className="text-muted-foreground">Configured Buildings:</span>
                  <span className="font-semibold text-foreground">{s.building_count}</span>
                </div>

                <Link href={`/operations/society-setup`} className="block no-underline">
                  <Button variant="outline" className="w-full justify-between text-xs">
                    <span>Manage Hierarchy</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PortalShell>
  );
}
