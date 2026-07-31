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

const GARMENT_CATEGORIES = [
  { name: "Top Wear", icon: Shirt },
  { name: "Bottom Wear", icon: ShoppingBag },
  { name: "Traditional Wear", icon: Gift },
  { name: "Home Linen", icon: Package },
  { name: "Footwear", icon: Activity },
];

const GARMENTS_BY_CATEGORY: Record<string, string[]> = {
  "Top Wear": ["Shirt", "T-Shirt", "Polo T-Shirt", "Hoodie", "Sweatshirt", "Jacket", "Blazer", "Kurti", "Tank Top"],
  "Bottom Wear": ["Jeans", "Trousers", "Shorts", "Track Pants", "Leggings", "Chinos", "Cargo Pants", "Skirt"],
  "Traditional Wear": ["Saree", "Kurta", "Sherwani", "Lehenga", "Dupatta", "Dhoti", "Salwar", "Kurta Set"],
  "Home Linen": ["Bedsheet", "Pillow Cover", "Blanket", "Quilt", "Comforter", "Curtain", "Sofa Cover", "Towel"],
  "Footwear": ["Shoes", "Sneakers", "Formal Shoes", "Boots", "Sandals", "Slippers"]
};

export function PricingTab({ garments, addons, onUpdate, settings }: { garments: any[]; addons: any[]; settings?: any; onUpdate: (b: any) => Promise<boolean> }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Garments");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [categorySearch, setCategorySearch] = useState("");
  const [garmentSearch, setGarmentSearch] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isGarmentOpen, setIsGarmentOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, type: 'delete' | 'toggle', garment: any | null }>({ isOpen: false, type: 'delete', garment: null });
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

  const handleToggleClick = (g: any) => {
    setConfirmModal({ isOpen: true, type: 'toggle', garment: g });
  };

  const handleDeleteClick = (g: any) => {
    setConfirmModal({ isOpen: true, type: 'delete', garment: g });
  };

  const handleSave = async () => {
    if (!formData.category) {
      toast("Please select a category.", "error");
      return;
    }
    if (!formData.name) {
      toast("Please select a garment.", "error");
      return;
    }
    if (formData.washPrice === "" || formData.washIronPrice === "" || formData.ironPrice === "" || formData.dryCleanPrice === "") {
      toast("All prices except Express Price are required", "error");
      return;
    }
    if (Number(formData.washPrice) < 0 || Number(formData.washIronPrice) < 0 || Number(formData.ironPrice) < 0 || Number(formData.dryCleanPrice) < 0 || Number(formData.expressPrice) < 0) {
      toast("Prices must be positive numbers", "error");
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
      toast(formData.id ? "Garment updated successfully" : "Garment added successfully", "success");
      setIsModalOpen(false);
      setFormData({
        id: "", name: "", category: "", washPrice: "", washIronPrice: "",
        ironPrice: "", dryCleanPrice: "", expressPrice: "", description: "", isActive: true
      });
      setIsCategoryOpen(false);
      setIsGarmentOpen(false);
    }
  };

  const getGarmentIcon = (name: string, category: string) => {
    const lower = name.toLowerCase();
    const catLower = category?.toLowerCase() || "";
    if (lower.includes("suit") || lower.includes("blazer") || lower.includes("coat")) return <Briefcase className="h-4 w-4" />;
    if (catLower.includes("home") || lower.includes("bed") || lower.includes("blanket") || lower.includes("pillow") || lower.includes("curtain") || lower.includes("towel")) return <Package className="h-4 w-4" />;
    if (catLower.includes("footwear") || lower.includes("shoe") || lower.includes("sneaker")) return <Activity className="h-4 w-4" />;
    if (lower.includes("saree") || lower.includes("lehenga") || lower.includes("dupatta") || catLower.includes("traditional") || catLower.includes("ethnic")) return <Gift className="h-4 w-4" />;
    if (lower.includes("kurta") || lower.includes("trousers") || lower.includes("jeans") || lower.includes("skirt") || lower.includes("shorts") || catLower.includes("bottom")) return <ShoppingBag className="h-4 w-4" />;
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
      <div className="w-full space-y-8">

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
                  <option>Traditional Wear</option>
                  <option>Home Linen</option>
                  <option>Footwear</option>
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
                                  <DropdownMenuItem onClick={() => handleToggleClick(g)}>
                                    {g.is_active ? "Disable" : "Enable"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteClick(g)} className="text-red-600">
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

      {/* Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Garment" : "Add New Garment"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className={`col-span-2 space-y-2 relative ${isCategoryOpen ? 'z-50' : 'z-10'}`}>
              <label className="text-sm font-medium">Category *</label>
              <div 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsGarmentOpen(false); }}
              >
                {formData.category || "Select a Category..."}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </div>
              
              {isCategoryOpen && (
                <>
                  {/* Invisible backdrop to capture outside clicks */}
                  <div className="fixed inset-0 z-[998]" onClick={(e) => { e.stopPropagation(); setIsCategoryOpen(false); }} />
                  
                  {/* Floating Popover Menu */}
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg border border-border shadow-xl z-[1000] overflow-hidden animate-in fade-in-0 zoom-in-95">
                    <div className="p-2 border-b border-border">
                      <Input 
                        placeholder="Search category..." 
                        value={categorySearch} 
                        onChange={e => setCategorySearch(e.target.value)} 
                        className="h-9 w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-accent/50 px-3 outline-none"
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-[250px] overflow-y-auto p-1 bg-white">
                      {GARMENT_CATEGORIES.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).map(c => {
                        const Icon = c.icon;
                        return (
                          <div 
                            key={c.name}
                            className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({...prev, category: c.name, name: ""}));
                              setIsCategoryOpen(false);
                              setCategorySearch("");
                            }}
                          >
                            <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {c.name}
                            {formData.category === c.name && <Check className="ml-auto h-4 w-4 text-teal-600" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className={`col-span-2 space-y-2 relative ${isGarmentOpen ? 'z-50' : 'z-10'}`}>
              <label className="text-sm font-medium">Garment Name *</label>
              <div 
                className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${!formData.category ? "opacity-50 cursor-not-allowed bg-muted/50" : "cursor-pointer"}`}
                onClick={() => {
                  if (!formData.category) {
                    toast("Please select a category first.", "error");
                    return;
                  }
                  setIsGarmentOpen(!isGarmentOpen);
                  setIsCategoryOpen(false);
                }}
              >
                {formData.name || (formData.category ? "Select a Garment..." : "Select a category first")}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </div>
              
              {isGarmentOpen && formData.category && (
                <>
                  {/* Invisible backdrop to capture outside clicks */}
                  <div className="fixed inset-0 z-[998]" onClick={(e) => { e.stopPropagation(); setIsGarmentOpen(false); }} />
                  
                  {/* Floating Popover Menu */}
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg border border-border shadow-xl z-[1000] overflow-hidden animate-in fade-in-0 zoom-in-95">
                    <div className="p-2 border-b border-border">
                      <Input 
                        placeholder="Search garment..." 
                        value={garmentSearch} 
                        onChange={e => setGarmentSearch(e.target.value)} 
                        className="h-9 w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-accent/50 px-3 outline-none"
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-[250px] overflow-y-auto p-1 bg-white">
                      {(GARMENTS_BY_CATEGORY[formData.category] || [])
                        .filter(g => g.toLowerCase().includes(garmentSearch.toLowerCase()))
                        .map(g => (
                        <div 
                          key={g}
                          className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({...prev, name: g}));
                            setIsGarmentOpen(false);
                            setGarmentSearch("");
                          }}
                        >
                          {getGarmentIcon(g, formData.category)}
                          <span className="ml-2">{g}</span>
                          {formData.name === g && <Check className="ml-auto h-4 w-4 text-teal-600" />}
                        </div>
                      ))}
                      
                      {/* Allow custom entry if not found */}
                      {garmentSearch && !(GARMENTS_BY_CATEGORY[formData.category] || []).some(g => g.toLowerCase() === garmentSearch.toLowerCase()) && (
                        <div 
                          className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({...prev, name: garmentSearch}));
                            setIsGarmentOpen(false);
                            setGarmentSearch("");
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                          Add "{garmentSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Wash Price (₹) *</label>
              <Input type="number" min="0" step="0.01" placeholder="0" value={formData.washPrice} onChange={e => setFormData({ ...formData, washPrice: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Wash & Iron Price (₹) *</label>
              <Input type="number" min="0" step="0.01" placeholder="0" value={formData.washIronPrice} onChange={e => setFormData({ ...formData, washIronPrice: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Iron Only Price (₹) *</label>
              <Input type="number" min="0" step="0.01" placeholder="0" value={formData.ironPrice} onChange={e => setFormData({ ...formData, ironPrice: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dry Clean Price (₹) *</label>
              <Input type="number" min="0" step="0.01" placeholder="0" value={formData.dryCleanPrice} onChange={e => setFormData({ ...formData, dryCleanPrice: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Express Price (₹)</label>
              <Input type="number" min="0" step="0.01" placeholder="Optional" value={formData.expressPrice} onChange={e => setFormData({ ...formData, expressPrice: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input maxLength={250} placeholder="Internal notes or description (max 250 chars)..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#14B8A6] text-white hover:bg-[#14B8A6]/90">Save Garment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirmation Modal */}
      <Dialog open={confirmModal.isOpen} onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              {confirmModal.type === 'delete' ? "Delete Garment Permanently?" :
                confirmModal.garment?.is_active ? "Disable Garment?" : "Enable Garment?"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {confirmModal.type === 'delete' ?
                "This action cannot be undone. Are you sure you want to permanently delete this garment?" :
                confirmModal.garment?.is_active ?
                  "Are you sure you want to disable this garment? Residents will no longer be able to select it." :
                  "Are you sure you want to enable this garment? Residents will be able to book it again."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModal({ isOpen: false, type: 'delete', garment: null })}>Cancel</Button>
            <Button
              variant={confirmModal.type === 'delete' ? "destructive" : "default"}
              onClick={async () => {
                if (!confirmModal.garment) return;

                if (confirmModal.type === 'delete') {
                  const success = await onUpdate({ 
                    section: "garment", 
                    garment: { 
                      id: confirmModal.garment.id, 
                      name: confirmModal.garment.name, 
                      washPriceInr: Number(confirmModal.garment.wash_price_inr) || 0,
                      washIronPriceInr: Number(confirmModal.garment.wash_iron_price_inr) || 0,
                      ironPriceInr: Number(confirmModal.garment.iron_price_inr) || 0,
                      dryCleanPriceInr: Number(confirmModal.garment.dry_clean_price_inr) || 0,
                      action: "delete" 
                    } 
                  });
                  if (success) { toast("Garment deleted permanently"); setConfirmModal({ isOpen: false, type: 'delete', garment: null }); }
                } else {
                  const success = await onUpdate({ 
                    section: "garment", 
                    garment: { 
                      id: confirmModal.garment.id, 
                      name: confirmModal.garment.name, 
                      washPriceInr: Number(confirmModal.garment.wash_price_inr) || 0,
                      washIronPriceInr: Number(confirmModal.garment.wash_iron_price_inr) || 0,
                      ironPriceInr: Number(confirmModal.garment.iron_price_inr) || 0,
                      dryCleanPriceInr: Number(confirmModal.garment.dry_clean_price_inr) || 0,
                      action: "toggle", 
                      isActive: !confirmModal.garment.is_active 
                    } 
                  });
                  if (success) { toast(`Garment ${confirmModal.garment.is_active ? 'disabled' : 'enabled'} successfully`); setConfirmModal({ isOpen: false, type: 'delete', garment: null }); }
                }
              }}
            >
              {confirmModal.type === 'delete' ? "Delete Permanently" : confirmModal.garment?.is_active ? "Disable Garment" : "Enable Garment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
