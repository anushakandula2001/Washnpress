"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function PricingHistoryTab({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return (
      <Card className="rounded-xl border-none shadow-sm">
        <CardContent className="py-10 text-center text-muted-foreground">
          No pricing history found. Changes made will appear here.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-none shadow-sm">
      <CardContent className="p-0">
        <div className="rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Item Name</th>
                <th className="px-4 py-3 font-medium">Remarks</th>
                <th className="px-4 py-3 font-medium">Changed By</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-border/60 hover:bg-muted/30">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {format(new Date(item.created_at), "MMM d, yyyy h:mm a")}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <Badge variant="outline">{item.module}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">{item.item_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.remarks}</td>
                  <td className="px-4 py-3">{item.updated_by_name || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
