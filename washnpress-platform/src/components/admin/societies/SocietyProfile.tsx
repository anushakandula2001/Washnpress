"use client";

import { Building2, MapPin, Users, ShoppingBag, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/admin/shared/StatCard";
import { StatusBadge } from "./StatusBadge";
import { SocietyResidents } from "./SocietyResidents";
import { SocietyOperators } from "./SocietyOperators";
import { SocietyExecutives } from "./SocietyExecutives";
import { SocietyPickupSlots } from "./SocietyPickupSlots";
import { SocietyOrders } from "./SocietyOrders";
import { SocietySubscriptions } from "./SocietySubscriptions";
import { SocietyAnalytics } from "./SocietyAnalytics";
import { SocietyNotifications } from "./SocietyNotifications";
import { SocietyAuditLogs } from "./SocietyAuditLogs";
import { SocietySettings } from "./SocietySettings";
import type { SocietyDetailData } from "./types";

export function SocietyProfile({
  data,
  tab,
  onTabChange,
  onAssignOperator,
  onUpdated,
}: {
  data: SocietyDetailData;
  tab: string;
  onTabChange: (tab: string) => void;
  onAssignOperator: () => void;
  onUpdated: () => void;
}) {
  const { society, towers, operators, residents, orders } = data;
  const flats = towers.reduce((s, t) => s + t.flats_count, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building2 className="h-5 w-5 text-primary" />
                {society.name}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {society.address_line_1 ? `${society.address_line_1}, ` : ""}
                {society.city}, {society.state} {society.pincode ?? ""}
              </CardDescription>
            </div>
            <StatusBadge status={society.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Towers" value={towers.length} icon={Layers} />
            <StatCard title="Flats" value={flats} icon={Building2} accent="blue" />
            <StatCard title="Residents" value={residents.length} icon={Users} accent="green" />
            <StatCard title="Orders" value={orders.length} icon={ShoppingBag} accent="orange" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
          <TabsTrigger value="operators">Operators</TabsTrigger>
          <TabsTrigger value="executives">Executives</TabsTrigger>
          <TabsTrigger value="slots">Pickup Slots</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Towers</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {towers.map((t) => (
                  <div key={t.id} className="rounded-lg border border-border p-3">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-muted-foreground">
                      Floors {t.floors_count} · Flats {t.flats_count} · Residents {t.residents_count}
                    </p>
                  </div>
                ))}
                {towers.length === 0 && <p className="text-muted-foreground">No towers configured</p>}
              </CardContent>
            </Card>
            <SocietyOperators operators={operators} onAssign={onAssignOperator} />
          </div>
        </TabsContent>

        <TabsContent value="residents">
          <SocietyResidents residents={residents} societyId={society.id} />
        </TabsContent>
        <TabsContent value="operators">
          <SocietyOperators operators={operators} onAssign={onAssignOperator} />
        </TabsContent>
        <TabsContent value="executives">
          <SocietyExecutives societyId={society.id} />
        </TabsContent>
        <TabsContent value="slots">
          <SocietyPickupSlots societyId={society.id} />
        </TabsContent>
        <TabsContent value="orders">
          <SocietyOrders orders={orders} />
        </TabsContent>
        <TabsContent value="subscriptions">
          <SocietySubscriptions societyId={society.id} societyName={society.name} />
        </TabsContent>
        <TabsContent value="analytics">
          <SocietyAnalytics data={data} />
        </TabsContent>
        <TabsContent value="notifications">
          <SocietyNotifications societyId={society.id} societyName={society.name} />
        </TabsContent>
        <TabsContent value="audit">
          <SocietyAuditLogs societyId={society.id} />
        </TabsContent>
        <TabsContent value="settings">
          <SocietySettings society={society} onUpdated={onUpdated} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
