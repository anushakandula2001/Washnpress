"use client";

import { StatusBadge } from "./StatusBadge";

export function ResidentOrders({ data }: { data: Record<string, unknown> }) {
  const orders = (data.orders as Array<Record<string, unknown>>) ?? [];
  const completed = orders.filter((o) => o.status === "Delivered").length;
  const pending = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
  const cancelled = orders.filter((o) => o.status === "Cancelled").length;

  const stats = [
    { label: "Total Orders", value: orders.length },
    { label: "Completed", value: completed },
    { label: "Pending", value: pending },
    { label: "Cancelled", value: cancelled },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-muted/20 p-3 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Items</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={String(o.order_code)} className="border-b border-border/50">
                <td className="px-3 py-2 font-mono text-xs">{String(o.order_code)}</td>
                <td className="px-3 py-2"><StatusBadge status={String(o.status).toLowerCase()} /></td>
                <td className="px-3 py-2">{String(o.pickup_garment_count ?? "—")}</td>
                <td className="px-3 py-2 text-muted-foreground">{new Date(String(o.created_at)).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-4 text-sm text-muted-foreground">No orders yet</p>}
      </div>
    </div>
  );
}
