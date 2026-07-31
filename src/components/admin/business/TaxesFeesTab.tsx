"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { 
  Search, Plus, Trash2, Edit, Copy, MoreVertical, 
  Save, X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TaxesFeesTab({ settings, onUpdate }: { settings: any; onUpdate: (b: any) => Promise<boolean> }) {
  const { toast } = useToast();
  
  const [taxes, setTaxes] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rate: "" });

  useEffect(() => {
    if (settings) {
      setTaxes([
        {
          id: "gst",
          tax: "GST",
          description: "Goods and Services Tax",
          rate: settings.gst_percent || 0,
          calcType: "Percentage (%)",
          appliesTo: "Subtotal",
          isActive: true
        },
        {
          id: "service_tax",
          tax: "Service Tax",
          description: "General Service Tax",
          rate: settings.service_tax_percent || 0,
          calcType: "Percentage (%)",
          appliesTo: "Subtotal",
          isActive: true
        },
        {
          id: "platform_fee",
          tax: "Platform Fee",
          description: "Convenience fee for using the platform",
          rate: 0,
          calcType: "Flat Amount (₹)",
          appliesTo: "Per Order",
          isActive: false
        }
      ]);
    }
  }, [settings]);

  const handleSaveEdit = async (id: string) => {
    const newSettings = {
      gstPercent: id === "gst" ? Number(editForm.rate) : taxes.find(t => t.id === "gst")?.rate,
      serviceTaxPercent: id === "service_tax" ? Number(editForm.rate) : taxes.find(t => t.id === "service_tax")?.rate,
    };

    if (id === "platform_fee") {
      // Mocking for UI - since it doesn't exist in settings DB schema yet
      setTaxes(taxes.map(t => t.id === id ? { ...t, rate: Number(editForm.rate) } : t));
      setEditingId(null);
      toast("Platform Fee updated locally (mocked).", "success");
      return;
    }

    const success = await onUpdate({
      section: "settings",
      settings: newSettings
    });

    if (success) {
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-card p-4 shadow-sm border border-border">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search taxes and fees..." 
              className="pl-9 bg-background" 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Tax / Fee
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card className="rounded-xl border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Tax / Fee</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Calculation Type</th>
                <th className="px-4 py-3 font-medium">Applies To</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax) => (
                <tr key={tax.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3 font-medium">{tax.tax}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tax.description}</td>
                  <td className="px-4 py-3 font-bold text-primary w-32">
                    {editingId === tax.id ? (
                      <Input 
                        type="number" 
                        value={editForm.rate} 
                        onChange={e => setEditForm({ rate: e.target.value })}
                        className="w-20 h-8"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center">
                        {tax.calcType.includes("%") ? `${tax.rate}%` : `₹${tax.rate}`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-background">{tax.calcType}</Badge>
                  </td>
                  <td className="px-4 py-3">{tax.appliesTo}</td>
                  <td className="px-4 py-3">
                    <Badge variant={tax.isActive ? "success" : "secondary"} className={tax.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""}>
                      {tax.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === tax.id ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleSaveEdit(tax.id)}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-opacity hover:bg-accent hover:text-accent-foreground h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingId(tax.id);
                            setEditForm({ rate: String(tax.rate) });
                          }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <div className="h-px bg-border my-1" />
                          <DropdownMenuItem>Disable</DropdownMenuItem>
                          <div className="h-px bg-border my-1" />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
