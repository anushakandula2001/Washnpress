"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsTab({ analytics }: { analytics: any }) {
  if (!analytics) return <div className="p-8 text-center text-muted-foreground">Analytics loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Popular Garments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topGarments?.map((g: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      #{i + 1}
                    </div>
                    <span className="font-medium">{g.name}</span>
                  </div>
                  <span className="font-semibold">{g.count} ordered</span>
                </div>
              ))}
              {(!analytics.topGarments || analytics.topGarments.length === 0) && (
                <p className="text-sm text-muted-foreground">No data available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Popular Add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topAddons?.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      #{i + 1}
                    </div>
                    <span className="font-medium capitalize">{a.addon_code.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="font-semibold">{a.count} times applied</span>
                </div>
              ))}
              {(!analytics.topAddons || analytics.topAddons.length === 0) && (
                <p className="text-sm text-muted-foreground">No data available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
