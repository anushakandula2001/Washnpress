"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { 
  Plus, Check, Star, Users, Trash2, Edit, Copy, TrendingUp, Shirt, Briefcase
} from "lucide-react";
import { BusinessPreviewCard, PreviewData } from "@/components/shared/BusinessPreviewCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function SubscriptionsTab({ plans, onUpdate }: { plans: any[]; onUpdate: (b: any) => Promise<boolean> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    id: "",
    tier: "",
    name: "",
    description: "",
    monthlyInr: "",
    garmentCap: "",
    isActive: true,
  });

  const openAddModal = () => {
    setFormData({
      id: "", tier: "", name: "", description: "", monthlyInr: "", garmentCap: "", isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setFormData({
      id: plan.id,
      tier: plan.tier || "",
      name: plan.name || "",
      description: plan.description || "",
      monthlyInr: plan.monthly_price_inr?.toString() || "",
      garmentCap: plan.max_orders_per_month?.toString() || "",
      isActive: plan.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast("Plan name is required", "error");
      return;
    }
    
    const payload: any = {
      section: "plan",
      plan: {
        tier: formData.tier || formData.name.toLowerCase().replace(/\s+/g, '_').substring(0, 20),
        name: formData.name,
        description: formData.description || " ",
        monthlyInr: Number(formData.monthlyInr) || 0,
        garmentCap: Number(formData.garmentCap) || 1,
        isActive: formData.isActive,
      },
    };
    if (formData.id) {
      payload.plan.id = formData.id;
    }
    
    const success = await onUpdate(payload);

    if (success) {
      setIsModalOpen(false);
      setFormData({
        id: "", tier: "", name: "", description: "", monthlyInr: "", garmentCap: "", isActive: true
      });
    }
  };

  const previewData: PreviewData = {
    garmentName: "Men's Suit",
    garmentCategory: "Dry Clean",
    garmentPriceInr: 250,
    garmentIcon: <Briefcase className="h-4 w-4" />,
    selectedAddons: [
      { name: "Premium Packaging", priceInr: 30 }
    ],
    subtotalInr: 280,
    deliveryChargeInr: 0,
    deliveryChargeLabel: "Free Delivery (Premium)",
    taxAmountInr: 14,
    taxLabel: "Taxes (5%)",
    discountInr: 56, // 20% off
    discountLabel: "Premium Plan Discount (20%)",
    grandTotalInr: 238
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-8 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-card p-4 shadow-sm border border-border">
        <div className="flex flex-1 items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Active Subscription Plans</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> Create New Plan
          </Button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col rounded-2xl overflow-hidden border-2 transition-all hover:shadow-lg ${plan.name.toLowerCase().includes("premium") ? "border-primary shadow-primary/10" : "border-border/60"}`}>
            {plan.name.toLowerCase().includes("premium") && (
              <div className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest text-center py-1">
                Most Popular
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
              <div className="mt-4 flex items-baseline justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-foreground">₹{plan.monthly_price_inr}</span>
                <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 mt-6">
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  <span>Maximum {plan.max_orders_per_month} orders per month</span>
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  <span>{plan.discount_percent}% discount on all services</span>
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  <span>Priority pickup & delivery</span>
                </li>
                {plan.name.toLowerCase().includes("premium") && (
                  <li className="flex gap-x-3">
                    <Star className="h-5 w-5 flex-none text-amber-500 fill-amber-500" aria-hidden="true" />
                    <span className="text-foreground font-medium">Premium dedicated support</span>
                  </li>
                )}
              </ul>

              <div className="mt-8 pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/40">
                  <div className="flex items-center text-muted-foreground mb-1">
                    <Users className="h-4 w-4 mr-1.5" />
                    <span className="text-xs uppercase tracking-wider font-semibold">Subscribers</span>
                  </div>
                  <span className="text-xl font-bold">{Math.floor(Math.random() * 200) + 50}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/40">
                  <div className="flex items-center text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4 mr-1.5" />
                    <span className="text-xs uppercase tracking-wider font-semibold">Revenue</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-600">₹{(plan.monthly_price_inr * (Math.floor(Math.random() * 50) + 10)).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <div className="pt-0 pb-6 px-6">
              <DropdownMenu>
                <DropdownMenuTrigger className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full ${plan.name.toLowerCase().includes("premium") ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"}`}>
                  Manage Plan
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => openEditModal(plan)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Plan Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" /> Duplicate Plan
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem 
                    onClick={() => void onUpdate({ section: "plan", plan: { ...plan, action: "toggle", isActive: !plan.is_active }})}
                  >
                    {plan.is_active ? "Disable Plan" : "Enable Plan"}
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => void onUpdate({ section: "plan", plan: { ...plan, action: "delete" }})}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
      </div>
      
      {/* RIGHT COLUMN: Business Previews */}
      <div className="xl:col-span-4 space-y-6">
        <BusinessPreviewCard data={previewData} />
      </div>

      {/* Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Subscription Plan" : "Create New Plan"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Name</label>
              <Input placeholder="e.g., Premium Household" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Brief description of the plan..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Price (₹)</label>
                <Input type="number" placeholder="0" value={formData.monthlyInr} onChange={e => setFormData({...formData, monthlyInr: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Garment Cap</label>
                <Input type="number" placeholder="0" value={formData.garmentCap} onChange={e => setFormData({...formData, garmentCap: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
