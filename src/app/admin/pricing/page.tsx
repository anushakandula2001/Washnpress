"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { adminNav } from "@/lib/portal-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, PackagePlus, Truck, Receipt, CalendarRange, Activity, History } from "lucide-react";

import { GarmentPricingTab } from "@/components/admin/pricing/GarmentPricingTab";
import { AddonServicesTab } from "@/components/admin/pricing/AddonServicesTab";
import { DeliveryChargesTab } from "@/components/admin/pricing/DeliveryChargesTab";
import { TaxesFeesTab } from "@/components/admin/pricing/TaxesFeesTab";
import { SubscriptionsTab } from "@/components/admin/pricing/SubscriptionsTab";
import { PricingHistoryTab } from "@/components/admin/pricing/PricingHistoryTab";
import { AnalyticsTab } from "@/components/admin/pricing/AnalyticsTab";
import { ResidentAppPreview } from "@/components/admin/pricing/ResidentAppPreview";
import { useToast } from "@/components/ui/toast";

export default function AdminPricingPage() {
  const [data, setData] = useState<any>({
    garments: [],
    addons: [],
    settings: null,
    plans: [],
    history: [],
    analytics: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("garments");
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pricing", { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to load pricing data");
      setData(json);
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>) {
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message ?? "Save failed");
      toast("Pricing updated successfully.", "success");
      await load(); // Reload to get fresh history/analytics/data
      return true;
    } catch (e: any) {
      toast(e.message, "error");
      return false;
    }
  }

  if (loading) {
    return (
      <PortalShell navItems={adminNav} portalLabel="Admin Portal" greeting="Pricing Management" subtitle="Loading module...">
        <div className="flex h-64 items-center justify-center">Loading...</div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Pricing Management"
      subtitle="Centralized control for all pricing, taxes, and subscriptions"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="rounded-xl border-none bg-background shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Garments</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.garments.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none bg-background shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Add-ons</CardTitle>
            <PackagePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.addons.filter((a: any) => a.is_active).length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none bg-background shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Max</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.settings?.delivery_fee_inr || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none bg-background shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Taxes</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.settings?.gst_percent || 0) + (data.settings?.service_tax_percent || 0)}%</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none bg-background shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Plans</CardTitle>
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.plans.filter((p: any) => p.is_active).length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none bg-background shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <Activity className="h-4 w-4 text-[#18C5D8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.analytics?.totalRevenue || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 flex flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="garments" className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Garment Pricing</TabsTrigger>
              <TabsTrigger value="addons" className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Add-on Services</TabsTrigger>
              <TabsTrigger value="delivery" className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Delivery Charges</TabsTrigger>
              <TabsTrigger value="taxes" className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Taxes & Fees</TabsTrigger>
              <TabsTrigger value="subscriptions" className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Subscription Plans</TabsTrigger>
              <TabsTrigger value="history" className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pricing History</TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="garments" className="m-0 border-none p-0 outline-none">
              <GarmentPricingTab garments={data.garments} onUpdate={post} />
            </TabsContent>
            
            <TabsContent value="addons" className="m-0 border-none p-0 outline-none">
              <AddonServicesTab addons={data.addons} onUpdate={post} />
            </TabsContent>

            <TabsContent value="delivery" className="m-0 border-none p-0 outline-none">
              <DeliveryChargesTab settings={data.settings} onUpdate={post} />
            </TabsContent>

            <TabsContent value="taxes" className="m-0 border-none p-0 outline-none">
              <TaxesFeesTab settings={data.settings} onUpdate={post} />
            </TabsContent>

            <TabsContent value="subscriptions" className="m-0 border-none p-0 outline-none">
              <SubscriptionsTab plans={data.plans} onUpdate={post} />
            </TabsContent>

            <TabsContent value="history" className="m-0 border-none p-0 outline-none">
              <PricingHistoryTab history={data.history} />
            </TabsContent>

            <TabsContent value="analytics" className="m-0 border-none p-0 outline-none">
              <AnalyticsTab analytics={data.analytics} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky Sidebar for Preview */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="sticky top-6">
            <ResidentAppPreview garments={data.garments} addons={data.addons} settings={data.settings} />
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
