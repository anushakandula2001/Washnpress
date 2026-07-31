"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shirt, PackagePlus, Truck, Receipt, CalendarRange, Activity, 
  TrendingUp, TrendingDown, ArrowUpRight, BarChart3, PieChart
} from "lucide-react";

export function BusinessAnalyticsTab({ 
  analytics, 
  settings, 
  garments, 
  addons, 
  plans 
}: { 
  analytics: any, 
  settings: any, 
  garments: any[], 
  addons: any[], 
  plans: any[] 
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Pricing & Revenue Analytics</h2>
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Last 30 Days
        </div>
      </div>

      {/* Summary KPI Cards (Moved from Header) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="rounded-xl shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Garments</CardTitle>
            <Shirt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{garments.length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600">
              <TrendingUp className="h-3 w-3 mr-1" /> +2 this month
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Add-ons</CardTitle>
            <PackagePlus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addons.filter((a: any) => a.is_active).length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600">
              <TrendingUp className="h-3 w-3 mr-1" /> +1 this month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery Max</CardTitle>
            <Truck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{settings?.delivery_fee_inr || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 mr-1" /> Unchanged
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Taxes</CardTitle>
            <Receipt className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(settings?.gst_percent || 0) + (settings?.service_tax_percent || 0)}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 mr-1" /> Unchanged
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Plans</CardTitle>
            <CalendarRange className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.filter((p: any) => p.is_active).length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600">
              <TrendingUp className="h-3 w-3 mr-1" /> +15% subscribers
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-border bg-gradient-to-br from-primary/10 via-background to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">Est. Revenue</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{(analytics?.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600">
              <TrendingUp className="h-3 w-3 mr-1" /> +24.5% vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholders */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Revenue Trend (Area Chart Placeholder) */}
        <Card className="col-span-1 lg:col-span-4 rounded-xl shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full rounded-lg bg-muted/20 flex flex-col items-center justify-center border border-dashed border-border/60">
              <Activity className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Area Chart Visualization</p>
              <div className="mt-6 flex w-full max-w-sm items-end justify-between px-4 opacity-40">
                <div className="w-8 bg-primary/20 h-12 rounded-t-sm"></div>
                <div className="w-8 bg-primary/40 h-24 rounded-t-sm"></div>
                <div className="w-8 bg-primary/60 h-20 rounded-t-sm"></div>
                <div className="w-8 bg-primary/80 h-32 rounded-t-sm"></div>
                <div className="w-8 bg-primary h-40 rounded-t-sm"></div>
                <div className="w-8 bg-primary h-48 rounded-t-sm"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Distribution (Donut Chart Placeholder) */}
        <Card className="col-span-1 lg:col-span-3 rounded-xl shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base">Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full rounded-lg bg-muted/20 flex flex-col items-center justify-center border border-dashed border-border/60">
              <PieChart className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground mb-6">Donut Chart Visualization</p>
              
              <div className="w-32 h-32 rounded-full border-[16px] border-primary/20 border-t-primary border-r-primary flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-[16px] border-transparent border-l-amber-400 rotate-45"></div>
                <span className="text-xs font-bold">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Most Used Items (Bar Chart Placeholder) */}
        <Card className="col-span-1 lg:col-span-2 rounded-xl shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base">Top Performing Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full rounded-lg bg-muted/20 flex flex-col items-center justify-center border border-dashed border-border/60">
              <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Bar Chart Visualization</p>
              <div className="mt-4 w-full px-8 opacity-40 space-y-3">
                <div className="w-full flex items-center gap-2"><div className="h-4 w-3/4 bg-primary rounded"></div></div>
                <div className="w-full flex items-center gap-2"><div className="h-4 w-1/2 bg-primary/80 rounded"></div></div>
                <div className="w-full flex items-center gap-2"><div className="h-4 w-1/3 bg-primary/60 rounded"></div></div>
                <div className="w-full flex items-center gap-2"><div className="h-4 w-1/4 bg-primary/40 rounded"></div></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="col-span-1 rounded-xl shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base">Pricing Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="text-sm text-muted-foreground">Average Order Value</span>
              <span className="font-bold">₹485.50</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="text-sm text-muted-foreground">Most Used Garment</span>
              <span className="font-bold text-primary">Men's Shirt</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="text-sm text-muted-foreground">Most Popular Add-on</span>
              <span className="font-bold text-primary">Express Delivery</span>
            </div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm text-muted-foreground">Tax Collection (MTD)</span>
              <span className="font-bold text-rose-500">₹12,450</span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
