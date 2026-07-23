"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, PackageCheck, CircleCheck, ArrowRight } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OperationsDeliveryPage() {
  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Delivery Operations"
      subtitle="Outbound order fulfillment, driver dispatch, and delivery tracking"
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/80 hover:border-primary/50 transition">
          <CardHeader>
            <div className="flex items-center gap-3">
              <PackageCheck className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">Ready for Delivery</CardTitle>
                <CardDescription>Packed orders awaiting courier pickup</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/operations/ready-delivery">
              <Button className="w-full justify-between" variant="outline">
                Open Ready Queue <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/80 hover:border-primary/50 transition">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">Out for Delivery</CardTitle>
                <CardDescription>Active delivery routes in transit</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/operations/out-for-delivery">
              <Button className="w-full justify-between" variant="outline">
                Open Delivery Routes <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/80 hover:border-primary/50 transition">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CircleCheck className="h-6 w-6 text-emerald-600" />
              <div>
                <CardTitle className="text-lg">Completed Deliveries</CardTitle>
                <CardDescription>Delivered order history and logs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/operations/completed">
              <Button className="w-full justify-between" variant="outline">
                View Completed Log <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
