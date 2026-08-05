"use client";

import { readApiJson } from "@/frontend/api-client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { adminNav } from "@/lib/portal-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye,
  ArrowUpDown,
  ChevronDown,
  Shirt,
  Gift,
  Building2,
  Crown,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Minus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";

import { PricingTab } from "@/components/admin/business/PricingTab";
import { AddonServicesTab } from "@/components/admin/business/AddonServicesTab";
import { DeliveryChargesTab } from "@/components/admin/business/DeliveryChargesTab";
import { TaxesFeesTab } from "@/components/admin/business/TaxesFeesTab";
import { SubscriptionsTab } from "@/components/admin/business/SubscriptionsTab";
import { PricingHistoryTab } from "@/components/admin/business/PricingHistoryTab";

export default function BusinessManagementPage() {
  const [data, setData] = useState<any>({
    garments: [],
    addons: [],
    settings: null,
    plans: [],
    history: [],
    analytics: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pricing");
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pricing", { credentials: "same-origin" });
      const json = await readApiJson(res);
      if (!res.ok) throw new Error(json.message ?? "Failed to load business data");
      setData(json);
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function post(body: Record<string, unknown>) {
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await readApiJson(res);
      if (!res.ok) throw new Error(result.message ?? "Save failed");
      toast("Business configuration updated successfully.", "success");
      await load();
      return true;
    } catch (e: any) {
      toast(e.message, "error");
      return false;
    }
  }

  if (loading) {
    return (
      <PortalShell navItems={adminNav} portalLabel="Admin Portal" greeting="Business Management" subtitle="Loading module...">
        <div className="flex h-64 items-center justify-center">Loading...</div>
      </PortalShell>
    );
  }

  const HeaderActions = (
    <div className="flex items-center gap-3">
      <Button variant="outline" className="h-9 px-3 text-sm font-medium border-border/80 rounded-md">
        <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> Preview Resident Portal
      </Button>
      <Button variant="outline" className="h-9 px-3 text-sm font-medium border-border/80 rounded-md">
        <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" /> Export
      </Button>
      <Button variant="outline" className="h-9 px-3 text-sm font-medium border-border/80 rounded-md">
        <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" /> Import
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#14B8A6] text-white hover:bg-[#14B8A6]/90 h-9 px-3 border-none shadow-sm">
          Quick Actions <ChevronDown className="ml-2 h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>New Garment</DropdownMenuItem>
          <DropdownMenuItem>New Add-on</DropdownMenuItem>
          <DropdownMenuItem>New Delivery Rule</DropdownMenuItem>
          <DropdownMenuItem>New Tax</DropdownMenuItem>
          <DropdownMenuItem>New Subscription</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Business Management"
      subtitle="Manage business configuration across pricing, subscriptions, societies and revenue."
    >
      {/* <div className="mb-6 flex justify-end -mt-14 relative z-10 pr-2">
        {HeaderActions}
      </div> */}

      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        {/* Top KPI Cards Dashboard */}
        {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Garments</p>
                  <h3 className="text-2xl font-bold">{data.garments?.length || 68}</h3>
                  <p className="text-xs text-muted-foreground">Active items</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#14B8A6]/10 flex items-center justify-center">
                  <Shirt className="h-5 w-5 text-[#14B8A6]" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" /> ↑ 12% vs last month
              </div>
            </CardContent>
          </Card> */}

        {/* <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Active Add-ons</p>
                  <h3 className="text-2xl font-bold">{data.addons?.length || 12}</h3>
                  <p className="text-xs text-muted-foreground">Active services</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" /> ↑ 8% vs last month
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Subscription Plans</p>
                  <h3 className="text-2xl font-bold">{data.plans?.length || 4}</h3>
                  <p className="text-xs text-muted-foreground">Active plans</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" /> ↑ 5% vs last month
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Active Societies</p>
                  <h3 className="text-2xl font-bold">14</h3>
                  <p className="text-xs text-muted-foreground">Onboarded</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" /> ↑ 2 new this week
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Monthly Revenue</p>
                  <h3 className="text-2xl font-bold">₹2.4L</h3>
                  <p className="text-xs text-muted-foreground">Current month</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#14B8A6]/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-[#14B8A6]" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" /> ↑ 18% vs last month
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Today's Orders</p>
                  <h3 className="text-2xl font-bold">142</h3>
                  <p className="text-xs text-muted-foreground">Across all societies</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" /> ↑ 12% vs yesterday
              </div>
            </CardContent>
          </Card>
        </div> */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex flex-wrap justify-start gap-4 bg-transparent p-0 border-b border-border/60 w-full overflow-x-auto pb-px">
            <TabsTrigger
              value="pricing"
              className="rounded-none border-b-2 border-transparent px-4 py-3 font-semibold data-[state=active]:border-[#14B8A6] data-[state=active]:text-[#14B8A6] data-[state=active]:bg-transparent transition-all hover:text-foreground"
            >
              1. Pricing
            </TabsTrigger>
            <TabsTrigger
              value="addons"
              className="rounded-none border-b-2 border-transparent px-4 py-3 font-semibold data-[state=active]:border-[#14B8A6] data-[state=active]:text-[#14B8A6] data-[state=active]:bg-transparent transition-all hover:text-foreground"
            >
              2. Add-on Services
            </TabsTrigger>
            <TabsTrigger
              value="delivery"
              className="rounded-none border-b-2 border-transparent px-4 py-3 font-semibold data-[state=active]:border-[#14B8A6] data-[state=active]:text-[#14B8A6] data-[state=active]:bg-transparent transition-all hover:text-foreground"
            >
              3. Delivery Charges
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="rounded-none border-b-2 border-transparent px-4 py-3 font-semibold data-[state=active]:border-[#14B8A6] data-[state=active]:text-[#14B8A6] data-[state=active]:bg-transparent transition-all hover:text-foreground"
            >
              4. Subscription Plans
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none border-b-2 border-transparent px-4 py-3 font-semibold data-[state=active]:border-[#14B8A6] data-[state=active]:text-[#14B8A6] data-[state=active]:bg-transparent transition-all hover:text-foreground"
            >
              5. Pricing History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="m-0 border-none p-0 outline-none">
            <PricingTab garments={data.garments} addons={data.addons} onUpdate={post} />
          </TabsContent>

          <TabsContent value="addons" className="m-0 border-none p-0 outline-none">
            <AddonServicesTab addons={data.addons} onUpdate={post} />
          </TabsContent>

          <TabsContent value="delivery" className="m-0 border-none p-0 outline-none">
            <DeliveryChargesTab settings={data.settings} onUpdate={post} />
          </TabsContent>

          <TabsContent value="subscriptions" className="m-0 mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <SubscriptionsTab plans={data.plans || []} onUpdate={post} onRefresh={load} />
          </TabsContent>

          <TabsContent value="history" className="m-0 border-none p-0 outline-none">
            <PricingHistoryTab history={data.history} />
          </TabsContent>
        </Tabs>
      </div>
    </PortalShell >
  );
}
