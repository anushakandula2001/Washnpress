"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";

export function SubscriptionsTab({ plans, onUpdate }: { plans: any[]; onUpdate: (b: any) => Promise<boolean> }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {plans.map((p) => (
        <Card key={p.id} className="relative overflow-hidden rounded-2xl border-2 hover:border-primary/50 transition-colors">
          {p.name?.toLowerCase().includes('premium') && (
            <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              RECOMMENDED
            </div>
          )}
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">{p.name || p.tier}</CardTitle>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight">₹{p.monthly_inr}</span>
              <span className="text-sm font-medium text-muted-foreground">/mo</span>
            </div>
            {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Up to <strong className="font-semibold">{p.garment_cap}</strong> garments</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span><strong className="font-semibold">{p.max_pickups}</strong> pickups/month</span>
              </li>
              {p.free_delivery && (
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Free delivery</span>
                </li>
              )}
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={p.is_active} 
                  onCheckedChange={(checked) => 
                    onUpdate({ section: "plan", plan: { ...p, action: "toggle", isActive: checked } })
                  }
                />
                <span className="text-xs font-medium">{p.is_active ? 'Active' : 'Hidden'}</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => onUpdate({ section: "plan", plan: { ...p, action: "delete" } })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
