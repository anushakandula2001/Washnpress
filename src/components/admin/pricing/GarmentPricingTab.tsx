"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export function GarmentPricingTab({ garments, onUpdate }: { garments: any[]; onUpdate: (b: any) => Promise<boolean> }) {
  const [gForm, setGForm] = useState({ name: "", wash: "", washIron: "", iron: "", dryClean: "" });

  return (
    <Card className="rounded-xl border-none shadow-sm">
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-end gap-3 rounded-lg border border-border p-4 bg-muted/30">
          <div className="grid flex-1 gap-2 sm:grid-cols-5">
            <Input placeholder="Garment name" value={gForm.name} onChange={(e) => setGForm({ ...gForm, name: e.target.value })} className="bg-background" />
            <Input type="number" placeholder="Wash" value={gForm.wash} onChange={(e) => setGForm({ ...gForm, wash: e.target.value })} className="bg-background" />
            <Input type="number" placeholder="Wash+Iron" value={gForm.washIron} onChange={(e) => setGForm({ ...gForm, washIron: e.target.value })} className="bg-background" />
            <Input type="number" placeholder="Iron" value={gForm.iron} onChange={(e) => setGForm({ ...gForm, iron: e.target.value })} className="bg-background" />
            <Input type="number" placeholder="Dry clean" value={gForm.dryClean} onChange={(e) => setGForm({ ...gForm, dryClean: e.target.value })} className="bg-background" />
          </div>
          <Button
            onClick={() => {
              void onUpdate({
                section: "garment",
                garment: {
                  name: gForm.name,
                  washPriceInr: Number(gForm.wash),
                  washIronPriceInr: Number(gForm.washIron),
                  ironPriceInr: Number(gForm.iron),
                  dryCleanPriceInr: Number(gForm.dryClean),
                },
              });
              setGForm({ name: "", wash: "", washIron: "", iron: "", dryClean: "" });
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Garment
          </Button>
        </div>

        <div className="rounded-lg border">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Garment</th>
                <th className="px-4 py-3 font-medium">Wash</th>
                <th className="px-4 py-3 font-medium">Wash+Iron</th>
                <th className="px-4 py-3 font-medium">Iron</th>
                <th className="px-4 py-3 font-medium">Dry Clean</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {garments.map((g) => (
                <tr key={g.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{g.name}</td>
                  <td className="px-4 py-3">₹{g.wash_price_inr}</td>
                  <td className="px-4 py-3 text-primary font-medium">₹{g.wash_iron_price_inr}</td>
                  <td className="px-4 py-3">₹{g.iron_price_inr}</td>
                  <td className="px-4 py-3">₹{g.dry_clean_price_inr}</td>
                  <td className="px-4 py-3">
                    <Badge variant={g.is_active ? "success" : "secondary"}>
                      {g.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void onUpdate({
                          section: "garment",
                          garment: { ...g, action: "toggle", isActive: !g.is_active },
                        })
                      }
                    >
                      {g.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        void onUpdate({
                          section: "garment",
                          garment: { ...g, action: "delete" },
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
