"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  CalendarClock,
  CheckCircle2,
  Wallet,
  CreditCard,
  Gift,
  Clock,
  ArrowRight,
  Shirt,
  Sparkles,
  Wind,
  Droplets,
  Box,
  MapPin,
  MessageCircle,
  PhoneCall,
  Info,
  Edit3,
  Activity,
  History,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

// --- Utility Wrapper ---
function CardWrapper({ title, children, action, className }: { title?: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-[18px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]", className)}>
      {title && (
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-0">
        {children}
      </div>
    </div>
  );
}

// --- Welcome Section ---
export function WelcomeSection({ name }: { name?: string }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/15 via-primary/5 to-background border border-primary/20 rounded-[18px]">
      <div>
        <h2 className="text-2xl font-bold text-foreground">👋 Welcome Back, {name || "Resident"}!</h2>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Your laundry is just one click away.</p>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Link href="/resident/pickup" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl">
            Book Pickup <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/resident/orders" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto gap-2 shadow-sm rounded-xl border-border hover:bg-muted/50">
            View Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}

// --- Summary Cards ---
const summaryData = [
  { label: "Active Orders", value: "2", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Completed Orders", value: "14", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Today's Pickup", value: "Pending", icon: CalendarClock, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Wallet Balance", value: "₹1,250", icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
];

export function SummaryCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {summaryData.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card border border-border p-5 rounded-[18px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group"
        >
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110", item.bg, item.color)}>
            <item.icon className="h-5 w-5" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</h3>
          <p className="text-xl font-bold text-foreground mt-1">{item.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

// --- Book Pickup Section ---
const services = [
  { name: "Laundry", icon: Shirt },
  { name: "Dry Cleaning", icon: Sparkles },
  { name: "Steam Iron", icon: Wind },
  { name: "Shoe Cleaning", icon: Box },
];

export function BookPickupCard() {
  return (
    <CardWrapper title="Quick Book Pickup">
      <div className="p-5 space-y-5">
        <div>
          <label className="text-sm font-semibold text-foreground mb-3 block">Select Service</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {services.map((s, i) => (
              <button key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-colors group">
                <s.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium text-foreground">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Pickup Date</label>
            <input type="date" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Time Slot</label>
            <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50">
              <option>09:00 AM - 11:00 AM</option>
              <option>12:00 PM - 02:00 PM</option>
              <option>04:00 PM - 06:00 PM</option>
            </select>
          </div>
        </div>
        <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold">
          Confirm Booking
        </Button>
      </div>
    </CardWrapper>
  );
}

// --- Current Orders & Tracking Stepper ---
const steps = [
  { label: "Order Confirmed", active: true, completed: true },
  { label: "Pickup Assigned", active: true, completed: true },
  { label: "Picked Up", active: true, completed: true },
  { label: "Cleaning", active: true, completed: false },
  { label: "Quality Check", active: false, completed: false },
  { label: "Out for Delivery", active: false, completed: false },
  { label: "Delivered", active: false, completed: false },
];

export function CurrentOrderTracking() {
  return (
    <CardWrapper title="Active Order: #ORD-1092" action={<Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Washing</Badge>}>
      <div className="p-5 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Service</p>
              <p className="text-sm font-semibold text-foreground">Premium Wash & Fold</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Operator</p>
              <p className="text-sm font-semibold text-foreground">Ramesh K.</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Pickup Date</p>
              <p className="text-sm font-semibold text-foreground">Today, 10:30 AM</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Est. Delivery</p>
              <p className="text-sm font-semibold text-foreground">Tomorrow, 06:00 PM</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="flex-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20">View Details</Button>
            <Button variant="outline" className="flex-1 rounded-xl">Contact Support</Button>
          </div>
        </div>
        
        {/* Vertical Stepper */}
        <div className="w-full md:w-64 shrink-0">
          <h4 className="text-sm font-bold text-foreground mb-4">Live Tracking</h4>
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:to-border">
            {steps.map((step, i) => (
              <div key={i} className="relative flex items-center group pb-4 last:pb-0">
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full border shadow shrink-0 z-10",
                  step.completed ? "bg-primary border-primary text-primary-foreground" : step.active ? "bg-card border-primary border-2 text-transparent" : "bg-card border-border text-transparent"
                )}>
                  {step.completed && <CheckCircle2 className="h-3 w-3" />}
                </div>
                <div className="ml-3">
                  <p className={cn("text-xs font-medium", step.active ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}

// --- Right Sidebar Components ---

export function UpcomingPickups() {
  return (
    <div className="bg-card border border-border rounded-[18px] overflow-hidden p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Upcoming Pickup</h3>
      </div>
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <CalendarClock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Tomorrow, 09:00 AM</p>
            <p className="text-xs text-muted-foreground mt-0.5">Prestige Shantiniketan, Tower A</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="w-full text-xs h-8 rounded-lg">Reschedule</Button>
          <Button size="sm" variant="outline" className="w-full text-xs h-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

export function WalletMiniCard() {
  return (
    <div className="bg-card border border-border rounded-[18px] overflow-hidden p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">My Wallet</h3>
        <Wallet className="h-4 w-4 text-primary" />
      </div>
      <p className="text-3xl font-bold text-foreground">₹1,250</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" className="w-full text-xs h-8 rounded-lg bg-primary text-white hover:bg-primary/90">
          <Plus className="h-3 w-3 mr-1" /> Add Money
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs h-8 rounded-lg">
          History
        </Button>
      </div>
    </div>
  );
}

export function SubscriptionMiniCard() {
  return (
    <div className="bg-card border border-border rounded-[18px] overflow-hidden p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0" />
      <div className="relative z-10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Subscription</h3>
        <p className="text-lg font-bold text-foreground">Premium Plan</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Garments left</span>
          <span className="font-semibold">12 / 30</span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full w-[60%]" />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 font-medium">Renews on Oct 12, 2026</p>
      </div>
    </div>
  );
}

export function RecentActivities() {
  const activities = [
    { title: "Order Delivered", desc: "#ORD-1089 completed.", time: "2h ago", icon: CheckCircle2, color: "text-emerald-500" },
    { title: "Payment Added", desc: "₹500 added to wallet.", time: "1d ago", icon: Wallet, color: "text-blue-500" },
    { title: "Pickup Scheduled", desc: "For tomorrow 09:00 AM.", time: "2d ago", icon: CalendarClock, color: "text-primary" },
  ];

  return (
    <div className="bg-card border border-border rounded-[18px] overflow-hidden p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((a, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className={cn("mt-0.5 shrink-0", a.color)}>
              <a.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OffersCarousel() {
  return (
    <CardWrapper title="Exclusive Offers">
      <div className="p-4 flex gap-4 overflow-x-auto pb-4 snap-x">
        <div className="min-w-[240px] shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl p-4 snap-start relative overflow-hidden">
          <Gift className="absolute -bottom-2 -right-2 h-16 w-16 text-primary opacity-10" />
          <Badge className="bg-primary text-white mb-2">Flat 20% Off</Badge>
          <p className="text-sm font-bold text-foreground">On Premium Dry Cleaning</p>
          <p className="text-xs text-muted-foreground mt-1">Use code: DRY20</p>
        </div>
        <div className="min-w-[240px] shrink-0 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-xl p-4 snap-start relative overflow-hidden">
          <Sparkles className="absolute -bottom-2 -right-2 h-16 w-16 text-blue-500 opacity-10" />
          <Badge className="bg-blue-500 text-white mb-2">Free Pickup</Badge>
          <p className="text-sm font-bold text-foreground">On orders above ₹500</p>
          <p className="text-xs text-muted-foreground mt-1">Applied automatically</p>
        </div>
      </div>
    </CardWrapper>
  );
}

// --- Footer ---
export function ResidentFooter() {
  return (
    <footer className="mt-12 py-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 opacity-50 grayscale">
        <img src="/logo.png" alt="Wash N Press" className="h-6 w-auto" />
      </div>
      <div className="flex gap-4 text-sm font-medium text-muted-foreground">
        <Link href="/resident/privacy" className="hover:text-foreground">Privacy Policy</Link>
        <Link href="/resident/terms" className="hover:text-foreground">Terms & Conditions</Link>
        <Link href="/resident/support" className="hover:text-foreground">Contact Support</Link>
      </div>
    </footer>
  );
}
