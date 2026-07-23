"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { SupportTicketRecord } from "@/backend/repositories/support";

export function getSlaStatusBadge(ticket: SupportTicketRecord) {
  if (ticket.status === "Resolved" || ticket.status === "Closed") {
    return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Met SLA</Badge>;
  }
  if (ticket.status === "Escalated" || ticket.sla_breached) {
    return <Badge variant="destructive" className="gap-1 animate-pulse"><AlertTriangle className="h-3 w-3" /> SLA Breached</Badge>;
  }

  const due = new Date(ticket.sla_resolution_due_at).getTime();
  const now = Date.now();
  const diffMinutes = Math.floor((due - now) / 60000);

  if (diffMinutes < 0) {
    return <Badge variant="destructive" className="gap-1 animate-pulse"><AlertTriangle className="h-3 w-3" /> Breached ({Math.abs(diffMinutes)}m ago)</Badge>;
  }
  if (diffMinutes <= 30) {
    return <Badge className="bg-amber-500 text-white gap-1"><Clock className="h-3 w-3" /> {diffMinutes}m remaining</Badge>;
  }
  if (diffMinutes <= 120) {
    return <Badge className="bg-yellow-500 text-slate-900 gap-1"><Clock className="h-3 w-3" /> {Math.floor(diffMinutes / 60)}h {diffMinutes % 60}m</Badge>;
  }
  return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3 text-emerald-600" /> {Math.floor(diffMinutes / 60)}h remaining</Badge>;
}

