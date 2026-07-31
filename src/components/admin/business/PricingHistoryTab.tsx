"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Download, ChevronDown, Search, ArrowUpDown } from "lucide-react";

export function PricingHistoryTab({ history = [] }: { history?: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(h => 
    h.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.entity_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-border shadow-sm flex flex-col h-full">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Pricing History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Track all pricing changes and updates</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full max-w-sm sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search history..." 
                className="pl-9 bg-background h-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="mr-2 h-4 w-4" /> Export <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Item / Service</th>
                <th className="px-4 py-3 font-medium">Change</th>
                <th className="px-4 py-3 font-medium">Updated By</th>
                <th className="px-4 py-3 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No pricing history found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((h, i) => {
                  let changeStr = "-";
                  try {
                    const parsed = JSON.parse(h.details);
                    if (parsed.oldValue && parsed.newValue) {
                      changeStr = `${parsed.oldValue} ➔ ${parsed.newValue}`;
                    } else {
                      changeStr = h.details;
                    }
                  } catch (e) {
                    changeStr = h.details;
                  }

                  return (
                    <tr key={i} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(h.created_at).toLocaleString('en-IN', { 
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 capitalize">{h.entity_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 font-medium capitalize max-w-[200px] truncate" title={h.entity_id}>
                        {h.entity_id?.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs max-w-[200px] truncate" title={changeStr}>
                        {changeStr.length > 40 ? changeStr.substring(0, 40) + '...' : changeStr}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {h.admin_id || 'Platform Admin'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs capitalize">
                        {h.action?.replace(/_/g, ' ')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t text-xs text-muted-foreground flex justify-between items-center mt-auto">
            <span>Showing {filteredHistory.length > 0 ? 1 : 0} to {filteredHistory.length} of {filteredHistory.length} entries</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2" disabled>{"<"}</Button>
              <Button variant="outline" size="sm" className="h-7 w-7 bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20">1</Button>
              <Button variant="outline" size="sm" className="h-7 px-2" disabled>{">"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
