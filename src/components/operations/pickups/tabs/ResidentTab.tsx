import * as React from "react";
import { User, Phone, Mail, MapPin, Building2, MessageSquareText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatUnit } from "@/components/admin/orders/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ResidentTab({ order }: { order: Record<string, unknown> }) {
  const instructions = order.special_instructions ? String(order.special_instructions) : null;
  const unitStr = formatUnit({
    tower_block: order.tower_block ? String(order.tower_block) : null,
    unit_number: order.unit_number ? String(order.unit_number) : null,
  });

  return (
    <div className="space-y-6 pb-8">
      {instructions && (
        <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          <MessageSquareText className="h-4 w-4 stroke-amber-600" />
          <AlertTitle className="font-semibold text-amber-700">Pickup Notes</AlertTitle>
          <AlertDescription className="mt-2 text-amber-800">
            {instructions}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Resident Profile
          </h3>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</p>
                <p className="font-medium text-lg">{String(order.resident_name ?? "—")}</p>
                {Boolean(order.resident_code) && (
                  <p className="text-sm font-mono text-muted-foreground">{String(order.resident_code)}</p>
                )}
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="font-medium">{String(order.resident_phone ?? "—")}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Location Details
          </h3>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="p-5 flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Society</p>
                <p className="font-medium">{String(order.society_name ?? "—")}</p>
              </div>
            </div>
            <div className="p-5 flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Unit</p>
                <p className="font-medium">{unitStr}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
