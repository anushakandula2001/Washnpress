"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function DeliveryChargesTab({ settings, onUpdate }: { settings: any; onUpdate: (b: any) => Promise<boolean> }) {
  const { toast } = useToast();
  
  // Delivery Charge Editing State
  const [editingCharge, setEditingCharge] = useState<string | null>(null);
  const [chargeForm, setChargeForm] = useState<any>({});
  
  // Taxes Editing State
  const [isTaxesModalOpen, setIsTaxesModalOpen] = useState(false);
  const [taxesForm, setTaxesForm] = useState<any>({});

  const openChargeModal = (type: string) => {
    setEditingCharge(type);
    if (type === "min_order") {
      setChargeForm({
        amount: settings?.min_order_amount_inr?.toString() || "0",
        description: settings?.min_order_desc || "Minimum order value for delivery",
        isActive: settings?.min_order_is_active !== false,
      });
    } else if (type === "delivery_fee") {
      setChargeForm({
        amount: settings?.delivery_fee_inr?.toString() || "0",
        description: settings?.delivery_fee_desc || "Standard delivery charge",
        isActive: settings?.delivery_fee_is_active !== false,
      });
    } else if (type === "free_delivery") {
      setChargeForm({
        amount: settings?.free_delivery_threshold_inr?.toString() || "0",
        description: settings?.free_delivery_desc || "Free delivery above this amount",
        isActive: settings?.free_delivery_is_active !== false,
      });
    } else if (type === "express") {
      setChargeForm({
        amount: settings?.express_delivery_inr?.toString() || "99",
        description: settings?.express_delivery_desc || "Same-day or next-slot delivery",
        isActive: settings?.express_delivery_is_active !== false,
      });
    } else if (type === "late_night") {
      setChargeForm({
        amount: settings?.late_night_delivery_inr?.toString() || "50",
        description: settings?.late_night_delivery_desc || "10 PM to 7 AM delivery",
        timeRange: settings?.late_night_delivery_time || "10 PM to 7 AM",
        isActive: settings?.late_night_delivery_is_active !== false,
      });
    }
  };

  const handleSaveCharge = async () => {
    // Validation
    if (Number(chargeForm.amount) < 0) {
      toast("Amount cannot be negative.", "error");
      return;
    }
    if (!chargeForm.description?.trim()) {
      toast("Description is required.", "error");
      return;
    }

    let payload: any = {};
    if (editingCharge === "min_order") {
      payload = { minOrderAmountInr: Number(chargeForm.amount), minOrderDesc: chargeForm.description, minOrderIsActive: chargeForm.isActive === "true" || chargeForm.isActive === true };
    } else if (editingCharge === "delivery_fee") {
      payload = { deliveryFeeInr: Number(chargeForm.amount), deliveryFeeDesc: chargeForm.description, deliveryFeeIsActive: chargeForm.isActive === "true" || chargeForm.isActive === true };
    } else if (editingCharge === "free_delivery") {
      payload = { freeDeliveryThresholdInr: Number(chargeForm.amount), freeDeliveryDesc: chargeForm.description, freeDeliveryIsActive: chargeForm.isActive === "true" || chargeForm.isActive === true };
    } else if (editingCharge === "express") {
      payload = { expressDeliveryInr: Number(chargeForm.amount), expressDeliveryDesc: chargeForm.description, expressDeliveryIsActive: chargeForm.isActive === "true" || chargeForm.isActive === true };
    } else if (editingCharge === "late_night") {
      if (!chargeForm.timeRange?.trim()) {
        toast("Time range is required.", "error");
        return;
      }
      payload = { lateNightDeliveryInr: Number(chargeForm.amount), lateNightDeliveryDesc: chargeForm.description, lateNightDeliveryTime: chargeForm.timeRange, lateNightDeliveryIsActive: chargeForm.isActive === "true" || chargeForm.isActive === true };
    }

    const success = await onUpdate({ section: "settings", settings: payload });
    if (success) {
      setEditingCharge(null);
      toast("Delivery charge updated.", "success");
    } else {
      toast("Failed to update charge.", "error");
    }
  };

  const openTaxesModal = () => {
    setTaxesForm({
      gstPercent: settings?.gst_percent?.toString() || "5",
      gstIsActive: settings?.gst_is_active !== false,
      cgstPercent: settings?.cgst_percent?.toString() || "2.5",
      cgstIsActive: settings?.cgst_is_active !== false,
      sgstPercent: settings?.sgst_percent?.toString() || "2.5",
      sgstIsActive: settings?.sgst_is_active !== false,
      serviceTaxPercent: settings?.service_tax_percent?.toString() || "1",
      serviceTaxLabel: settings?.service_tax_label || "Platform convenience fee",
      serviceTaxIsActive: settings?.service_tax_is_active !== false,
      packagingFeeInr: settings?.packaging_fee_inr?.toString() || "10",
      packagingFeeLabel: settings?.packaging_fee_label || "Packaging and handling",
      packagingFeeType: settings?.packaging_fee_type || "flat",
      packagingFeeIsActive: settings?.packaging_fee_is_active !== false,
    });
    setIsTaxesModalOpen(true);
  };

  const handleSaveTaxes = async () => {
    if (Number(taxesForm.gstPercent) < 0 || Number(taxesForm.cgstPercent) < 0 || Number(taxesForm.sgstPercent) < 0 || Number(taxesForm.serviceTaxPercent) < 0 || Number(taxesForm.packagingFeeInr) < 0) {
      toast("Rates and amounts cannot be negative.", "error");
      return;
    }
    if (Number(taxesForm.gstPercent) > 100 || Number(taxesForm.cgstPercent) > 100 || Number(taxesForm.sgstPercent) > 100 || Number(taxesForm.serviceTaxPercent) > 100) {
      toast("Percentages cannot exceed 100.", "error");
      return;
    }
    if (!taxesForm.serviceTaxLabel?.trim() || !taxesForm.packagingFeeLabel?.trim()) {
      toast("Labels cannot be empty.", "error");
      return;
    }

    const payload = {
      gstPercent: Number(taxesForm.gstPercent),
      gstIsActive: taxesForm.gstIsActive === "true" || taxesForm.gstIsActive === true,
      cgstPercent: Number(taxesForm.cgstPercent),
      cgstIsActive: taxesForm.cgstIsActive === "true" || taxesForm.cgstIsActive === true,
      sgstPercent: Number(taxesForm.sgstPercent),
      sgstIsActive: taxesForm.sgstIsActive === "true" || taxesForm.sgstIsActive === true,
      serviceTaxPercent: Number(taxesForm.serviceTaxPercent),
      serviceTaxLabel: taxesForm.serviceTaxLabel,
      serviceTaxIsActive: taxesForm.serviceTaxIsActive === "true" || taxesForm.serviceTaxIsActive === true,
      packagingFeeInr: Number(taxesForm.packagingFeeInr),
      packagingFeeLabel: taxesForm.packagingFeeLabel,
      packagingFeeType: taxesForm.packagingFeeType,
      packagingFeeIsActive: taxesForm.packagingFeeIsActive === "true" || taxesForm.packagingFeeIsActive === true,
    };

    const success = await onUpdate({ section: "settings", settings: payload });
    if (success) {
      setIsTaxesModalOpen(false);
      toast("Taxes & fees updated.", "success");
    } else {
      toast("Failed to update taxes.", "error");
    }
  };

  const renderStatus = (isActive: boolean) => (
    isActive 
      ? <span className="text-emerald-600 font-semibold text-xs">Active</span>
      : <span className="text-muted-foreground font-semibold text-xs">Inactive</span>
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-full">
      
      {/* Top Section: 3. Delivery Charges */}
      <Card className="rounded-xl border border-border shadow-sm w-full">
        <CardHeader className="pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/40 gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">3. Delivery Charges</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Configure delivery fees and related charges</p>
          </div>
        </CardHeader>
        <CardContent className="p-0 w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Charge Type</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Amount (₹)</th>
                <th className="px-6 py-4 font-medium">Applicable On</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-center w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Minimum Order */}
              <tr className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">Minimum Order Amount</td>
                <td className="px-6 py-4 text-muted-foreground">{settings?.min_order_desc || "Minimum order value for delivery"}</td>
                <td className="px-6 py-4 text-foreground font-medium">{Number(settings?.min_order_amount_inr || 0).toFixed(2)}</td>
                <td className="px-6 py-4">All Orders</td>
                <td className="px-6 py-4">{renderStatus(settings?.min_order_is_active !== false)}</td>
                <td className="px-6 py-4 text-center"><Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 hover:opacity-100" onClick={() => openChargeModal("min_order")}><Edit className="h-4 w-4" /></Button></td>
              </tr>
              {/* Delivery Fee */}
              <tr className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">Delivery Fee</td>
                <td className="px-6 py-4 text-muted-foreground">{settings?.delivery_fee_desc || "Standard delivery charge"}</td>
                <td className="px-6 py-4 text-foreground font-medium">{Number(settings?.delivery_fee_inr || 0).toFixed(2)}</td>
                <td className="px-6 py-4">Orders {"<"} ₹{Number(settings?.free_delivery_threshold_inr || 0).toFixed(0)}</td>
                <td className="px-6 py-4">{renderStatus(settings?.delivery_fee_is_active !== false)}</td>
                <td className="px-6 py-4 text-center"><Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 hover:opacity-100" onClick={() => openChargeModal("delivery_fee")}><Edit className="h-4 w-4" /></Button></td>
              </tr>
              {/* Free Delivery Threshold */}
              <tr className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">Free Delivery Threshold</td>
                <td className="px-6 py-4 text-muted-foreground">{settings?.free_delivery_desc || "Free delivery above this amount"}</td>
                <td className="px-6 py-4 text-foreground font-medium">{Number(settings?.free_delivery_threshold_inr || 0).toFixed(2)}</td>
                <td className="px-6 py-4">All Orders</td>
                <td className="px-6 py-4">{renderStatus(settings?.free_delivery_is_active !== false)}</td>
                <td className="px-6 py-4 text-center"><Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 hover:opacity-100" onClick={() => openChargeModal("free_delivery")}><Edit className="h-4 w-4" /></Button></td>
              </tr>
              {/* Express Delivery */}
              <tr className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">Express Delivery</td>
                <td className="px-6 py-4 text-muted-foreground">{settings?.express_delivery_desc || "Same-day or next-slot delivery"}</td>
                <td className="px-6 py-4 text-foreground font-medium">{Number(settings?.express_delivery_inr ?? 99).toFixed(2)}</td>
                <td className="px-6 py-4">All Orders</td>
                <td className="px-6 py-4">{renderStatus(settings?.express_delivery_is_active !== false)}</td>
                <td className="px-6 py-4 text-center"><Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 hover:opacity-100" onClick={() => openChargeModal("express")}><Edit className="h-4 w-4" /></Button></td>
              </tr>
              {/* Late Night Delivery */}
              <tr className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">Late Night Delivery</td>
                <td className="px-6 py-4 text-muted-foreground">{settings?.late_night_delivery_desc || "10 PM to 7 AM delivery"}</td>
                <td className="px-6 py-4 text-foreground font-medium">{Number(settings?.late_night_delivery_inr ?? 50).toFixed(2)}</td>
                <td className="px-6 py-4">{settings?.late_night_delivery_time || "10 PM to 7 AM"}</td>
                <td className="px-6 py-4">{renderStatus(settings?.late_night_delivery_is_active !== false)}</td>
                <td className="px-6 py-4 text-center"><Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 hover:opacity-100" onClick={() => openChargeModal("late_night")}><Edit className="h-4 w-4" /></Button></td>
              </tr>
            </tbody>
          </table>
          <div className="px-6 py-4 bg-primary/10/50 flex items-start gap-3 border-t border-border">
            <div className="h-5 w-5 rounded-full border border-[#14B8A6] text-[#14B8A6] flex items-center justify-center text-xs mt-0.5">i</div>
            <p className="text-sm text-muted-foreground">Delivery charges are applied automatically based on order value, time and conditions.</p>
          </div>
        </CardContent>
      </Card>

      {/* Charge Modal */}
      <Dialog open={editingCharge !== null} onOpenChange={(open) => !open && setEditingCharge(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Edit Delivery Charge</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount/Threshold (₹)</label>
              <Input type="number" placeholder="0" value={chargeForm.amount} onChange={e => setChargeForm({...chargeForm, amount: e.target.value})} />
            </div>
            {editingCharge === "late_night" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <Input type="text" placeholder="e.g. 10 PM to 7 AM" value={chargeForm.timeRange} onChange={e => setChargeForm({...chargeForm, timeRange: e.target.value})} />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input type="text" placeholder="Description" value={chargeForm.description} onChange={e => setChargeForm({...chargeForm, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" value={chargeForm.isActive?.toString()} onChange={e => setChargeForm({...chargeForm, isActive: e.target.value})}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCharge(null)}>Cancel</Button>
            <Button onClick={handleSaveCharge}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom Section: 4. Taxes & Fees */}
      <Card className="rounded-xl border border-border shadow-sm w-full">
        <CardHeader className="pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/40 gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">4. Taxes & Fees</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Manage taxes and additional fees</p>
          </div>
          <Button variant="outline" size="sm" className="h-9 px-4 font-medium" onClick={openTaxesModal}>
            <Edit className="mr-2 h-4 w-4" /> Edit Taxes
          </Button>
        </CardHeader>
        <CardContent className="p-0 w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Label / Description</th>
                <th className="px-6 py-4 font-medium">Rate (%)</th>
                <th className="px-6 py-4 font-medium">Amount / Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* GST */}
              <tr className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">GST</td>
                <td className="px-6 py-4 text-muted-foreground">Goods & Services Tax</td>
                <td className="px-6 py-4 text-foreground font-medium">{Number(settings?.gst_percent || 0).toFixed(2)}</td>
                <td className="px-6 py-4">%</td>
                <td className="px-6 py-4">{renderStatus(settings?.gst_is_active !== false)}</td>
              </tr>
              {/* CGST */}
              <tr className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">CGST</td>
                <td className="px-6 py-4 text-muted-foreground">Central GST</td>
                <td className="px-6 py-4 text-foreground font-medium">{Number(settings?.cgst_percent ?? 2.5).toFixed(2)}</td>
                <td className="px-6 py-4">%</td>
                <td className="px-6 py-4">{renderStatus(settings?.cgst_is_active !== false)}</td>
              </tr>
              {/* SGST */}
              <tr className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">SGST</td>
                <td className="px-6 py-4 text-muted-foreground">State GST</td>
                <td className="px-6 py-4 text-foreground font-medium">{Number(settings?.sgst_percent ?? 2.5).toFixed(2)}</td>
                <td className="px-6 py-4">%</td>
                <td className="px-6 py-4">{renderStatus(settings?.sgst_is_active !== false)}</td>
              </tr>
              {/* Convenience Fee */}
              <tr className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">Convenience Fee</td>
                <td className="px-6 py-4 text-muted-foreground">{settings?.service_tax_label || "Platform convenience fee"}</td>
                <td className="px-6 py-4 text-foreground font-medium">{Number(settings?.service_tax_percent ?? 1).toFixed(2)}</td>
                <td className="px-6 py-4">%</td>
                <td className="px-6 py-4">{renderStatus(settings?.service_tax_is_active !== false)}</td>
              </tr>
              {/* Packaging Fee */}
              <tr className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">Packaging Fee</td>
                <td className="px-6 py-4 text-muted-foreground">{settings?.packaging_fee_label || "Packaging and handling"}</td>
                <td className="px-6 py-4 text-foreground font-medium">{Number(settings?.packaging_fee_inr ?? 10).toFixed(2)}</td>
                <td className="px-6 py-4">{settings?.packaging_fee_type === "percent" ? "Percent (%)" : "Flat (₹)"}</td>
                <td className="px-6 py-4">{renderStatus(settings?.packaging_fee_is_active !== false)}</td>
              </tr>
            </tbody>
          </table>
          <div className="px-6 py-4 bg-primary/10/50 flex items-start gap-3 border-t border-border">
            <div className="h-5 w-5 rounded-full border border-[#14B8A6] text-[#14B8A6] flex items-center justify-center text-xs mt-0.5">i</div>
            <p className="text-sm text-muted-foreground">Taxes are calculated on the order subtotal after discounts and before final amount.</p>
          </div>
        </CardContent>
      </Card>

      {/* Taxes Modal */}
      <Dialog open={isTaxesModalOpen} onOpenChange={setIsTaxesModalOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Taxes & Fees</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            
            {/* GST */}
            <div className="p-3 border rounded-lg space-y-3 bg-muted/20">
              <div className="font-semibold text-sm">Goods & Services Tax (GST)</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Rate (%)</label>
                  <Input type="number" placeholder="5" value={taxesForm.gstPercent} onChange={e => setTaxesForm({...taxesForm, gstPercent: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Status</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={taxesForm.gstIsActive?.toString()} onChange={e => setTaxesForm({...taxesForm, gstIsActive: e.target.value})}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CGST & SGST */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg space-y-3 bg-muted/20">
                <div className="font-semibold text-sm">CGST</div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Rate (%)</label>
                  <Input type="number" placeholder="2.5" value={taxesForm.cgstPercent} onChange={e => setTaxesForm({...taxesForm, cgstPercent: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Status</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={taxesForm.cgstIsActive?.toString()} onChange={e => setTaxesForm({...taxesForm, cgstIsActive: e.target.value})}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="p-3 border rounded-lg space-y-3 bg-muted/20">
                <div className="font-semibold text-sm">SGST</div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Rate (%)</label>
                  <Input type="number" placeholder="2.5" value={taxesForm.sgstPercent} onChange={e => setTaxesForm({...taxesForm, sgstPercent: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Status</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={taxesForm.sgstIsActive?.toString()} onChange={e => setTaxesForm({...taxesForm, sgstIsActive: e.target.value})}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Convenience Fee */}
            <div className="p-3 border rounded-lg space-y-3 bg-muted/20">
              <div className="font-semibold text-sm">Convenience Fee</div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Label</label>
                <Input type="text" placeholder="Platform convenience fee" value={taxesForm.serviceTaxLabel} onChange={e => setTaxesForm({...taxesForm, serviceTaxLabel: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Rate (%)</label>
                  <Input type="number" placeholder="1" value={taxesForm.serviceTaxPercent} onChange={e => setTaxesForm({...taxesForm, serviceTaxPercent: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Status</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={taxesForm.serviceTaxIsActive?.toString()} onChange={e => setTaxesForm({...taxesForm, serviceTaxIsActive: e.target.value})}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Packaging Fee */}
            <div className="p-3 border rounded-lg space-y-3 bg-muted/20">
              <div className="font-semibold text-sm">Packaging Fee</div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Label</label>
                <Input type="text" placeholder="Packaging and handling" value={taxesForm.packagingFeeLabel} onChange={e => setTaxesForm({...taxesForm, packagingFeeLabel: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Amount</label>
                  <Input type="number" placeholder="10" value={taxesForm.packagingFeeInr} onChange={e => setTaxesForm({...taxesForm, packagingFeeInr: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Type</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={taxesForm.packagingFeeType} onChange={e => setTaxesForm({...taxesForm, packagingFeeType: e.target.value})}>
                    <option value="flat">Flat (₹)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Status</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={taxesForm.packagingFeeIsActive?.toString()} onChange={e => setTaxesForm({...taxesForm, packagingFeeIsActive: e.target.value})}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaxesModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTaxes}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
