"use client";

import { readApiJson } from "@/frontend/api-client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, Search, ArrowRight, Activity, Users, Box, Truck } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { SocietySetupWizard, type SocietyItem } from "@/components/operations/SocietySetupWizard";

function AssignedSocietiesContent() {
  const searchParams = useSearchParams();
  const [societies, setSocieties] = useState<SocietyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string | undefined>(undefined);

  const fetchSocieties = () => {
    setLoading(true);
    fetch("/api/operations/societies/pending", { credentials: "same-origin" })
      .then((r) => readApiJson(r))
      .then((d) => setSocieties(d.societies || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSocieties();
    const querySocietyId = searchParams.get("societyId");
    if (querySocietyId) {
      setSelectedSocietyId(querySocietyId);
      setWizardOpen(true);
    }
  }, [searchParams]);

  const filtered = societies.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  function handleOpenWizard(societyId?: string) {
    setSelectedSocietyId(societyId);
    setWizardOpen(true);
  }

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting={`Assigned Societies (${societies.length})`}
      subtitle="Live metrics and master data overview of your assigned societies"
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
        {/* <Button onClick={() => handleOpenWizard()} className="gap-2 font-semibold shadow">
          <Building2 className="h-4 w-4" /> Setup Hierarchy
        </Button> */}
      </div>

      <Card className="shadow-sm border-border/80 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-semibold text-foreground">Society Details</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground">Infrastructure</TableHead>
              <TableHead className="font-semibold text-foreground">Live Metrics</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Loading assigned societies...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No societies found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell>
                    <div className="font-bold text-base text-foreground">{s.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {s.address_line_1 ? `${s.address_line_1}, ` : ""}{s.city}, {s.state}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={s.status === "Completed" ? "success" : s.status === "In Progress" ? "outline" : "secondary"}
                      className="whitespace-nowrap"
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">{s.resident_count || 0}</span> Residents
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Activity className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">0</span> Active Slots
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Box className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">{s.today_pickups_count || 0}</span> Pickups Today
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Truck className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">0</span> Processing
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Truck className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">{s.today_deliveries_count || 0}</span> Ready
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Truck className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">0</span> Delivered
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleOpenWizard(s.id)}>
                      {s.building_count > 0 ? "Edit Hierarchy" : "Setup Hierarchy"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <SocietySetupWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        initialSocietyId={selectedSocietyId}
        onCompleted={fetchSocieties}
      />
    </PortalShell>
  );
}

export default function AssignedSocietiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading assigned societies...</div>}>
      <AssignedSocietiesContent />
    </Suspense>
  );
}
