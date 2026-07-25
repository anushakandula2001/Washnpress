"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { StatusBadge } from "./StatusBadge";
import type { SocietyOrder } from "./types";

export function SocietyOrders({ orders }: { orders: SocietyOrder[] }) {
  if (orders.length === 0) {
    return <EmptyState title="No orders" description="Orders from residents at this society will appear here." />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Orders</CardTitle>
        <Link href="/admin/orders" className="text-sm text-primary no-underline hover:underline">View all orders</Link>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Resident</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.order_code} className="border-b border-border/60 hover:bg-muted/30">
                <td className="px-4 py-2">
                  <Link href={`/admin/orders?order=${o.order_code}`} className="font-mono text-primary no-underline hover:underline">
                    {o.order_code}
                  </Link>
                </td>
                <td className="px-4 py-2">{o.resident_name}</td>
                <td className="px-4 py-2"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
