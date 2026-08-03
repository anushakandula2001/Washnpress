import * as React from "react";
import { Package, Shirt, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/EmptyState";

export function ItemsTab({
  items,
  addons,
}: {
  items: Array<Record<string, unknown>>;
  addons?: Array<Record<string, unknown>>;
}) {
  const totalQty = items.reduce((s, i) => s + Number(i.quantity ?? 0), 0);

  if (!items.length && !addons?.length) {
    return (
      <EmptyState
        icon={Package}
        title="No Garments Logged"
        description="Garments and add-on services will appear here once the operator logs item counts."
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {items.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Shirt className="h-5 w-5 text-primary" />
              Garments
            </h3>
            <span className="bg-primary/10 text-primary text-sm font-medium px-2.5 py-0.5 rounded-full">
              {totalQty} Items
            </span>
          </div>
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <ul className="divide-y divide-border/50">
                {items.map((item) => (
                  <li key={String(item.id)} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Shirt className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{String(item.category)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-muted-foreground">Qty</span>
                      <span className="font-semibold text-lg">{String(item.quantity)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {addons && addons.length > 0 && (
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <PlusCircle className="h-5 w-5 text-primary" />
            Add-on Services
          </h3>
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <ul className="divide-y divide-border/50">
                {addons.map((a, i) => (
                  <li key={i} className="flex justify-between items-center p-4 hover:bg-muted/10 transition-colors">
                    <div>
                      <p className="font-medium">{String(a.name)}</p>
                      <p className="text-sm text-muted-foreground">Qty: {String(a.quantity ?? 1)}</p>
                    </div>
                    <div className="bg-muted px-3 py-1 rounded-md">
                      <span className="font-semibold">₹{Number(a.price_inr ?? 0).toFixed(0)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
