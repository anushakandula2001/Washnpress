"use client";

import { useEffect, useState } from "react";
import { Building2, Search, Filter, Plus, Edit3, ArrowRight } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SocietySetupWizard, type SocietyItem } from "@/components/operations/SocietySetupWizard";

export default function SocietySetupPage() {
  const [societies, setSocieties] = useState<SocietyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Wizard Modal state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string | undefined>(undefined);

  useEffect(() => {
    void loadSocieties();
  }, []);

  async function loadSocieties() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/operations/societies/pending", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load societies");
      setSocieties(data.societies || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading societies");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenWizard(societyId?: string) {
    setSelectedSocietyId(societyId);
    setWizardOpen(true);
  }

  const filteredSocieties = societies.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      (s.address_line_1 && s.address_line_1.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ? true : s.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Society Setup Workflow"
      subtitle="Configure building, floor, and flat master data for assigned societies"
    >
      {/* Action Header Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground">Society Master Data Setup</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Admin creates base societies. Operations configures buildings/towers, floors, and flat numbering before resident registration.
          </p>
        </div>
        <Button onClick={() => handleOpenWizard()} className="gap-2 font-semibold shadow">
          <Plus className="h-4 w-4" /> Start Society Setup Wizard
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="mb-6 border-border/80 shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by society name, city, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Setup Statuses</option>
              <option value="Pending Setup">Pending Setup</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Societies Table */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Assigned Societies ({filteredSocieties.length})</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => void loadSocieties()} className="text-xs">
              Refresh List
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading assigned societies...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-destructive">{error}</div>
          ) : filteredSocieties.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
              <p className="font-medium">No societies match the filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Society Name</th>
                    <th className="px-6 py-3">Address</th>
                    <th className="px-6 py-3">Setup Status</th>
                    <th className="px-6 py-3">Buildings</th>
                    <th className="px-6 py-3">Last Updated</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSocieties.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition">
                      <td className="px-6 py-4 font-semibold text-foreground">{s.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {s.address_line_1 ? `${s.address_line_1}, ` : ""}{s.city}, {s.state}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            s.status === "Completed"
                              ? "success"
                              : s.status === "In Progress"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">
                        {s.building_count} building(s)
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(s.last_updated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant={s.status === "Completed" ? "outline" : "default"}
                          onClick={() => handleOpenWizard(s.id)}
                          className="gap-1.5"
                        >
                          {s.status === "Completed" ? (
                            <>
                              <Edit3 className="h-3.5 w-3.5" /> Edit Setup
                            </>
                          ) : (
                            <>
                              Setup Hierarchy <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Wizard Dialog */}
      <SocietySetupWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        initialSocietyId={selectedSocietyId}
        onCompleted={() => void loadSocieties()}
      />
    </PortalShell>
  );
}
