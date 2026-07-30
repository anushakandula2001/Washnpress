"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function AddonServicesTab({ addons, onUpdate }: { addons: any[]; onUpdate: (b: any) => Promise<boolean> }) {
  return (
    <Card className="rounded-xl border-none shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {addons.map((a) => (
            <div key={a.id} className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{a.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                </div>
                <Badge variant={a.is_active ? "success" : "secondary"} className="shrink-0">
                  {a.is_active ? "Active" : "Disabled"}
                </Badge>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xl font-bold text-primary">₹{a.price_inr}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Toggle Status</span>
                  <Switch 
                    checked={a.is_active} 
                    onCheckedChange={(checked) => 
                      onUpdate({
                        section: "addon",
                        addon: { ...a, action: "toggle", isActive: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
