import * as React from "react";
import { MessageSquare, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function NotesTab({
  order,
  tickets,
}: {
  order: Record<string, unknown>;
  tickets: Array<Record<string, unknown>>;
}) {
  return (
    <div className="space-y-6 pb-8">
      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl border-dashed">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Notes Available</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            There are no support tickets or operator notes for this pickup yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Support Tickets & Notes
          </h3>
          <div className="grid gap-4">
            {tickets.map((t) => (
              <Card key={String(t.id)} className="border-border/50 shadow-sm overflow-hidden">
                <div className="bg-muted/20 px-4 py-3 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{String(t.ticket_code)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {String(t.category)}
                    </Badge>
                  </div>
                  <Badge variant={t.status === "open" ? "default" : "outline"} className="text-xs">
                    {String(t.status)}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm">{String(t.description)}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(String(t.created_at)).toLocaleString()}
                    </span>
                    <span className="capitalize">Priority: {String(t.priority)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
