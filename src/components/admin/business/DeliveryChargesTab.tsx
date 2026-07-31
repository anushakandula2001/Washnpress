"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Edit, Filter, Download, ChevronLeft, ChevronRight, Activity, 
  IndianRupee, TrendingUp, Gift, Shirt, ChevronDown
} from "lucide-react";
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
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    deliveryFee: "",
    freeDeliveryThreshold: "",
  });

  const openDeliveryModal = () => {
    setFormData({
      deliveryFee: settings?.delivery_fee_inr?.toString() || "0",
      freeDeliveryThreshold: settings?.free_delivery_threshold_inr?.toString() || "0",
    });
    setIsDeliveryModalOpen(true);
  };

  const handleSaveDelivery = async () => {
    const success = await onUpdate({
      section: "settings",
      settings: {
        ...settings,
        deliveryFeeInr: Number(formData.deliveryFee) || 0,
        freeDeliveryThresholdInr: Number(formData.freeDeliveryThreshold) || 0,
      }
    });
    if (success) setIsDeliveryModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      {/* Top Left: 3. Delivery Charges */}
      <Card className="rounded-xl border border-border shadow-sm flex flex-col h-full">
        <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-border/40">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">3. Delivery Charges</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Configure delivery fees and related charges</p>
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={openDeliveryModal}>
            <Edit className="mr-2 h-4 w-4" /> Edit Charges
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Charge Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Amount (₹)</th>
                <th className="px-4 py-3 font-medium">Applicable On</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">Minimum Order Amount</td>
                <td className="px-4 py-3 text-muted-foreground">Minimum order value for delivery</td>
                <td className="px-4 py-3">199.00</td>
                <td className="px-4 py-3">All Orders</td>
                <td className="px-4 py-3"><span className="text-emerald-600 font-semibold text-xs">Active</span></td>
                <td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" className="h-7 w-7 opacity-60"><Edit className="h-3 w-3" /></Button></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">Delivery Fee</td>
                <td className="px-4 py-3 text-muted-foreground">Standard delivery charge</td>
                <td className="px-4 py-3">{Number(settings?.delivery_fee_inr || 0).toFixed(2)}</td>
                <td className="px-4 py-3">Orders {"<"} ₹{Number(settings?.free_delivery_threshold_inr || 0).toFixed(0)}</td>
                <td className="px-4 py-3"><span className="text-emerald-600 font-semibold text-xs">Active</span></td>
                <td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" className="h-7 w-7 opacity-60"><Edit className="h-3 w-3" /></Button></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">Free Delivery Threshold</td>
                <td className="px-4 py-3 text-muted-foreground">Free delivery above this amount</td>
                <td className="px-4 py-3">{Number(settings?.free_delivery_threshold_inr || 0).toFixed(2)}</td>
                <td className="px-4 py-3">All Orders</td>
                <td className="px-4 py-3"><span className="text-emerald-600 font-semibold text-xs">Active</span></td>
                <td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" className="h-7 w-7 opacity-60"><Edit className="h-3 w-3" /></Button></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">Express Delivery</td>
                <td className="px-4 py-3 text-muted-foreground">Same-day or next-slot delivery</td>
                <td className="px-4 py-3">99.00</td>
                <td className="px-4 py-3">All Orders</td>
                <td className="px-4 py-3"><span className="text-emerald-600 font-semibold text-xs">Active</span></td>
                <td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" className="h-7 w-7 opacity-60"><Edit className="h-3 w-3" /></Button></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">Late Night Delivery</td>
                <td className="px-4 py-3 text-muted-foreground">10 PM to 7 AM delivery</td>
                <td className="px-4 py-3">50.00</td>
                <td className="px-4 py-3">All Orders</td>
                <td className="px-4 py-3"><span className="text-emerald-600 font-semibold text-xs">Active</span></td>
                <td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" className="h-7 w-7 opacity-60"><Edit className="h-3 w-3" /></Button></td>
              </tr>
            </tbody>
          </table>
          <div className="px-4 py-3 bg-blue-50/50 flex items-start gap-2 border-t border-border">
            <div className="h-4 w-4 rounded-full border border-[#14B8A6] text-[#14B8A6] flex items-center justify-center text-[10px] mt-0.5">i</div>
            <p className="text-xs text-muted-foreground">Delivery charges are applied automatically based on order value, time and conditions.</p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Modal */}
      <Dialog open={isDeliveryModalOpen} onOpenChange={setIsDeliveryModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Delivery Charges</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Fee (₹)</label>
              <Input type="number" placeholder="0" value={formData.deliveryFee} onChange={e => setFormData({...formData, deliveryFee: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Free Delivery Threshold (₹)</label>
              <Input type="number" placeholder="0" value={formData.freeDeliveryThreshold} onChange={e => setFormData({...formData, freeDeliveryThreshold: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeliveryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDelivery}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Right: 4. Taxes & Fees */}
      <Card className="rounded-xl border border-border shadow-sm flex flex-col h-full">
        <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-border/40">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">4. Taxes & Fees</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Manage taxes and additional fees</p>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <Edit className="mr-2 h-4 w-4" /> Edit Taxes
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Label / Description</th>
                <th className="px-4 py-3 font-medium">Rate (%)</th>
                <th className="px-4 py-3 font-medium">Amount / Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">GST</td>
                <td className="px-4 py-3 text-muted-foreground">Goods & Services Tax</td>
                <td className="px-4 py-3">5.00</td>
                <td className="px-4 py-3">%</td>
                <td className="px-4 py-3"><span className="text-emerald-600 font-semibold text-xs">Active</span></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">CGST</td>
                <td className="px-4 py-3 text-muted-foreground">Central GST</td>
                <td className="px-4 py-3">2.50</td>
                <td className="px-4 py-3">%</td>
                <td className="px-4 py-3"><span className="text-emerald-600 font-semibold text-xs">Active</span></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">SGST</td>
                <td className="px-4 py-3 text-muted-foreground">State GST</td>
                <td className="px-4 py-3">2.50</td>
                <td className="px-4 py-3">%</td>
                <td className="px-4 py-3"><span className="text-emerald-600 font-semibold text-xs">Active</span></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">Convenience Fee</td>
                <td className="px-4 py-3 text-muted-foreground">Platform convenience fee</td>
                <td className="px-4 py-3">1.00</td>
                <td className="px-4 py-3">%</td>
                <td className="px-4 py-3"><span className="text-emerald-600 font-semibold text-xs">Active</span></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">Packaging Fee</td>
                <td className="px-4 py-3 text-muted-foreground">Packaging and handling</td>
                <td className="px-4 py-3">10.00</td>
                <td className="px-4 py-3">Flat (₹)</td>
                <td className="px-4 py-3"><span className="text-emerald-600 font-semibold text-xs">Active</span></td>
              </tr>
            </tbody>
          </table>
          <div className="px-4 py-3 bg-blue-50/50 flex items-start gap-2 border-t border-border mt-auto">
            <div className="h-4 w-4 rounded-full border border-[#14B8A6] text-[#14B8A6] flex items-center justify-center text-[10px] mt-0.5">i</div>
            <p className="text-xs text-muted-foreground">Taxes are calculated on the order subtotal after discounts and before final amount.</p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Left: 6. Pricing History */}
      <Card className="rounded-xl border border-border shadow-sm flex flex-col h-full">
        <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-border/40">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">6. Pricing History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Track all pricing changes and updates</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="mr-2 h-4 w-4" /> Export <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Item / Service</th>
                <th className="px-4 py-3 font-medium">Change</th>
                <th className="px-4 py-3 font-medium">Updated By</th>
                <th className="px-4 py-3 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3">30 Jul 2026, 03:20 PM</td>
                <td className="px-4 py-3">Garment Price</td>
                <td className="px-4 py-3 font-medium">T-Shirt (Wash)</td>
                <td className="px-4 py-3"><span className="text-muted-foreground">₹35 ➔ </span><span className="text-emerald-600 font-bold">₹40</span></td>
                <td className="px-4 py-3">Platform Admin</td>
                <td className="px-4 py-3 text-muted-foreground">Regular price update</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3">30 Jul 2026, 03:15 PM</td>
                <td className="px-4 py-3">Add-on Service</td>
                <td className="px-4 py-3 font-medium">Express Delivery</td>
                <td className="px-4 py-3"><span className="text-muted-foreground">₹89 ➔ </span><span className="text-emerald-600 font-bold">₹99</span></td>
                <td className="px-4 py-3">Platform Admin</td>
                <td className="px-4 py-3 text-muted-foreground">Price updated</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3">30 Jul 2026, 03:10 PM</td>
                <td className="px-4 py-3">Delivery Charge</td>
                <td className="px-4 py-3 font-medium">Free Delivery Threshold</td>
                <td className="px-4 py-3"><span className="text-muted-foreground">₹399 ➔ </span><span className="text-emerald-600 font-bold">₹499</span></td>
                <td className="px-4 py-3">Platform Admin</td>
                <td className="px-4 py-3 text-muted-foreground">Threshold increased</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3">30 Jul 2026, 03:05 PM</td>
                <td className="px-4 py-3">Tax</td>
                <td className="px-4 py-3 font-medium">GST</td>
                <td className="px-4 py-3"><span className="text-muted-foreground">5% ➔ </span><span className="text-muted-foreground">5%</span></td>
                <td className="px-4 py-3">Platform Admin</td>
                <td className="px-4 py-3 text-muted-foreground">No change</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3">30 Jul 2026, 03:00 PM</td>
                <td className="px-4 py-3">Subscription</td>
                <td className="px-4 py-3 font-medium">Premium Plan</td>
                <td className="px-4 py-3"><span className="text-muted-foreground">₹2799 ➔ </span><span className="text-emerald-600 font-bold">₹2999</span></td>
                <td className="px-4 py-3">Platform Admin</td>
                <td className="px-4 py-3 text-muted-foreground">Price increased</td>
              </tr>
            </tbody>
          </table>
          <div className="px-4 py-3 border-t text-xs text-muted-foreground flex justify-between items-center mt-auto">
            <span>Showing 1 to 5 of 56 entries</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2">{"<"}</Button>
              <Button variant="outline" size="sm" className="h-7 w-7 bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20">1</Button>
              <Button variant="ghost" size="sm" className="h-7 w-7">2</Button>
              <Button variant="ghost" size="sm" className="h-7 w-7">3</Button>
              <span>...</span>
              <Button variant="ghost" size="sm" className="h-7 w-7">12</Button>
              <Button variant="outline" size="sm" className="h-7 px-2">{">"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Right: 7. Pricing Analytics */}
      <Card className="rounded-xl border border-border shadow-sm flex flex-col h-full">
        <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-border/40">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">7. Pricing Analytics <span className="text-muted-foreground font-normal text-sm ml-1">(This Month)</span></CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 space-y-6">
          <div className="grid grid-cols-4 gap-4 pb-4 border-b border-border/40">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <IndianRupee className="h-3 w-3 text-emerald-500" />
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Revenue</p>
              </div>
              <p className="text-xl font-bold">₹58,420</p>
              <p className="text-[10px] text-emerald-600 flex items-center mt-0.5"><TrendingUp className="h-3 w-3 mr-0.5" /> 18% vs last month</p>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Activity className="h-3 w-3 text-emerald-500" />
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Avg. Order Value</p>
              </div>
              <p className="text-xl font-bold">₹315</p>
              <p className="text-[10px] text-emerald-600 flex items-center mt-0.5"><TrendingUp className="h-3 w-3 mr-0.5" /> 14% vs last month</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Gift className="h-3 w-3 text-purple-500" />
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider line-clamp-1">Most Used Add-on</p>
              </div>
              <p className="text-sm font-bold mt-1">Express Delivery</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Used in 68% orders</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Shirt className="h-3 w-3 text-blue-500" />
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider line-clamp-1">Top Garment</p>
              </div>
              <p className="text-sm font-bold mt-1">Shirt</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Most ordered item</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold">Revenue Trend</p>
                <p className="text-[10px] text-muted-foreground">Last 6 months</p>
              </div>
              <div className="h-[120px] bg-muted/20 rounded border border-dashed flex flex-col justify-end p-2 relative overflow-hidden">
                {/* SVG Area chart representation */}
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full text-[#14B8A6]/20">
                  <path d="M0,50 L0,30 L20,25 L40,35 L60,15 L80,20 L100,5 L100,50 Z" fill="currentColor" stroke="#14B8A6" strokeWidth="2" />
                </svg>
                <div className="flex justify-between text-[8px] text-muted-foreground mt-2 absolute bottom-2 w-[calc(100%-16px)]">
                  <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold">Revenue by Category</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-8 border-purple-500 border-r-[#14B8A6] border-b-[#14B8A6] border-l-[#14B8A6] flex items-center justify-center">
                  <span className="text-xs font-bold">₹58,420</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#14B8A6]" />
                    <span className="text-[10px] text-muted-foreground w-16">Garment Services</span>
                    <span className="text-[10px] font-bold ml-auto">62%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-[10px] text-muted-foreground w-16">Add-on Services</span>
                    <span className="text-[10px] font-bold ml-auto">20%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] text-muted-foreground w-16">Delivery Charges</span>
                    <span className="text-[10px] font-bold ml-auto">10%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-[10px] text-muted-foreground w-16">Subscriptions</span>
                    <span className="text-[10px] font-bold ml-auto">8%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold">Top Add-on Services</p>
                <p className="text-[10px] text-muted-foreground border px-1 rounded">This Month ▼</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Express Delivery</span>
                    <span className="font-bold">1280</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#14B8A6] w-[100%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Fabric Softener</span>
                    <span className="font-bold">980</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#14B8A6]/80 w-[75%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Shoe Cleaning</span>
                    <span className="font-bold">650</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#14B8A6]/60 w-[50%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Stain Removal</span>
                    <span className="font-bold">420</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#14B8A6]/40 w-[35%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Steam Iron</span>
                    <span className="font-bold">310</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#14B8A6]/30 w-[20%]" />
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="px-4 py-3 bg-blue-50/50 flex items-start gap-2 border-t border-border mt-auto">
            <div className="h-4 w-4 rounded-full border border-[#14B8A6] text-[#14B8A6] flex items-center justify-center text-[10px] mt-0.5">i</div>
            <p className="text-xs text-muted-foreground">Analytics are based on paid orders only and updated daily.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
