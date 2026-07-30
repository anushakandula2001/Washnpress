"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";

export function TaxesFeesTab({ settings, onUpdate }: { settings: any; onUpdate: (b: any) => Promise<boolean> }) {
  const [form, setForm] = useState({ gst: "", svcTax: "", otherLbl: "", otherAmt: "" });

  useEffect(() => {
    if (settings) {
      setForm({
        gst: String(settings.gst_percent || 0),
        svcTax: String(settings.service_tax_percent || 0),
        otherLbl: settings.other_charges_label || "Other",
        otherAmt: String(settings.other_charges_inr || 0),
      });
    }
  }, [settings]);

  return (
    <Card className="rounded-xl border-none shadow-sm max-w-2xl">
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">GST (%)</label>
              <Input 
                type="number" 
                value={form.gst} 
                onChange={(e) => setForm({ ...form, gst: e.target.value })} 
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Tax (%)</label>
              <Input 
                type="number" 
                value={form.svcTax} 
                onChange={(e) => setForm({ ...form, svcTax: e.target.value })} 
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-5">
            <h4 className="font-medium">Additional Flat Fees</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Charge Label</label>
                <Input 
                  value={form.otherLbl} 
                  onChange={(e) => setForm({ ...form, otherLbl: e.target.value })} 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Amount (₹)</label>
                <Input 
                  type="number" 
                  value={form.otherAmt} 
                  onChange={(e) => setForm({ ...form, otherAmt: e.target.value })} 
                  className="bg-background"
                />
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={() => onUpdate({
              section: "settings",
              settings: {
                gstPercent: Number(form.gst),
                serviceTaxPercent: Number(form.svcTax),
                otherChargesLabel: form.otherLbl,
                otherChargesInr: Number(form.otherAmt),
              }
            })}
          >
            <Save className="mr-2 h-4 w-4" /> Save Taxes & Fees
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
