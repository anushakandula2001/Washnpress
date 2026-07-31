"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ResidentAppPreview({ garments, addons, settings }: any) {
  // Mock up an order to show how pricing affects the final total
  const selectedGarment = garments?.find((g: any) => g.is_active) || { wash_iron_price_inr: 0, name: "Sample Garment" };
  const selectedAddon = addons?.find((a: any) => a.is_active) || { price_inr: 0, name: "Sample Addon" };
  
  const subtotal = Number(selectedGarment.wash_iron_price_inr) * 3 + Number(selectedAddon.price_inr);
  
  let deliveryFee = Number(settings?.delivery_fee_inr || 0);
  if (subtotal >= Number(settings?.free_delivery_threshold_inr || 99999)) {
    deliveryFee = 0;
  }

  const taxesPercent = Number(settings?.gst_percent || 0) + Number(settings?.service_tax_percent || 0);
  const taxAmount = (subtotal * taxesPercent) / 100;
  
  const otherCharges = Number(settings?.other_charges_inr || 0);
  const total = subtotal + deliveryFee + taxAmount + otherCharges;

  return (
    <Card className="rounded-3xl border-4 border-muted bg-background/50 backdrop-blur">
      <CardHeader className="bg-muted pb-4">
        <CardTitle className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Mobile App Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between font-medium">
            <span>3x {selectedGarment.name} (Wash & Iron)</span>
            <span>₹{(Number(selectedGarment.wash_iron_price_inr) * 3).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>+ {selectedAddon.name}</span>
            <span>₹{Number(selectedAddon.price_inr).toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between font-semibold">
            <span>Item Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            {deliveryFee === 0 ? (
              <span className="text-success">FREE</span>
            ) : (
              <span>₹{deliveryFee.toFixed(2)}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Taxes ({taxesPercent}%)</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>

          {otherCharges > 0 && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{settings.other_charges_label || "Other Charges"}</span>
              <span>₹{otherCharges.toFixed(2)}</span>
            </div>
          )}

          <Separator />
          
          <div className="flex items-center justify-between text-lg font-bold text-primary">
            <span>Total to Pay</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
