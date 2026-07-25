"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Package } from "lucide-react";

type QueueItem = {
  order_code: string;
  status: string;
  pickup_garment_count: number;
  scheduled_for: string;
  unit_number: string;
  tower_block: string | null;
  society_name: string;
  resident_name: string;
};

export default function PickupsPage() {
  const [pickups, setPickups] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/operations/queue", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        // Filter for pickups
        const pickupStatuses = ["Scheduled", "Pickup Scheduled"];
        setPickups(data.queue?.filter((q: QueueItem) => pickupStatuses.includes(q.status)) || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Pending Pickups"
      subtitle="Manage your upcoming resident pickups"
    >
      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading pickups...</div>
      ) : pickups.length === 0 ? (
        <div className="py-20 text-center border rounded-xl border-dashed">
          <Package className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No pending pickups</h3>
          <p className="text-sm text-muted-foreground">You have no scheduled pickups at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pickups.map((p) => (
            <Card key={p.order_code} className="hover:border-primary/50 transition">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-bold">{p.order_code}</CardTitle>
                  <Badge variant={p.status === "Scheduled" ? "secondary" : "default"}>
                    {p.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {new Date(p.scheduled_for).toLocaleString(undefined, {
                    month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                  })}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{p.resident_name}</p>
                    <p className="text-xs text-muted-foreground">Resident</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm border-t pt-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {p.unit_number}{p.tower_block ? `, ${p.tower_block}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.society_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
