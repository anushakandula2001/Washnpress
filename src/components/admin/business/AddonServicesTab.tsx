"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Search, Plus, Trash2, Edit, Copy, MoreVertical,
  Filter, Sparkles, Droplets, Wind, Package,
  Truck, Shirt, Activity, Layers, Briefcase, Zap, ShieldCheck
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

export function AddonServicesTab({ addons, onUpdate }: { addons: any[]; onUpdate: (b: any) => Promise<boolean> }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    description: "",
    price: "",
    priority: "Normal",
    category: "",
    icon: "Sparkles",
    displayOrder: "0",
    isActive: true,
  });

  const openAddModal = () => {
    setFormData({
      id: "", name: "", code: "", description: "", price: "", priority: "Normal", category: "",
      icon: "Sparkles", displayOrder: "0", isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addon: any) => {
    setFormData({
      id: addon.id,
      name: addon.name,
      code: addon.addon_code || addon.code || "",
      description: addon.description || "",
      price: addon.price_inr?.toString() || "",
      priority: addon.priority || "Normal",
      category: addon.category || "",
      icon: addon.icon || "Sparkles",
      displayOrder: addon.display_order?.toString() || "0",
      isActive: addon.is_active,
    });
    setIsModalOpen(true);
  };

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Display Order");

  const filteredAddons = addons.filter(a => {
    const matchesSearch = a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || a.category === filterCategory;
    const matchesPriority = filterPriority === "All" || a.priority === filterPriority;
    const matchesStatus = filterStatus === "All" ||
      (filterStatus === "Active" ? a.is_active : !a.is_active);

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "Alphabetical") return a.name.localeCompare(b.name);
    if (sortBy === "Price Low → High") return Number(a.price_inr) - Number(b.price_inr);
    if (sortBy === "Price High → Low") return Number(b.price_inr) - Number(a.price_inr);
    if (sortBy === "Newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "Oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

    // Default: Display Order, then Priority, then Alphabetical
    if (a.display_order !== b.display_order) {
      return (a.display_order || 0) - (b.display_order || 0);
    }

    const priorityWeight: Record<string, number> = { "Urgent": 1, "High": 2, "Normal": 3, "Low": 4 };
    const pA = priorityWeight[a.priority] || 3;
    const pB = priorityWeight[b.priority] || 3;
    if (pA !== pB) return pA - pB;

    return a.name.localeCompare(b.name);
  });

  const handleSave = async () => {
    if (!formData.name) {
      toast("Add-on name is required", "error");
      return;
    }

    const payload: any = {
      section: "addon",
      addon: {
        code: formData.code || formData.name.toLowerCase().replace(/\s+/g, '_').substring(0, 20),
        name: formData.name,
        description: formData.description || " ",
        priceInr: Number(formData.price) || 0,
        icon: formData.icon || "Sparkles",
        category: formData.category || "General",
        priority: formData.priority || "Normal",
        displayOrder: Number(formData.displayOrder) || 0,
        isActive: formData.isActive,
      },
    };
    if (formData.id) {
      payload.addon.id = formData.id;
    }

    const success = await onUpdate(payload);

    if (success) {
      setIsModalOpen(false);
      setFormData({
        id: "", name: "", code: "", description: "", price: "", priority: "Normal", category: "",
        icon: "Sparkles", displayOrder: "0", isActive: true
      });
    }
  };

  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "dry cleaning": return <Shirt className="h-6 w-6 text-primary" />;
      case "delivery": return <Truck className="h-6 w-6 text-orange-500" />;
      case "garment care": return <Droplets className="h-6 w-6 text-cyan-500" />;
      case "footwear": return <Activity className="h-6 w-6 text-emerald-500" />;
      case "cleaning": return <Droplets className="h-6 w-6 text-primary" />;
      case "premium care": return <Sparkles className="h-6 w-6 text-amber-500" />;
      case "packaging": return <Package className="h-6 w-6 text-amber-600" />;
      case "home care": return <Layers className="h-6 w-6 text-purple-500" />;
      case "accessories": return <Briefcase className="h-6 w-6 text-slate-600" />;
      default: return <Sparkles className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-card p-4 shadow-sm border border-border">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* <select
            className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Premium Care">Premium Care</option>
            <option value="Delivery">Delivery</option>
            <option value="Garment Care">Garment Care</option>
            <option value="Accessories">Accessories</option>
            <option value="Home Care">Home Care</option>
            <option value="Footwear">Footwear</option>
            <option value="Packaging">Packaging</option>
            <option value="Other">Other</option>
          </select> */}
          {/* <select
            className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select> */}
          {/* <select
            className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select> */}
          {/* <select
            className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Display Order">Sort: Display Order</option>
            <option value="Newest">Sort: Newest</option>
            <option value="Oldest">Sort: Oldest</option>
            <option value="Price Low → High">Sort: Price Low → High</option>
            <option value="Price High → Low">Sort: Price High → Low</option>
            <option value="Alphabetical">Sort: Alphabetical</option>
          </select> */}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {filteredAddons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-xl border-dashed">
          <Sparkles className="h-12 w-12 mb-4 opacity-20" />
          <p>No add-on services found.</p>
          <Button variant="ghost" className="text-[#14B8A6] hover:bg-transparent hover:underline" onClick={openAddModal}>Create your first service</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAddons.map((addon) => (
            <Card key={addon.id} className={`rounded-xl shadow-sm transition-all hover:shadow-md border ${!addon.is_active ? 'opacity-70 bg-muted/20' : 'border-border'}`}>
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  {/* <div className="h-12 w-12 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center">
                    {getIcon(addon.category)}
                  </div> */}
                  <Badge variant="outline" className={addon.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-muted bg-muted/50 text-muted-foreground"}>
                    {addon.is_active ? "Active" : "Disabled"}
                  </Badge>
                </div>

                <div className="mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{addon.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">
                    {addon.description || "No description provided."}
                  </p>
                </div>

                {/* <div className="flex items-center flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-background">
                    {addon.priority || "Normal"} Priority
                  </Badge>
                  {addon.category && (
                    <Badge variant="outline" className="bg-background">
                      {addon.category}
                    </Badge>
                  )}
                  {addon.display_order !== undefined && (
                    <Badge variant="outline" className="bg-background">
                      Order: {addon.display_order}
                    </Badge>
                  )}
                </div> */}

                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs font-semibold uppercase">Price</span>
                    <div className="font-bold text-lg text-[#14B8A6]">
                      ₹{Number(addon.price_inr).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEditModal(addon)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => {
                        if (confirm(`Are you sure you want to delete ${addon.name}?`)) {
                          void onUpdate({ section: "addon", addon: { ...addon, action: "delete" } });
                        }
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">Toggle</span>
                      <Switch
                        checked={addon.is_active}
                        className="data-[state=checked]:bg-[#14B8A6]"
                        onCheckedChange={() => void onUpdate({
                          section: "addon",
                          addon: { ...addon, action: "toggle", isActive: !addon.is_active }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Name</label>
              <Input placeholder="e.g., Stain Removal" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Describe the service..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input type="number" placeholder="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Premium Care">Premium Care</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Garment Care">Garment Care</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Home Care">Home Care</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Other">Other</option>
                </select>
              </div> */}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div> */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input type="number" value={formData.displayOrder} onChange={e => setFormData({ ...formData, displayOrder: e.target.value })} />
              </div> */}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
