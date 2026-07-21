"use client";

import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/EmptyState";

export function OrderItems({
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
        title="No items recorded"
        description="Garment categories will appear once the operator logs item counts."
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-medium">Garments ({totalQty} total)</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={String(item.id)} className="border-b border-border/60 last:border-0">
                    <td className="py-2">{String(item.category)}</td>
                    <td className="py-2 text-right font-medium">{String(item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
      {addons && addons.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-medium">Add-on Services</p>
            <ul className="space-y-2 text-sm">
              {addons.map((a, i) => (
                <li key={i} className="flex justify-between border-b border-border/60 py-2 last:border-0">
                  <span>
                    {String(a.name)} × {String(a.quantity ?? 1)}
                  </span>
                  <span className="font-medium">₹{Number(a.price_inr ?? 0).toFixed(0)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
