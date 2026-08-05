"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Truck,
  Factory,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  ArrowRight,
  RefreshCw,
  UserCheck,
  Phone,
  MapPin,
  ChevronRight,
  Printer,
  Tag,
  BellRing,
  ClipboardCheck,
  Eye,
  Play,
  Activity,
  AlertTriangle,
  BadgeCheck,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

type PickupCard = {
  id: string;
  resident: string;
  society: string;
  apartment: string;
  time: string;
  operator: string;
  phone: string;
  address: string;
  status: string;
};

type DeliveryCard = {
  id: string;
  resident: string;
  address: string;
  time: string;
  operator: string;
  phone: string;
  status: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionHeader({ title, href, count }: { title: string; href?: string; count?: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {count !== undefined && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-bold text-primary">
            {count}
          </span>
        )}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    pending:    { color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300", label: "Pending" },
    assigned:   { color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400", label: "Assigned" },
    started:    { color: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400", label: "In Progress" },
    picked:     { color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400", label: "Picked Up" },
    processing: { color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400", label: "Processing" },
    ready:      { color: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400", label: "Ready" },
    delivered:  { color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Delivered" },
    delayed:    { color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400", label: "Delayed" },
    cancelled:  { color: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400", label: "Cancelled" },
  };
  const key = status.toLowerCase().replace(/\s+/g, "");
  const c = config[key] ?? config["pending"];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", c.color)}>
      {c.label}
    </span>
  );
}

// ─── Welcome Section ──────────────────────────────────────────────────────────

export function WelcomeSection() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[18px] bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/15">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Good Morning, Operations Team 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Today's Operations Overview — manage pickups, deliveries & processing.</p>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button
          variant="outline"
          className="w-full sm:w-auto gap-2 rounded-xl border-border hover:bg-muted/50"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4" /> Refresh Orders
        </Button>
        <Link href="/operations/pickups">
          <Button className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm">
            <UserCheck className="h-4 w-4" /> Assign Pickup
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

const summaryItems = [
  { label: "Today's Pickups",      value: 24,  icon: CalendarClock,  color: "text-blue-500",   bg: "bg-blue-500/10",   badge: "Scheduled",  href: "/operations/pickups" },
  { label: "Today's Deliveries",   value: 18,  icon: Truck,          color: "text-indigo-500", bg: "bg-indigo-500/10", badge: "Active",     href: "/operations/delivery" },
  { label: "In Processing",        value: 42,  icon: Factory,        color: "text-amber-500",  bg: "bg-amber-500/10",  badge: "Live",       href: "/operations/processing-center" },
  { label: "Orders Ready",         value: 11,  icon: PackageCheck,   color: "text-teal-500",   bg: "bg-teal-500/10",   badge: "Ready",      href: "/operations/ready-delivery" },
  { label: "Completed Today",      value: 38,  icon: CheckCircle2,   color: "text-emerald-500",bg: "bg-emerald-500/10",badge: "Done",       href: "/operations/completed" },
  { label: "Pending Orders",       value: 9,   icon: Clock,          color: "text-orange-500", bg: "bg-orange-500/10", badge: "Waiting",    href: "/operations/pickup-queue" },
  { label: "Cancelled",            value: 3,   icon: XCircle,        color: "text-red-500",    bg: "bg-red-500/10",    badge: "Alert",      href: "/operations/dashboard" },
];

export function SummaryCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-4">
      {summaryItems.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Link href={item.href}>
            <div className="bg-card border border-border rounded-[18px] p-4 hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer h-full">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", item.bg, item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5 leading-snug">{item.label}</p>
              <div className="mt-2">
                <StatusBadge status={item.badge.toLowerCase()} />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Today's Pickups Preview ──────────────────────────────────────────────────

const pickupData: PickupCard[] = [
  { id: "ORD-1092", resident: "Aarav Sharma", society: "Prestige Shantiniketan", apartment: "Tower A, Flat 204", time: "09:00 - 11:00 AM", operator: "Ramesh K.", phone: "+919876543210", address: "Prestige Shantiniketan, Whitefield, Bengaluru", status: "pending" },
  { id: "ORD-1093", resident: "Priya Singh", society: "Brigade Gateway", apartment: "Block B, Flat 512", time: "10:00 - 12:00 PM", operator: "Suresh M.", phone: "+919988776655", address: "Brigade Gateway, Rajajinagar, Bengaluru", status: "assigned" },
  { id: "ORD-1094", resident: "Vikram Patel", society: "Sobha City", apartment: "Tower C, Flat 801", time: "11:00 - 01:00 PM", operator: "Amit V.", phone: "+919123456789", address: "Sobha City, Thanisandra, Bengaluru", status: "started" },
];

export function TodaysPickupsPreview() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Today's Pickups" href="/operations/pickups" count={24} />
      <div className="space-y-3">
        {pickupData.map((p, i) => (
          <PickupCardRow key={i} pickup={p} />
        ))}
      </div>
    </div>
  );
}

export function PickupCardRow({ pickup }: { pickup: PickupCard }) {
  const [status, setStatus] = useState(pickup.status);

  return (
    <div className="bg-card border border-border rounded-[18px] p-4 hover:shadow-[0_6px_20px_rgb(0,0,0,0.05)] transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground">{pickup.resident}</span>
            <span className="text-xs text-muted-foreground font-medium">#{pickup.id}</span>
            <StatusBadge status={status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">Society: </span><span className="font-medium">{pickup.society}</span></div>
            <div><span className="text-muted-foreground">Flat: </span><span className="font-medium">{pickup.apartment}</span></div>
            <div><span className="text-muted-foreground">Time: </span><span className="font-medium">{pickup.time}</span></div>
            <div><span className="text-muted-foreground">Operator: </span><span className="font-medium">{pickup.operator}</span></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Link href={`/operations/pickups/${pickup.id}`}>
            <button className="flex items-center gap-1.5 rounded-xl bg-muted/60 hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors">
              <Eye className="h-3.5 w-3.5" /> View
            </button>
          </Link>
          <button
            onClick={() => setStatus("started")}
            className="flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition-colors"
          >
            <Play className="h-3.5 w-3.5" /> Start Pickup
          </button>
          <a
            href={`tel:${pickup.phone}`}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(pickup.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors"
          >
            <MapPin className="h-3.5 w-3.5" /> Navigate
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Today's Deliveries Preview ───────────────────────────────────────────────

const deliveryData: DeliveryCard[] = [
  { id: "ORD-1089", resident: "Neha Gupta", address: "Salarpuria Sattva, Tower D, Flat 302, Bengaluru", time: "02:00 - 04:00 PM", operator: "Dinesh P.", phone: "+919812345678", status: "pending" },
  { id: "ORD-1087", resident: "Sunil Joshi", address: "Sobha City, Tower C, Flat 801, Bengaluru", time: "03:00 - 05:00 PM", operator: "Mukesh R.", phone: "+919765432100", status: "started" },
  { id: "ORD-1085", resident: "Kavita Reddy", address: "Brigade Gateway, Block A, Flat 110, Bengaluru", time: "05:00 - 07:00 PM", operator: "Ramesh K.", phone: "+919988776655", status: "delivered" },
];

export function TodaysDeliveriesPreview() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Today's Deliveries" href="/operations/delivery" count={18} />
      <div className="space-y-3">
        {deliveryData.map((d, i) => (
          <DeliveryCardRow key={i} delivery={d} />
        ))}
      </div>
    </div>
  );
}

export function DeliveryCardRow({ delivery }: { delivery: DeliveryCard }) {
  const [status, setStatus] = useState(delivery.status);

  return (
    <div className="bg-card border border-border rounded-[18px] p-4 hover:shadow-[0_6px_20px_rgb(0,0,0,0.05)] transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground">{delivery.resident}</span>
            <span className="text-xs text-muted-foreground font-medium">#{delivery.id}</span>
            <StatusBadge status={status} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <div className="sm:col-span-2"><span className="text-muted-foreground">Address: </span><span className="font-medium">{delivery.address}</span></div>
            <div><span className="text-muted-foreground">Time: </span><span className="font-medium">{delivery.time}</span></div>
            <div><span className="text-muted-foreground">Operator: </span><span className="font-medium">{delivery.operator}</span></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Link href={`/operations/pickups/${delivery.id}`}>
            <button className="flex items-center gap-1.5 rounded-xl bg-muted/60 hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors">
              <Eye className="h-3.5 w-3.5" /> View
            </button>
          </Link>
          <button
            onClick={() => setStatus("started")}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors"
          >
            <Truck className="h-3.5 w-3.5" /> Start Delivery
          </button>
          <button
            onClick={() => setStatus("delivered")}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors"
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> Mark Delivered
          </button>
          <a
            href={`tel:${delivery.phone}`}
            className="flex items-center gap-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(delivery.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 px-3 py-1.5 text-xs font-semibold text-orange-600 transition-colors"
          >
            <MapPin className="h-3.5 w-3.5" /> Navigate
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Actions Grid ───────────────────────────────────────────────────────

const quickActions = [
  { label: "Assign Operator", icon: UserCheck, color: "text-primary", bg: "bg-primary/10" },
  { label: "Create Pickup", icon: CalendarClock, color: "text-blue-500", bg: "bg-blue-500/10", href: "/operations/pickups" },
  { label: "Update Order", icon: Package, color: "text-amber-500", bg: "bg-amber-500/10", href: "/operations/pickup-queue" },
  { label: "Print Invoice", icon: Printer, color: "text-slate-500", bg: "bg-slate-500/10" },
  { label: "Generate Label", icon: Tag, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Notify Customer", icon: BellRing, color: "text-pink-500", bg: "bg-pink-500/10" },
  { label: "Mark Delivered", icon: BadgeCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/operations/delivery" },
];

export function QuickActionsGrid() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Quick Actions" />
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        {quickActions.map((action, i) => {
          const content = (
            <div key={i} className="flex flex-col items-center justify-center gap-2 p-4 bg-card border border-border rounded-[18px] hover:shadow-[0_6px_20px_rgb(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group h-full">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", action.bg, action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground text-center leading-snug">{action.label}</span>
            </div>
          );
          return action.href ? (
            <Link key={i} href={action.href}>{content}</Link>
          ) : (
            <div key={i}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent Activities ────────────────────────────────────────────────────────

const activities = [
  { title: "Pickup Completed", desc: "#ORD-1088 — Aarav Sharma, Sobha City", time: "5 min ago", icon: CheckCircle2, color: "text-emerald-500" },
  { title: "Order Received", desc: "#ORD-1091 — Priya Singh arrived at center", time: "18 min ago", icon: Package, color: "text-blue-500" },
  { title: "Order Washed", desc: "#ORD-1086 — moved to Drying stage", time: "45 min ago", icon: Activity, color: "text-primary" },
  { title: "Order Packed", desc: "#ORD-1082 — packed & ready for dispatch", time: "1h 10m ago", icon: PackageCheck, color: "text-violet-500" },
  { title: "Delivery Completed", desc: "#ORD-1079 — Kavita Reddy, Brigade Gateway", time: "2h ago", icon: Truck, color: "text-indigo-500" },
];

export function RecentActivities() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Recent Activities" />
      <div className="bg-card border border-border rounded-[18px] overflow-hidden">
        <div className="divide-y divide-border/50">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors">
              <div className={cn("mt-0.5 shrink-0", a.color)}>
                <a.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.desc}</p>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Panel ──────────────────────────────────────────────────────

const notifs = [
  { title: "Pickup Delayed", body: "#ORD-1094 — Ramesh K. delayed by 30 min", time: "5m ago", urgent: true },
  { title: "Operator Assigned", body: "Suresh M. assigned to 3 new pickups", time: "15m ago", urgent: false },
  { title: "Reschedule Request", body: "Priya Singh requested reschedule to tomorrow", time: "40m ago", urgent: false },
  { title: "New Order", body: "#ORD-1097 placed by Vikram Patel", time: "1h ago", urgent: false },
  { title: "Payment Completed", body: "₹850 received for #ORD-1092", time: "2h ago", urgent: false },
];

export function NotificationsPanel() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Notifications" href="/operations/notifications" />
      <div className="bg-card border border-border rounded-[18px] overflow-hidden">
        <div className="divide-y divide-border/50">
          {notifs.map((n, i) => (
            <div key={i} className={cn("flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors cursor-pointer", n.urgent && "bg-red-500/3")}>
              <div className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0 mt-1.5", n.urgent ? "bg-red-500" : "bg-primary/50")} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  {n.urgent && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Right Sidebar ────────────────────────────────────────────────────────────

export function OperationsRightSidebar() {
  return (
    <div className="flex flex-col gap-6">
      {/* Today's Schedule */}
      <div className="bg-card border border-border rounded-[18px] p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Today's Schedule</h3>
        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/40 before:via-border before:to-transparent">
          {[
            { time: "08:00 AM", label: "Morning Shift Start", done: true },
            { time: "09:00 AM", label: "First Pickup Batch", done: true },
            { time: "12:00 PM", label: "Processing Peak", done: false },
            { time: "04:00 PM", label: "Delivery Window", done: false },
            { time: "08:00 PM", label: "Shift End", done: false },
          ].map((s, i) => (
            <div key={i} className="relative flex items-center gap-3 pl-6">
              <div className={cn("absolute left-0 h-4 w-4 rounded-full border-2 flex items-center justify-center", s.done ? "bg-primary border-primary" : "bg-card border-border")}>
                {s.done && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{s.time}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Status */}
      <div className="bg-card border border-border rounded-[18px] p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Queue Status</h3>
        <div className="space-y-3">
          {[
            { label: "Pending Pickups", value: 9 },
            { label: "In Processing", value: 42 },
            { label: "Ready to Dispatch", value: 11 },
            { label: "Out for Delivery", value: 7 },
          ].map((q, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{q.label}</span>
              <span className="text-sm font-bold text-foreground">{q.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
