"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { 
  Search, Plus, Trash2, Edit, Copy, Upload, 
  MoreVertical, Filter, ArrowUpDown, Image as ImageIcon, Shirt, ChevronDown,
  Sparkles, Droplets, Wind, Package, Check, ArrowRight, IndianRupee, Activity, TrendingUp, Gift, Briefcase, Percent, Calculator, ShoppingBag, Target
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

export function PricingTab({ garments, addons, onUpdate, settings }: { garments: any[]; addons: any[]; settings?: any; onUpdate: (b: any) => Promise<boolean> }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Garments");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    washPrice: "",
    washIronPrice: "",
    ironPrice: "",
    dryCleanPrice: "",
    expressPrice: "",
    description: "",
    isActive: true,
  });

  const filteredGarments = garments?.filter(g => {
    const matchesSearch = g.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Garments" || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredGarments.map(g => g.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const openAddModal = () => {
    setFormData({
      id: "", name: "", category: "", washPrice: "", washIronPrice: "", 
      ironPrice: "", dryCleanPrice: "", expressPrice: "", description: "", isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (g: any) => {
    setFormData({
      id: g.id,
      name: g.name,
      category: g.category || "General",
      washPrice: g.wash_price_inr?.toString() || "",
      washIronPrice: g.wash_iron_price_inr?.toString() || "",
      ironPrice: g.iron_price_inr?.toString() || "",
      dryCleanPrice: g.dry_clean_price_inr?.toString() || "",
      expressPrice: g.express_price_inr?.toString() || "",
      description: g.description || "",
      isActive: g.is_active,
    });
    setIsModalOpen(true);
  };

  const handleToggle = async (g: any) => {
    await onUpdate({
      section: "garment",
      garment: {
        id: g.id,
        name: g.name,
        action: "toggle",
        isActive: !g.is_active
      },
    });
  };

  const handleDelete = async (g: any) => {
    if (confirm(`Are you sure you want to delete ${g.name}?`)) {
      await onUpdate({
        section: "garment",
        garment: {
          id: g.id,
          name: g.name,
          action: "delete"
        },
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast("Garment name is required", "error");
      return;
    }
    
    const payload: any = {
      section: "garment",
      garment: {
        name: formData.name,
        category: formData.category || "General",
        washPriceInr: Number(formData.washPrice) || 0,
        washIronPriceInr: Number(formData.washIronPrice) || 0,
        ironPriceInr: Number(formData.ironPrice) || 0,
        dryCleanPriceInr: Number(formData.dryCleanPrice) || 0,
        expressPriceInr: Number(formData.expressPrice) || 0,
        description: formData.description,
        isActive: formData.isActive,
      },
    };
    if (formData.id) {
      payload.garment.id = formData.id;
    }
    
    const success = await onUpdate(payload);

    if (success) {
      setIsModalOpen(false);
      setFormData({
        id: "", name: "", category: "", washPrice: "", washIronPrice: "", 
        ironPrice: "", dryCleanPrice: "", expressPrice: "", description: "", isActive: true
      });
    }
  };

  const getGarmentIcon = (name: string, category: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("shirt") || lower.includes("top")) return <Shirt className="h-4 w-4" />;
    if (lower.includes("suit") || lower.includes("coat")) return <Briefcase className="h-4 w-4" />;
    if (lower.includes("blanket") || lower.includes("bedsheet")) return <Package className="h-4 w-4" />;
    if (lower.includes("winter") || lower.includes("jacket")) return <Shirt className="h-4 w-4" />;
    return <Shirt className="h-4 w-4" />;
  };

  const previewData: PreviewData = {
    garmentName: filteredGarments[0]?.name || "T-Shirt",
    garmentCategory: filteredGarments[0]?.category || "General",
    garmentPriceInr: Number(filteredGarments[0]?.wash_iron_price_inr || 60),
    garmentIcon: getGarmentIcon(filteredGarments[0]?.name || "", filteredGarments[0]?.category || ""),
    selectedAddons: addons?.filter((a: any) => a.is_active).slice(0, 2).map((a: any) => ({
      name: a.name,
      priceInr: Number(a.price_inr),
    })) || [],
    deliveryChargeInr: Number(settings?.delivery_fee_inr || 99),
    deliveryChargeLabel: "Express Delivery",
    taxAmountInr: Number((Number(filteredGarments[0]?.wash_iron_price_inr || 60) * (settings?.gst_percent || 5)) / 100) || 5,
    taxLabel: `Taxes (${settings?.gst_percent || 5}%)`,
    discountInr: 0,
  };
  previewData.subtotalInr = (previewData.garmentPriceInr || 0) + (previewData.selectedAddons?.reduce((sum, a) => sum + a.priceInr, 0) || 0);
  previewData.grandTotalInr = previewData.subtotalInr + (previewData.deliveryChargeInr || 0) + (previewData.taxAmountInr || 0) - (previewData.discountInr || 0);


  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Garments & Add-ons */}
      <div className="xl:col-span-8 space-y-8">
        
        {/* 1. GARMENT PRICING SECTION */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">1. Garment Pricing</h2>
            <p className="text-sm text-muted-foreground">Set pricing for different garment wash types</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-card p-4 shadow-sm border border-border">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search garment..." 
                  className="pl-9 bg-background" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="hidden sm:block h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option>All Garments</option>
                <option>Top Wear</option>
                <option>Bottom Wear</option>
                <option>Traditional</option>
                <option>Winter Wear</option>
                <option>Home Linen</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={openAddModal} className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white">
                <Plus className="mr-2 h-4 w-4" /> Quick Add
              </Button>
            </div>
          </div>

          <Card className="rounded-xl border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Garment</th>
                    <th className="px-4 py-3 font-medium text-center">Category</th>
                    <th className="px-4 py-3 font-medium text-right">Wash (₹)</th>
                    <th className="px-4 py-3 font-medium text-right">Wash+Iron (₹)</th>
                    <th className="px-4 py-3 font-medium text-right">Iron (₹)</th>
                    <th className="px-4 py-3 font-medium text-right">Dry Clean (₹)</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-center w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGarments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        No garments found.
                      </td>
                    </tr>
                  ) : (
                    filteredGarments.map((g) => (
                      <tr key={g.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-muted/50 text-[#14B8A6] flex items-center justify-center">
                              {getGarmentIcon(g.name, g.category)}
                            </div>
                            <span className="font-medium">{g.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="bg-background text-muted-foreground font-normal border-amber-200 text-amber-700 bg-amber-50">
                            {g.category || "General"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">{Number(g.wash_price_inr).toFixed(2)}</td>
                        <td className="px-4 py-3 font-medium text-right">{Number(g.wash_iron_price_inr).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">{Number(g.iron_price_inr).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">{Number(g.dry_clean_price_inr).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-semibold ${g.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                            {g.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-60 hover:opacity-100">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModal(g)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7">
                                <MoreVertical className="h-3 w-3" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleToggle(g)}>
                                  {g.is_active ? "Disable" : "Enable"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(g)} className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

      </div>

      {/* RIGHT COLUMN: Business Previews & Analytics */}
      <div className="xl:col-span-4 space-y-6">
        <BusinessPreviewCard data={previewData} />
      </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Garment" : "Add New Garment"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Garment Name</label>
              <Input placeholder="e.g., Men's Shirt" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input placeholder="e.g., Topwear, Bottomwear, Winter" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Wash Price (₹)</label>
              <Input type="number" placeholder="0" value={formData.washPrice} onChange={e => setFormData({...formData, washPrice: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Wash & Iron Price (₹)</label>
              <Input type="number" placeholder="0" value={formData.washIronPrice} onChange={e => setFormData({...formData, washIronPrice: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Iron Only Price (₹)</label>
              <Input type="number" placeholder="0" value={formData.ironPrice} onChange={e => setFormData({...formData, ironPrice: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dry Clean Price (₹)</label>
              <Input type="number" placeholder="0" value={formData.dryCleanPrice} onChange={e => setFormData({...formData, dryCleanPrice: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Express Price (₹)</label>
              <Input type="number" placeholder="Optional" value={formData.expressPrice} onChange={e => setFormData({...formData, expressPrice: e.target.value})} />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Internal notes or description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#14B8A6] text-white hover:bg-[#14B8A6]/90">Save Garment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
