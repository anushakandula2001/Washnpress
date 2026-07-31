"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";

export function DeliveryChargesTab({ settings, onUpdate }: { settings: any; onUpdate: (b: any) => Promise<boolean> }) {
  const [form, setForm] = useState({ minOrder: "", fee: "", threshold: "" });

  useEffect(() => {
    if (settings) {
      setForm({
        minOrder: String(settings.min_order_amount_inr || 0),
        fee: String(settings.delivery_fee_inr || 0),
        threshold: String(settings.free_delivery_threshold_inr || 0),
      });
    }
  }, [settings]);

  return (
    <Card className="rounded-xl border-none shadow-sm max-w-2xl">
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Minimum Order Amount (₹)
            </label>
            <p className="text-sm text-muted-foreground">Orders below this amount cannot be placed.</p>
            <Input 
              type="number" 
              value={form.minOrder} 
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })} 
              className="max-w-md bg-muted/50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Standard Delivery Fee (₹)
            </label>
            <p className="text-sm text-muted-foreground">Flat fee applied to all standard deliveries.</p>
            <Input 
              type="number" 
              value={form.fee} 
              onChange={(e) => setForm({ ...form, fee: e.target.value })} 
              className="max-w-md bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Free Delivery Threshold (₹)
            </label>
            <p className="text-sm text-muted-foreground">Orders above this amount get free delivery.</p>
            <Input 
              type="number" 
              value={form.threshold} 
              onChange={(e) => setForm({ ...form, threshold: e.target.value })} 
              className="max-w-md bg-muted/50"
            />
          </div>
          
          <Button 
            className="w-full max-w-md"
            onClick={() => onUpdate({
              section: "settings",
              settings: {
                minOrderAmountInr: Number(form.minOrder),
                deliveryFeeInr: Number(form.fee),
                freeDeliveryThresholdInr: Number(form.threshold),
              }
            })}
          >
            <Save className="mr-2 h-4 w-4" /> Save Delivery Rules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
