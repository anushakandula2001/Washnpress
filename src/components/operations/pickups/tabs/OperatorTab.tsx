import * as React from "react";
import { UserCircle2, Phone, Building2, MapPin, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function OperatorTab({
  order,
  operators,
}: {
  order: Record<string, unknown>;
  operators: Array<Record<string, unknown>>;
}) {
  const operatorName = String(order.operator_name || "—");
  const operatorPhone = String(order.operator_phone || "—");
  const operatorCode = String(order.operator_code || "—");
  const isAssigned = !!order.operator_id;

  return (
    <div className="space-y-6 pb-8">
      {isAssigned ? (
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-border/50 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <UserCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{operatorName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="font-mono">{operatorCode}</Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  Assigned
                </Badge>
              </div>
            </div>
          </div>
          
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
              <div className="p-5 flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Contact Number</p>
                  <p className="font-medium text-lg">{operatorPhone}</p>
                </div>
              </div>
              <div className="p-5 flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Assigned Society</p>
                  <p className="font-medium text-lg">{String(order.society_name || "—")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl border-dashed">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserCircle2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Operator Assigned</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This pickup has not been assigned to any operator yet.
          </p>
        </div>
      )}

      {operators.length > 0 && !isAssigned && (
        <div className="mt-8">
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Available Operators for {String(order.society_name)}
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {operators.map((op) => (
              <div key={String(op.id)} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{String(op.full_name)}</p>
                    <p className="text-sm text-muted-foreground font-mono">{String(op.operator_code)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{String(op.phone)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