export function SupportTicketTable({
  tickets,
  onSelectTicket,
  onBulkAction,
  loading,
}: {
  tickets: SupportTicketRecord[];
  onSelectTicket: (ticket: SupportTicketRecord) => void;
  onBulkAction?: (action: string, selectedIds: string[]) => void;
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof SupportTicketRecord>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  // Column visibility
  const [visibleCols, setVisibleCols] = useState({
    society: true,
    order: true,
    category: true,
    team: true,
    executive: true,
    sla: true,
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Filter & Search
  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.ticket_code.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.resident_name && t.resident_name.toLowerCase().includes(q)) ||
      (t.society_name && t.society_name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" ? true : t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === "all" ? true : t.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchesTeam = teamFilter === "all" ? true : t.assigned_team.toLowerCase() === teamFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority && matchesTeam;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField] || "";
    const valB = b[sortField] || "";
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  function handleSelectAll(checked: boolean) {
    if (checked) setSelectedIds(sorted.map((t) => t.id));
    else setSelectedIds([]);
  }

  function handleSelectOne(id: string, checked: boolean) {
    if (checked) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((item) => item !== id));
  }

  function handleExportCsv() {
    const headers = ["Ticket ID", "Resident", "Society", "Order", "Category", "Priority", "Team", "Executive", "Status", "Created"];
    const rows = sorted.map((t) => [
      t.ticket_code,
      `"${t.resident_name || "Resident"}"`,
      `"${t.society_name || "N/A"}"`,
      t.order_code || "N/A",
      `"${t.category}"`,
      t.priority,
      `"${t.assigned_team}"`,
      `"${t.assigned_user_name || "Unassigned"}"`,
      t.status,
      new Date(t.created_at).toLocaleString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `washnpress_support_tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket #, resident name, society, issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2.5 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for Resident">Waiting for Resident</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2.5 font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2.5 font-medium"
            >
              <option value="all">All Teams</option>
              <option value="Pickup Manager">Pickup Manager</option>
              <option value="Delivery Manager">Delivery Manager</option>
              <option value="Laundry Operations">Laundry Operations</option>
              <option value="Finance">Finance</option>
              <option value="Technical Team">Technical Team</option>
              <option value="Customer Support">Customer Support</option>
            </select>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 text-xs"
                onClick={() => setShowColMenu((v) => !v)}
              >
                Columns <ChevronDown className="h-3 w-3" />
              </Button>
              {showColMenu && (
                <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border border-border bg-card p-3 shadow-xl space-y-2">
                  <p className="text-xs font-semibold text-foreground mb-1">Toggle Columns</p>
                  {Object.keys(visibleCols).map((col) => (
                    <label key={col} className="flex items-center gap-2 text-xs cursor-pointer capitalize">
                      <Checkbox
                        checked={visibleCols[col as keyof typeof visibleCols]}
                        onCheckedChange={(c) =>
                          setVisibleCols((prev) => ({ ...prev, [col]: Boolean(c) }))
                        }
                      />
                      {col}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" className="h-9 gap-1 text-xs" onClick={handleExportCsv}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-xs">
          <span className="font-semibold text-primary">{selectedIds.length} ticket(s) selected</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onBulkAction?.("resolve", selectedIds)}
            >
              Mark Resolved
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs"
              onClick={() => onBulkAction?.("escalate", selectedIds)}
            >
              Escalate Tickets
            </Button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading support tickets...</div>
          ) : sorted.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No tickets match criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <Checkbox
                        checked={selectedIds.length === sorted.length && sorted.length > 0}
                        onCheckedChange={(c) => handleSelectAll(Boolean(c))}
                      />
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:text-foreground"
                      onClick={() => {
                        if (sortField === "ticket_code") setSortAsc(!sortAsc);
                        else { setSortField("ticket_code"); setSortAsc(true); }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Ticket ID <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3">Resident</th>
                    {visibleCols.society && <th className="px-4 py-3">Society</th>}
                    {visibleCols.order && <th className="px-4 py-3">Order</th>}
                    {visibleCols.category && <th className="px-4 py-3">Category</th>}
                    <th className="px-4 py-3">Priority</th>
                    {visibleCols.team && <th className="px-4 py-3">Assigned Team</th>}
                    {visibleCols.executive && <th className="px-4 py-3">Executive</th>}
                    {visibleCols.sla && <th className="px-4 py-3">SLA Status</th>}
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sorted.map((t) => (
                    <tr
                      key={t.id}
                      className={`hover:bg-muted/30 transition cursor-pointer ${
                        t.priority === "Critical" ? "bg-destructive/5" : ""
                      }`}
                      onClick={() => onSelectTicket(t)}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(t.id)}
                          onCheckedChange={(c) => handleSelectOne(t.id, Boolean(c))}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-foreground">{t.ticket_code}</td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div>{t.resident_name || "Resident"}</div>
                        <div className="text-xs text-muted-foreground">{t.resident_phone || "—"}</div>
                      </td>
                      {visibleCols.society && (
                        <td className="px-4 py-3 text-xs text-muted-foreground">{t.society_name || "—"}</td>
                      )}
                      {visibleCols.order && (
                        <td className="px-4 py-3 text-xs font-mono text-primary font-semibold">
                          {t.order_code || "N/A"}
                        </td>
                      )}
                      {visibleCols.category && (
                        <td className="px-4 py-3 text-xs font-medium">{t.category}</td>
                      )}
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            t.priority === "Critical"
                              ? "destructive"
                              : t.priority === "High"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {t.priority}
                        </Badge>
                      </td>
                      {visibleCols.team && (
                        <td className="px-4 py-3 text-xs font-medium text-muted-foreground">{t.assigned_team}</td>
                      )}
                      {visibleCols.executive && (
                        <td className="px-4 py-3 text-xs font-medium">
                          {t.assigned_user_name || "Unassigned"}
                        </td>
                      )}
                      {visibleCols.sla && <td className="px-4 py-3">{getSlaStatusBadge(t)}</td>}
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            t.status === "Resolved" || t.status === "Closed"
                              ? "success"
                              : t.status === "Escalated"
                              ? "destructive"
                              : t.status === "In Progress"
                              ? "default"
                              : "outline"
                          }
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSelectTicket(t)}
                          className="h-8 px-2 text-xs gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Details
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
    </div>
  );
}
