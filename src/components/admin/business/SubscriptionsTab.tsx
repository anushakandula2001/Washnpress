"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Check, Star, Users, Trash2, Edit, Copy, MoreVertical,
  Download, Upload, Search, Filter, RefreshCcw, PackageSearch,
  Calendar, Clock, User, X, PlusCircle, ArrowRight, ShieldCheck,
  Zap, ChevronDown, CheckCircle2, Eye, Archive
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";

export function SubscriptionsTab({ plans = [], onUpdate }: { plans: any[]; onUpdate: (b: any) => Promise<boolean> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<any>(null);
  
  // New States for Audit Logs and Settings
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<any>(null);
  
  const [selectedPlanForSubscribers, setSelectedPlanForSubscribers] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState("");

  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    monthlyInr: "",
    billingCycle: "Monthly",
    duration: "30 Days",
    garmentCap: "",
    discount: "",
    priorityPickup: false,
    freeDelivery: false,
    expressDelivery: false,
    dedicatedSupport: false,
    features: ["Unlimited Orders", "20% Discount", "Priority Pickup & Delivery"],
    displayOrder: 0,
    isPopular: false,
    supportType: "Standard",
    isActive: true,
  });

  const openAddModal = () => {
    setFormData({
      id: "", name: "", description: "", monthlyInr: "", billingCycle: "Monthly", duration: "30 Days", garmentCap: "", discount: "", priorityPickup: false, freeDelivery: false, expressDelivery: false, dedicatedSupport: false, features: ["Unlimited Orders", "20% Discount", "Priority Pickup & Delivery"], displayOrder: 0, isPopular: false, supportType: "Standard", isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setFormData({
      id: plan.id,
      name: plan.name || "",
      description: plan.description || "",
      monthlyInr: plan.monthly_inr?.toString() || "",
      billingCycle: "Monthly",
      duration: plan.validity_days ? `${plan.validity_days} Days` : "30 Days",
      garmentCap: plan.garment_cap?.toString() || "",
      discount: plan.express_discount_percent?.toString() || "",
      priorityPickup: plan.priority_pickup || false,
      freeDelivery: plan.free_delivery || false,
      expressDelivery: (plan.express_discount_percent || 0) > 0,
      dedicatedSupport: plan.support_type === "Dedicated Manager" || plan.name?.toLowerCase().includes("premium") || false,
      features: plan.features && plan.features.length ? plan.features : ["Unlimited Orders", `${plan.express_discount_percent || 20}% Discount`, "Priority Pickup & Delivery"],
      displayOrder: plan.display_order ?? 0,
      isPopular: plan.is_popular ?? false,
      supportType: plan.support_type || "Standard",
      isActive: plan.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const openDetailsModal = (plan: any) => {
    setSelectedPlanForDetails(plan);
    setIsDetailsOpen(true);
  };

  const handleDuplicate = async (plan: any) => {
    const payload = {
      section: "plan",
      plan: {
        name: `${plan.name} (Copy)`,
        description: plan.description || " ",
        monthlyInr: Number(plan.monthly_inr) || 0,
        garmentCap: Number(plan.garment_cap) || 1,
        expressDiscountPercent: Number(plan.express_discount_percent) || 0,
        features: plan.features || [],
        displayOrder: Number(plan.display_order) || 0,
        isPopular: false,
        supportType: plan.support_type || "Standard",
        isActive: true,
        priorityPickup: plan.priority_pickup || false,
        freeDelivery: plan.free_delivery || false,
        validityDays: plan.validity_days || 30,
      }
    };
    await onUpdate(payload);
  };

  const confirmDelete = (plan: any) => {
    setPlanToDelete(plan);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!planToDelete) return;
    try {
      const success = await onUpdate({ section: "plan", plan: { ...planToDelete, action: "delete" }});
      if (success) {
        toast("Subscription plan deleted successfully.", "success");
      }
    } catch (e: any) {
      // business page already handles the toast
    }
    setDeleteConfirmOpen(false);
    setPlanToDelete(null);
  };

  const openSubscribersDrawer = async (plan: any) => {
    setSelectedPlanForSubscribers(plan);
    setSubscribers([]);
    setIsDrawerOpen(true);
    setIsLoadingSubscribers(true);
    setSubscriberSearchQuery("");
    try {
      const res = await fetch(`/api/admin/subscriptions/${plan.id}/subscribers`, { credentials: "same-origin" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubscribers(data.data?.subscribers || []);
    } catch (e) {
      toast("Unable to load subscribers", "error");
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  const openAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      // Simulate API loading
      await new Promise(resolve => setTimeout(resolve, 600));
      setIsAuditLogsOpen(true);
    } catch (e) {
      toast("Unable to open Audit Logs.", "error");
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const openSettings = async () => {
    setIsLoadingSettings(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setIsSettingsOpen(true);
    } catch (e) {
      toast("Unable to open Settings.", "error");
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast("Plan name is required", "error");
      return;
    }
    
    const payload: any = {
      section: "plan",
      plan: {
        tier: formData.name.toLowerCase().replace(/\s+/g, '_').substring(0, 20),
        name: formData.name,
        description: formData.description || " ",
        monthlyInr: Number(formData.monthlyInr) || 0,
        garmentCap: Number(formData.garmentCap) || 1,
        expressDiscountPercent: Number(formData.discount) || 0,
        features: formData.features,
        displayOrder: Number(formData.displayOrder) || 0,
        isPopular: formData.isPopular,
        supportType: formData.dedicatedSupport ? "Dedicated Manager" : formData.supportType,
        isActive: formData.isActive,
        priorityPickup: formData.priorityPickup,
        freeDelivery: formData.freeDelivery,
        validityDays: parseInt(formData.duration) || 30,
      },
    };
    if (formData.id) {
      payload.plan.id = formData.id;
    }
    
    const success = await onUpdate(payload);

    if (success) {
      setIsModalOpen(false);
    }
  };

  // Mock stats
  const totalPlans = plans.length || 5;
  const activePlans = plans.filter(p => p.is_active !== false).length || 4;
  const expiringSoon = 18;
  const totalSubscribers = 623;

  return (
    <div className="w-full space-y-8 bg-white pb-12 font-sans text-slate-900 rounded-xl p-4 md:p-6 lg:p-8 border border-slate-100 shadow-sm">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Subscription Plans</h1>
          <p className="text-slate-500 mt-1.5">Create, manage and monitor subscription plans across all societies.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 transition-all rounded-xl h-10 px-4 shadow-sm">
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button> */}
          {/* <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 transition-all rounded-xl h-10 px-4 shadow-sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-xl h-10 w-10 shadow-sm">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100 p-1.5">
              <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={openAuditLogs}>
                {isLoadingAudit ? "Loading..." : "View Audit Logs"}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={openSettings}>
                {isLoadingSettings ? "Loading..." : "Settings"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openAddModal} className="bg-[#14B8B0] hover:bg-[#119F98] text-white shadow-md shadow-[#14B8B0]/20 rounded-xl transition-all h-10 px-5">
            <Plus className="mr-2 h-4 w-4" /> New Plan
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-slate-100 p-3.5 rounded-xl">
              <PackageSearch className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Total Plans</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalPlans} Plans</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-[#14B8B0]/10 p-3.5 rounded-xl">
              <Users className="h-6 w-6 text-[#14B8B0]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Total Subscribers</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalSubscribers} Subscribers</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-emerald-100/50 p-3.5 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Active Plans</p>
              <h3 className="text-2xl font-bold text-slate-900">{activePlans} Active</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-amber-100/50 p-3.5 rounded-xl">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Expiring Soon</p>
              <h3 className="text-2xl font-bold text-slate-900">{expiringSoon} Plans</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
      <></>
        {/* <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search Plans..." className="pl-10 border-slate-200 rounded-xl bg-white focus-visible:ring-[#14B8B0] h-11 shadow-sm" />
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Button variant="outline" className="border-slate-200 text-slate-600 rounded-xl bg-white h-11 shrink-0 px-4 shadow-sm">
            Status <ChevronDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
          </Button>
          <Button variant="outline" className="border-slate-200 text-slate-600 rounded-xl bg-white h-11 shrink-0 px-4 shadow-sm">
            Duration <ChevronDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
          </Button>
          <Button variant="outline" className="border-slate-200 text-slate-600 rounded-xl bg-white h-11 shrink-0 px-4 shadow-sm">
            Popularity <ChevronDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
          </Button>
          <div className="w-px h-7 bg-slate-200 mx-1 hidden md:block"></div>
          <Button variant="outline" className="border-slate-200 text-slate-600 rounded-xl bg-white h-11 shrink-0 px-4 shadow-sm">
            Sort By <ChevronDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
          </Button>
          <Button variant="ghost" className="text-slate-500 hover:text-slate-800 rounded-xl h-11 shrink-0 px-3">
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div> */}
      </div>

      {/* PLAN CARDS GRID */}
      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <div className="bg-white p-6 rounded-full mb-5 shadow-sm border border-slate-100">
            <PackageSearch className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No subscription plans found</h3>
          <p className="text-slate-500 mb-8 max-w-sm">Create your first subscription plan to start offering recurring services to societies.</p>
          <Button onClick={openAddModal} className="bg-[#14B8B0] hover:bg-[#119F98] text-white rounded-xl h-11 px-6 shadow-md shadow-[#14B8B0]/20">
            <Plus className="mr-2 h-4 w-4" /> Create New Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {plans.map((plan) => {
            const isPopular = plan.name.toLowerCase().includes("premium");
            const subscribers = Math.floor(Math.random() * 100) + 10;
            const capacity = 120;
            const capacityPercent = Math.round((subscribers / capacity) * 100);

            return (
              <Card key={plan.id} className="rounded-2xl border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden bg-white group flex flex-col h-full">
                <div className="p-4 pb-3 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[28px] font-bold text-slate-900 truncate">{plan.name}</h3>
                      <Badge variant={plan.is_deleted ? "secondary" : (plan.is_active !== false ? "default" : "secondary")} className={`text-[10px] px-1.5 py-0 h-5 ${plan.is_deleted ? "bg-slate-200 text-slate-700 border border-slate-300" : (plan.is_active !== false ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60" : "bg-slate-100 text-slate-600")} rounded-md font-semibold`}>
                        {plan.is_deleted ? "Archived" : (plan.is_active !== false ? "Active" : "Disabled")}
                      </Badge>
                    </div>
                    {isPopular && (
                      <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60 flex items-center gap-1 shadow-none rounded-md px-1.5 py-0 h-5 text-[10px]">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Popular
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[24px] font-bold tracking-tight text-slate-900">₹{plan.monthly_inr || 0}</span>
                      <span className="text-[16px] text-slate-500 font-medium">/ Month</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#14B8B0] shrink-0 mt-0.5" />
                      <span className="text-[16px] text-slate-700 font-normal">Unlimited Orders</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#14B8B0] shrink-0 mt-0.5" />
                      <span className="text-[16px] text-slate-700 font-normal">{plan.express_discount_percent || 0}% Express Discount</span>
                    </div>
                    {plan.priority_pickup && (
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#14B8B0] shrink-0 mt-0.5" />
                        <span className="text-[16px] text-slate-700 font-normal">Priority Pickup</span>
                      </div>
                    )}
                    {plan.free_delivery && (
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#14B8B0] shrink-0 mt-0.5" />
                        <span className="text-[16px] text-slate-700 font-normal">Free Delivery</span>
                      </div>
                    )}
                    {isPopular && (
                      <div className="pl-6 pt-1">
                        <span className="text-[13px] font-semibold text-[#14B8B0]">+2 More Features</span>
                      </div>
                    )}
                  </div>

                  {/* <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-5 mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Subscribers</p>
                        <p className="text-xl font-bold text-slate-900 leading-none">{subscribers}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Capacity</p>
                        <p className="text-xs font-semibold text-slate-700">{subscribers} / {capacity}</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#14B8B0] h-full rounded-full transition-all duration-1000" style={{ width: `${capacityPercent}%` }}></div>
                    </div>
                  </div> */}

                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-slate-500">
                    <div className="flex flex-col">
                      <span className="text-[13px] uppercase font-medium tracking-wider text-slate-400 mb-0.5">Duration</span>
                      <span className="text-[15px] font-medium text-slate-700 flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" /> {plan.validity_days || 30} Days</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] uppercase font-medium tracking-wider text-slate-400 mb-0.5">Updated</span>
                      <span className="text-[15px] font-medium text-slate-700">02 Aug 2026</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-slate-100 bg-slate-50/50 p-3 flex items-center justify-around">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg flex items-center gap-1.5" onClick={() => openEditModal(plan)} title="Edit">
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1.5" onClick={() => openSubscribersDrawer(plan)} title="Subscribers">
                    <Users className="h-4 w-4" /> Subscribers
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5" onClick={() => confirmDelete(plan)} title="Delete">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden rounded-[24px] border-0 shadow-2xl">
          <div className="px-8 py-6 border-b border-slate-100 bg-white">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {formData.id ? "Edit Plan Details" : "Create New Plan"}
            </DialogTitle>
          </div>
          <div className="px-8 py-7 bg-slate-50/50 max-h-[70vh] overflow-y-auto">
            <div className="grid gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Plan Name</label>
                  <Input placeholder="e.g. Enterprise Monthly" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl border-slate-200 focus-visible:ring-[#14B8B0] h-12 shadow-sm" />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Monthly Price (₹)</label>
                  <Input type="number" placeholder="2999" value={formData.monthlyInr} onChange={e => setFormData({...formData, monthlyInr: e.target.value})} className="rounded-xl border-slate-200 focus-visible:ring-[#14B8B0] h-12 shadow-sm" />
                </div>
                
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Billing Cycle</label>
                  <select 
                    className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8B0] shadow-sm text-slate-700"
                    value={formData.billingCycle}
                    onChange={e => setFormData({...formData, billingCycle: e.target.value})}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Duration</label>
                  <select 
                    className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8B0] shadow-sm text-slate-700"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                  >
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="365 Days">365 Days</option>
                  </select>
                </div>

                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Maximum Orders</label>
                  <Input type="number" placeholder="Unlimited or specify number" value={formData.garmentCap} onChange={e => setFormData({...formData, garmentCap: e.target.value})} className="rounded-xl border-slate-200 focus-visible:ring-[#14B8B0] h-12 shadow-sm" />
                </div>

                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Discount %</label>
                  <Input type="number" placeholder="20" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="rounded-xl border-slate-200 focus-visible:ring-[#14B8B0] h-12 shadow-sm" />
                </div>
                
                {/* <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Display Order</label>
                  <Input type="number" placeholder="0" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} className="rounded-xl border-slate-200 focus-visible:ring-[#14B8B0] h-12 shadow-sm" />
                </div> */}
{/* 
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Support Type</label>
                  <select
                    className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8B0] shadow-sm text-slate-700"
                    value={formData.supportType}
                    onChange={e => setFormData({...formData, supportType: e.target.value})}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Priority">Priority</option>
                    <option value="Dedicated Manager">Dedicated Manager</option>
                  </select>
                </div> */}
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <Textarea placeholder="Internal description for this plan..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl border-slate-200 focus-visible:ring-[#14B8B0] resize-none shadow-sm" rows={3} />
              </div>

              <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
                <h4 className="font-bold text-slate-900">Plan Highlights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Most Popular Badge</span>
                    <Switch checked={formData.isPopular} onCheckedChange={(c) => setFormData({...formData, isPopular: c})} className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Priority Pickup</span>
                    <Switch checked={formData.priorityPickup} onCheckedChange={(c) => setFormData({...formData, priorityPickup: c})} className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Free Delivery</span>
                    <Switch checked={formData.freeDelivery} onCheckedChange={(c) => setFormData({...formData, freeDelivery: c})} className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Express Delivery</span>
                    <Switch checked={formData.expressDelivery} onCheckedChange={(c) => setFormData({...formData, expressDelivery: c})} className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Dedicated Support</span>
                    <Switch checked={formData.dedicatedSupport} onCheckedChange={(c) => setFormData({...formData, dedicatedSupport: c})} className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-900">Features Builder</h4>
                <div className="space-y-3">
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Input value={feature} onChange={(e) => {
                        const newFeatures = [...formData.features];
                        newFeatures[idx] = e.target.value;
                        setFormData({...formData, features: newFeatures});
                      }} className="rounded-xl h-12 border-slate-200 focus-visible:ring-[#14B8B0] shadow-sm" />
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl shrink-0" onClick={() => {
                        const newFeatures = formData.features.filter((_, i) => i !== idx);
                        setFormData({...formData, features: newFeatures});
                      }}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-3 rounded-xl h-12 border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium" onClick={() => setFormData({...formData, features: [...formData.features, ""]})}>
                    <PlusCircle className="mr-2 h-5 w-5" /> Add Feature
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl border-slate-200 h-11 px-6 font-semibold">Cancel</Button>
            <Button onClick={handleSave} className="rounded-xl bg-[#14B8B0] hover:bg-[#119F98] text-white h-11 px-8 font-semibold shadow-md shadow-[#14B8B0]/20">
              {formData.id ? "Save Changes" : "Create Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DETAILS MODAL */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden rounded-[24px] border-0 shadow-2xl">
          <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Plan Details
            </DialogTitle>
            <Badge variant={selectedPlanForDetails?.is_deleted ? "secondary" : (selectedPlanForDetails?.is_active !== false ? "default" : "secondary")} className={`text-xs px-2.5 py-0.5 ${selectedPlanForDetails?.is_deleted ? "bg-slate-200 text-slate-700" : (selectedPlanForDetails?.is_active !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-slate-100 text-slate-600")} rounded-md font-semibold`}>
              {selectedPlanForDetails?.is_deleted ? "Archived" : (selectedPlanForDetails?.is_active !== false ? "Active" : "Disabled")}
            </Badge>
          </div>
          <div className="px-8 py-7 bg-slate-50/50 max-h-[70vh] overflow-y-auto">
            {selectedPlanForDetails && (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Plan Name</label>
                    <div className="font-medium text-slate-900 text-lg flex items-center gap-2">
                      {selectedPlanForDetails.name}
                      {selectedPlanForDetails.is_popular && <Star className="h-4 w-4 fill-amber-500 text-amber-500" />}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Monthly Price</label>
                    <div className="font-medium text-slate-900 text-lg">₹{selectedPlanForDetails.monthly_inr}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Duration</label>
                    <div className="font-medium text-slate-700">{selectedPlanForDetails.validity_days || 30} Days</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Max Orders</label>
                    <div className="font-medium text-slate-700">{selectedPlanForDetails.garment_cap || "Unlimited"}</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">Benefits & Features</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
                    <div className="flex items-center gap-2">
                      {selectedPlanForDetails.priority_pickup ? <CheckCircle2 className="h-4 w-4 text-[#14B8B0]" /> : <X className="h-4 w-4 text-slate-300" />}
                      <span className="text-sm font-medium text-slate-700">Priority Pickup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPlanForDetails.free_delivery ? <CheckCircle2 className="h-4 w-4 text-[#14B8B0]" /> : <X className="h-4 w-4 text-slate-300" />}
                      <span className="text-sm font-medium text-slate-700">Free Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(selectedPlanForDetails.express_discount_percent || 0) > 0 ? <CheckCircle2 className="h-4 w-4 text-[#14B8B0]" /> : <X className="h-4 w-4 text-slate-300" />}
                      <span className="text-sm font-medium text-slate-700">{selectedPlanForDetails.express_discount_percent || 0}% Express Discount</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#14B8B0]" />
                      <span className="text-sm font-medium text-slate-700">Support: {selectedPlanForDetails.support_type || 'Standard'}</span>
                    </div>
                  </div>
                  {selectedPlanForDetails.features && selectedPlanForDetails.features.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">Included Features</label>
                      <ul className="space-y-1.5 pl-5 list-disc text-sm text-slate-700 font-medium">
                        {selectedPlanForDetails.features.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Created Date</label>
                    <div className="font-medium text-slate-700">{selectedPlanForDetails.created_at ? new Date(selectedPlanForDetails.created_at).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Last Updated</label>
                    <div className="font-medium text-slate-700">{selectedPlanForDetails.updated_at ? new Date(selectedPlanForDetails.updated_at).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="rounded-xl border-slate-200 h-11 px-6 font-semibold">Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SUBSCRIBERS DRAWER */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md border-l-0 shadow-2xl p-0 flex flex-col bg-slate-50/50">
          <div className="p-6 border-b border-slate-100 bg-white shadow-sm z-10">
            <SheetHeader>
              <h2 className="text-xl font-bold text-slate-900 m-0">Subscribers</h2>
              <p className="text-slate-500 m-0 mt-1 text-sm">Manage residents subscribed to {selectedPlanForSubscribers?.name}.</p>
            </SheetHeader>
            <div className="mt-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search Subscriber..." 
                className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-[#14B8B0]" 
                value={subscriberSearchQuery}
                onChange={(e) => setSubscriberSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
            {isLoadingSubscribers ? (
              <div className="flex justify-center items-center h-40 text-slate-500">Loading subscribers...</div>
            ) : subscribers.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-40 text-slate-500 space-y-3">
                <Users className="h-10 w-10 text-slate-300" />
                <p>No active subscribers for this plan.</p>
              </div>
            ) : (
              subscribers
                .filter(s => 
                  s.resident_name.toLowerCase().includes(subscriberSearchQuery.toLowerCase()) || 
                  s.society_name.toLowerCase().includes(subscriberSearchQuery.toLowerCase())
                )
                .map((sub, i) => (
                <div key={sub.subscription_id || i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{sub.resident_name}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">{sub.society_name} • Unit {sub.unit_number}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{sub.phone}</p>
                    </div>
                    <Badge className={sub.subscription_status ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 shadow-none font-semibold rounded-md px-2" : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/60 shadow-none font-semibold rounded-md px-2"}>
                      {sub.subscription_status ? "Active" : "Expired"}
                    </Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Start Date</span>
                      <span className="font-medium text-slate-700">{new Date(sub.started_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Renewal Date</span>
                      <span className="font-medium text-slate-700">{new Date(sub.expires_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-[24px] border-0 shadow-2xl p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-red-50 p-5 rounded-full text-red-500 mb-2 border border-red-100">
              <Trash2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900">Delete Subscription Plan?</DialogTitle>
            <p className="text-slate-500 leading-relaxed">Are you sure you want to delete this subscription plan?</p>
            <p className="text-slate-500 leading-relaxed mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter className="mt-8 flex gap-3 sm:justify-center w-full">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="rounded-xl border-slate-200 h-12 flex-1 font-semibold">Cancel</Button>
            <Button onClick={executeDelete} className="rounded-xl bg-red-500 hover:bg-red-600 text-white h-12 flex-1 font-semibold shadow-md shadow-red-500/20">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SUBSCRIPTION SETTINGS MODAL */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[24px] border-0 shadow-2xl">
          <div className="px-8 py-6 border-b border-slate-100 bg-white">
            <DialogTitle className="text-2xl font-bold text-slate-900">Subscription Settings</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">Configure global rules, pricing logic, and notifications for all plans.</p>
          </div>
          <div className="px-8 py-7 bg-slate-50/50 max-h-[70vh] overflow-y-auto scrollbar-thin">
            <div className="space-y-8">
              
              {/* General Settings */}
              <div>
                <h4 className="font-bold text-slate-900 mb-4 text-lg">General Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Default Billing Cycle</label>
                    <select className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8B0] shadow-sm text-slate-700">
                      <option>Monthly</option>
                      <option>Quarterly</option>
                      <option>Yearly</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">Auto Renew</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">Allow Trial Plans</span>
                    <Switch className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">Multiple Active Plans</span>
                    <Switch className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                </div>
              </div>

              {/* Subscriber Settings */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4 text-lg">Subscriber Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Grace Period (Days)</label>
                    <Input type="number" defaultValue="3" className="rounded-xl border-slate-200 h-11 shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Renewal Reminder</label>
                    <Input type="number" defaultValue="7" className="rounded-xl border-slate-200 h-11 shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Max Plans / Resident</label>
                    <Input type="number" defaultValue="1" className="rounded-xl border-slate-200 h-11 shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4 text-lg">Pricing & Tax</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Currency</label>
                    <select className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8B0] shadow-sm text-slate-700">
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Default GST (%)</label>
                    <Input type="number" defaultValue="18" className="rounded-xl border-slate-200 h-11 shadow-sm" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">Tax Included in Price</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">Round Off Amount</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4 text-lg">Automated Notifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">Email Alerts</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">SMS Alerts</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">Push Notifications</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4 text-lg">Visibility Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">Show Disabled Plans</span>
                    <Switch className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">Auto 'Popular' Badge</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#14B8B0]" />
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center gap-3">
            <Button variant="ghost" onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-slate-900">Reset to Default</Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)} className="rounded-xl border-slate-200 h-11 px-6 font-semibold">Cancel</Button>
              <Button onClick={() => {
                toast("Subscription settings updated successfully.", "success");
                setIsSettingsOpen(false);
              }} className="rounded-xl bg-[#14B8B0] hover:bg-[#119F98] text-white h-11 px-8 font-semibold shadow-md shadow-[#14B8B0]/20">
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AUDIT LOGS DRAWER */}
      <Sheet open={isAuditLogsOpen} onOpenChange={setIsAuditLogsOpen}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl border-l-0 shadow-2xl p-0 flex flex-col bg-slate-50/50">
          <div className="p-6 border-b border-slate-100 bg-white shadow-sm z-10 flex flex-col gap-4">
            <SheetHeader className="flex flex-row items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 m-0">Audit Logs</h2>
                <p className="text-slate-500 m-0 mt-1 text-sm">Subscription management history and events.</p>
              </div>
              <Button variant="outline" className="h-9 px-3 text-xs font-semibold rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export Logs
              </Button>
            </SheetHeader>
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search logs..." className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-[#14B8B0]" />
              </div>
              <div className="relative w-36">
                <Input type="date" className="h-10 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-[#14B8B0] text-sm text-slate-600" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
            <div className="space-y-4">
              {[
                { action: "Plan Updated", plan: "Premium", user: "Platform Admin", date: "04 Aug 2026, 10:45 AM", details: "Price Changed", prev: "₹2499", new: "₹2999", remarks: "Annual revision" },
                { action: "Subscriber Assigned", plan: "Basic", user: "System", date: "03 Aug 2026, 02:15 PM", details: "New Subscription", prev: "-", new: "John Doe", remarks: "Auto-assigned on payment" },
                { action: "Feature Added", plan: "Premium", user: "Platform Admin", date: "01 Aug 2026, 11:00 AM", details: "Included free express delivery", prev: "-", new: "Free Express Delivery", remarks: "Marketing promotion" },
                { action: "Plan Duplicated", plan: "Premium Copy", user: "Platform Admin", date: "28 Jul 2026, 09:30 AM", details: "Created from Premium", prev: "-", new: "Premium Copy", remarks: "Testing new features" },
                { action: "Plan Created", plan: "Basic", user: "Super Admin", date: "15 Jul 2026, 04:20 PM", details: "Initial launch", prev: "-", new: "Basic Plan", remarks: "-" },
              ].map((log, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${log.action.includes('Created') || log.action.includes('Added') ? 'bg-emerald-100 text-emerald-600' : log.action.includes('Deleted') || log.action.includes('Removed') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{log.action}</h4>
                        <p className="text-xs text-slate-500 font-medium">{log.date}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">{log.plan}</Badge>
                  </div>
                  <div className="pl-11 grid grid-cols-2 gap-y-2 gap-x-4 text-xs mt-1">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium">Updated By</span>
                      <span className="font-semibold text-slate-700">{log.user}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium">Details</span>
                      <span className="font-semibold text-slate-700">{log.details}</span>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                      <div>
                        <span className="text-slate-400 block mb-0.5 font-medium">Previous Value</span>
                        <span className="font-semibold text-slate-600 line-through decoration-slate-300">{log.prev}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5 font-medium">New Value</span>
                        <span className="font-bold text-emerald-600">{log.new}</span>
                      </div>
                    </div>
                    {log.remarks !== "-" && (
                      <div className="col-span-2 mt-1">
                        <span className="text-slate-400 font-medium mr-2">Remarks:</span>
                        <span className="text-slate-600 italic">{log.remarks}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center z-10">
            <p className="text-xs text-slate-500 font-medium">Showing 1-5 of 42 logs</p>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-xs px-3" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-xs px-3">Next</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
