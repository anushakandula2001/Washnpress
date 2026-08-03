"use client";

import { readApiJson } from "@/frontend/api-client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, RefreshCw, ShieldAlert, MessageSquare, Download } from "lucide-react";
import { SupportTicketDrawer } from "@/components/operations/SupportTicketDrawer";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SupportTicketRow } from "@/backend/repositories/support-hub";

function SupportCenterContent() {
  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (activeTab !== "all") params.append("tab", activeTab);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      
      const res = await fetch(`/api/operations/support?${params.toString()}`);
      if (res.ok) {
        const data = await readApiJson(res);
        setTickets(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, priorityFilter, categoryFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const renderPriorityBadge = (priority: string) => {
    const p = (priority || "").toLowerCase();
    if (p === "critical") return <Badge variant="destructive">CRITICAL</Badge>;
    if (p === "high") return <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20">HIGH</Badge>;
    if (p === "medium") return <Badge variant="outline" className="border-amber-500/50 text-amber-600">MEDIUM</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">LOW</Badge>;
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "open") return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">OPEN</Badge>;
    if (s === "in_progress") return <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20">IN PROGRESS</Badge>;
    if (s === "escalated") return <Badge variant="destructive" className="flex items-center gap-1"><ShieldAlert className="h-3 w-3"/> ESCALATED</Badge>;
    if (s === "resolved") return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">RESOLVED</Badge>;
    if (s === "closed") return <Badge variant="secondary">CLOSED</Badge>;
    return <Badge variant="outline">{status.toUpperCase()}</Badge>;
  };

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Support Center"
      subtitle="Manage resident support requests, operational issues, and customer communication from one unified workspace."
    >
      {/* Action Header Banner */}
      {/* <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground">Ticket Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor SLAs, assign executives, and communicate directly with residents to resolve issues.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => fetchTickets()} className="gap-2 bg-background hover:bg-muted">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" className="gap-2 bg-background">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="gap-2 font-semibold shadow">
            <Plus className="h-4 w-4" /> New Ticket
          </Button>
        </div>
      </div> */}

      {/* Filter Toolbar */}
      <Card className="mb-6 border-border/80 shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket ID, resident name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/20"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned_to_me">Assigned to Me</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            
            <select 
              className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select 
              className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Pickup Delayed">Pickup Delayed</option>
              <option value="Missing Garments">Missing Garments</option>
              <option value="Quality Issue">Quality Issue</option>
              <option value="Payment">Payment</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-xs tracking-wider uppercase">Ticket ID</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider uppercase">Resident</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider uppercase">Society</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider uppercase">Category</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider uppercase">Status</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider uppercase">Priority</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider uppercase">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && tickets.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-10 w-full animate-pulse bg-muted/50 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-base font-medium text-foreground">No support tickets found</p>
                      <p className="text-sm mb-4">Try adjusting your filters or search terms.</p>
                      <Button variant="outline" onClick={() => { setSearch(""); setActiveTab("all"); setPriorityFilter(""); setCategoryFilter(""); }}>
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow 
                    key={t.id} 
                    className="cursor-pointer hover:bg-muted/40 transition-colors group"
                    onClick={() => setSelectedTicketId(t.id)}
                  >
                    <TableCell className="font-medium text-foreground whitespace-nowrap">{t.ticket_code}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground whitespace-nowrap">{t.resident_name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{t.resident_phone || "No phone"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate" title={t.society_name || ""}>
                      {t.society_name || "N/A"}
                    </TableCell>
                    <TableCell className="text-foreground text-sm font-medium whitespace-nowrap">{t.category}</TableCell>
                    <TableCell className="whitespace-nowrap">{renderStatusBadge(t.status)}</TableCell>
                    <TableCell className="whitespace-nowrap">{renderPriorityBadge(t.priority)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(t.updated_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <SupportTicketDrawer 
        ticketId={selectedTicketId} 
        open={!!selectedTicketId} 
        onOpenChange={(open) => !open && setSelectedTicketId(null)}
        onUpdated={fetchTickets}
      />
    </PortalShell>
  );
}

export default function UnifiedSupportCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading support center...</div>}>
      <SupportCenterContent />
    </Suspense>
  );
}
