"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal 
} from "lucide-react";

export function BusinessHistoryTab({ history }: { history: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(h => 
    h.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-card p-4 shadow-sm border border-border">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search audit logs..." 
              className="pl-9 bg-background" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      {/* Data Table */}
      <Card className="rounded-xl border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date & Time <ArrowUpDown className="inline ml-1 h-3 w-3" /></th>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Old Value</th>
                <th className="px-4 py-3 font-medium">New Value</th>
                <th className="px-4 py-3 font-medium">Updated By</th>
                <th className="px-4 py-3 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No pricing history found matching your search.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((h, i) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(h.created_at).toLocaleString('en-IN', { 
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-background capitalize">{h.entity_type}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium capitalize">{h.action.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs max-w-[200px] truncate" title={h.details}>
                      {h.action.includes('create') ? '-' : (h.details.length > 30 ? h.details.substring(0, 30) + '...' : h.details || '-')}
                    </td>
                    <td className="px-4 py-3 text-foreground font-mono text-xs max-w-[200px] truncate" title={h.details}>
                      {h.action.includes('delete') ? '-' : (h.details.length > 30 ? h.details.substring(0, 30) + '...' : h.details || 'Updated successfully')}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {h.admin_id ? h.admin_id.substring(0, 2).toUpperCase() : 'AD'}
                      </div>
                      <span className="text-muted-foreground">{h.admin_id || 'System Admin'}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground italic">
                      Routine update via Pricing Management workspace
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 bg-muted/10">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredHistory.length > 0 ? 1 : 0}</span> to <span className="font-medium text-foreground">{Math.min(10, filteredHistory.length)}</span> of <span className="font-medium text-foreground">{filteredHistory.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="ghost" size="sm" disabled><MoreHorizontal className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
