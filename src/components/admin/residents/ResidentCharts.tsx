"use client";

export function ResidentCharts({ data }: { data: Record<string, unknown> }) {
  const orders = (data.orders as Array<Record<string, unknown>>) ?? [];

  const monthlyOrders = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const count = orders.filter((o) => String(o.created_at).startsWith(key)).length;
    return { label: d.toLocaleString("default", { month: "short" }), count };
  });

  const maxCount = Math.max(...monthlyOrders.map((m) => m.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-medium">Monthly Orders</h4>
        <div className="flex h-32 items-end gap-2">
          {monthlyOrders.map((m) => (
            <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                style={{ height: `${(m.count / maxCount) * 100}%`, minHeight: m.count ? 4 : 0 }}
              />
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-medium">Delivery Success</h4>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${orders.length ? (orders.filter((o) => o.status === "Delivered").length / orders.length) * 100 : 0}%`,
            }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {orders.filter((o) => o.status === "Delivered").length} of {orders.length} delivered
        </p>
      </div>
    </div>
  );
}
