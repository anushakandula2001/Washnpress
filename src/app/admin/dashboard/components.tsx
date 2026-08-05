"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Truck,
  Building2,
  PackageSearch,
  CheckCircle2,
  IndianRupee,
  Wallet,
  LifeBuoy,
  Plus,
  Clock,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  CreditCard,
  BellRing,
  Activity,
  Database,
  Server,
  HardDrive,
  Cpu,
  BadgeCheck,
  CalendarClock,
  Settings,
  XCircle,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

// --- Welcome Section ---
export function WelcomeSection() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/10 rounded-[18px]">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Good Morning, Platform Admin 👋</h2>
        <p className="text-muted-foreground mt-1">Manage your entire laundry platform from one place.</p>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl">
          <Plus className="h-4 w-4" /> Create Society
        </Button>
        <Button variant="outline" className="w-full sm:w-auto gap-2 shadow-sm rounded-xl border-border hover:bg-muted/50">
          <Plus className="h-4 w-4" /> Add Operator
        </Button>
      </div>
    </div>
  );
}

// --- KPI Cards ---
const kpiData = [
  { label: "Residents", value: "2,845", icon: Users, change: "+12% this week", positive: true },
  { label: "Operators", value: "48", icon: Truck, change: "+2 this week", positive: true },
  { label: "Societies", value: "32", icon: Building2, change: "Active across 3 cities", positive: true },
  { label: "Orders Today", value: "156", icon: PackageSearch, change: "+18% vs yesterday", positive: true },
  { label: "Pickups Today", value: "89", icon: Clock, change: "12 pending", positive: false },
  { label: "Deliveries Today", value: "112", icon: CheckCircle2, change: "4 delayed", positive: false },
  { label: "Revenue Today", value: "₹45,200", icon: IndianRupee, change: "+8% vs average", positive: true },
  { label: "Wallet Balance", value: "₹12,45,000", icon: Wallet, change: "Platform holds", positive: true },
  { label: "Support Tickets", value: "14", icon: LifeBuoy, change: "3 urgent", positive: false },
];

export function KpiGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {kpiData.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group relative overflow-hidden bg-card/50 backdrop-blur-md border border-border p-5 rounded-[18px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform duration-300">
              <kpi.icon className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{kpi.label}</h3>
          <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{kpi.value}</p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", kpi.positive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400")}>
              {kpi.change}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// --- Quick Actions ---
const quickActions = [
  { label: "Create Society", icon: Building2 },
  { label: "Add Resident", icon: UserPlus },
  { label: "Add Operator", icon: Truck },
  { label: "Create Subscription", icon: BadgeCheck },
  { label: "Manage Pricing", icon: IndianRupee },
  { label: "Assign Pickup", icon: CalendarClock },
  { label: "Send Notification", icon: BellRing },
  { label: "Generate Invoice", icon: CreditCard },
];

export function QuickActionsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {quickActions.map((action, i) => (
        <button
          key={action.label}
          className="flex flex-col items-center justify-center p-4 bg-card hover:bg-muted/50 border border-border rounded-[18px] transition-all hover:border-primary/30 group"
        >
          <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-3">
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-foreground text-center">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

// --- Generic Table/List Card ---
function CardWrapper({ title, children, action }: { title: string; children: React.ReactNode; action?: string }) {
  return (
    <div className="bg-card border border-border rounded-[18px] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {action && (
          <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            {action} <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="p-0">
        {children}
      </div>
    </div>
  );
}

// --- Today's Pickups & Deliveries ---
const pickupsData = [
  { id: "#ORD-1092", resident: "Aarav Sharma", time: "09:00 AM - 11:00 AM", operator: "Ramesh K.", status: "Pending" },
  { id: "#ORD-1093", resident: "Priya Singh", time: "10:00 AM - 12:00 PM", operator: "Suresh M.", status: "Assigned" },
  { id: "#ORD-1094", resident: "Vikram Patel", time: "11:00 AM - 01:00 PM", operator: "Ramesh K.", status: "Picked" },
  { id: "#ORD-1095", resident: "Neha Gupta", time: "12:00 PM - 02:00 PM", operator: "Amit V.", status: "Completed" },
];

const deliveriesData = [
  { resident: "Sanjay Kumar", time: "02:00 PM - 04:00 PM", operator: "Dinesh P.", status: "Out for Delivery" },
  { resident: "Anita Desai", time: "03:00 PM - 05:00 PM", operator: "Mukesh R.", status: "Delivered" },
  { resident: "Rahul Verma", time: "04:00 PM - 06:00 PM", operator: "Pending", status: "Delayed" },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Pending": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    case "Assigned": return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-primary/40 dark:border-primary/30";
    case "Picked":
    case "Out for Delivery": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50";
    case "Completed":
    case "Delivered": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
    case "Delayed": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50";
    default: return "bg-gray-100 text-gray-700";
  }
}

export function TodaysPickups() {
  return (
    <CardWrapper title="Today's Pickups" action="View all">
      <div className="divide-y divide-border/50">
        {pickupsData.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">{item.resident}</span>
              <span className="text-xs text-muted-foreground font-medium">{item.id} • {item.time}</span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider", getStatusColor(item.status))}>
                {item.status}
              </Badge>
              <span className="text-xs text-muted-foreground">{item.operator}</span>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

export function TodaysDeliveries() {
  return (
    <CardWrapper title="Today's Deliveries" action="View all">
      <div className="divide-y divide-border/50">
        {deliveriesData.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">{item.resident}</span>
              <span className="text-xs text-muted-foreground font-medium">{item.time}</span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider", getStatusColor(item.status))}>
                {item.status}
              </Badge>
              <span className="text-xs text-muted-foreground">{item.operator}</span>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

// --- Recent Orders Table ---
const ordersData = [
  { id: "#ORD-1092", resident: "Aarav Sharma", service: "Wash & Fold", society: "Prestige Shantiniketan", amount: "₹450", status: "In Process" },
  { id: "#ORD-1091", resident: "Kavita Reddy", service: "Dry Cleaning", society: "Brigade Gateway", amount: "₹1,200", status: "Completed" },
  { id: "#ORD-1090", resident: "Sunil Joshi", service: "Premium Wash", society: "Sobha City", amount: "₹850", status: "Out for Delivery" },
  { id: "#ORD-1089", resident: "Pooja Hegde", service: "Ironing", society: "Salarpuria Sattva", amount: "₹240", status: "Pending" },
];

export function RecentOrders() {
  return (
    <CardWrapper title="Recent Orders" action="View all orders">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
            <tr>
              <th className="px-5 py-3 font-medium rounded-tl-lg">Order ID</th>
              <th className="px-5 py-3 font-medium">Resident</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Society</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {ordersData.map((order, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5 font-medium text-foreground">{order.id}</td>
                <td className="px-5 py-3.5">{order.resident}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{order.service}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{order.society}</td>
                <td className="px-5 py-3.5 font-medium">{order.amount}</td>
                <td className="px-5 py-3.5">
                  <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", getStatusColor(order.status))}>
                    {order.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-xs font-medium text-primary hover:underline">View</button>
                    <button className="text-xs font-medium text-muted-foreground hover:text-foreground">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardWrapper>
  );
}

// --- Pending Tasks ---
const tasksData = [
  { title: "Operator Approvals", count: 3, critical: false },
  { title: "Resident Verification", count: 12, critical: false },
  { title: "Pickup Delays", count: 4, critical: true },
  { title: "Support Tickets", count: 7, critical: false },
  { title: "Payment Issues", count: 2, critical: true },
];

export function PendingTasks() {
  return (
    <CardWrapper title="Pending Tasks">
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {tasksData.map((task, i) => (
          <div key={i} className={cn("p-4 rounded-xl border flex flex-col items-start gap-3", task.critical ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20")}>
            <div className="flex items-center justify-between w-full">
              <span className="text-2xl font-bold">{task.count}</span>
              {task.critical ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
            </div>
            <span className={cn("text-xs font-semibold uppercase tracking-wider", task.critical ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400")}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

// --- Recent Residents & Payments ---
const residentsData = [
  { name: "Anil Kapoor", phone: "+91 9876543210", society: "Sobha City", date: "Today, 10:23 AM" },
  { name: "Divya Sharma", phone: "+91 9988776655", society: "Prestige Shantiniketan", date: "Yesterday" },
  { name: "Rajat Bose", phone: "+91 9123456789", society: "Brigade Gateway", date: "Yesterday" },
];

export function RecentResidents() {
  return (
    <CardWrapper title="Recent Residents" action="View all">
      <div className="divide-y divide-border/50">
        {residentsData.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-4 hover:bg-muted/30">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {r.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground truncate">{r.phone}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium">{r.society}</p>
              <p className="text-[10px] text-muted-foreground">{r.date}</p>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

const paymentsData = [
  { resident: "Vikram Patel", amount: "₹450", method: "UPI", status: "Success", date: "10 mins ago" },
  { resident: "Neha Gupta", amount: "₹1,200", method: "Card", status: "Success", date: "1 hour ago" },
  { resident: "Rahul Verma", amount: "₹850", method: "Wallet", status: "Failed", date: "2 hours ago" },
];

export function RecentPayments() {
  return (
    <CardWrapper title="Recent Payments" action="View all">
      <div className="divide-y divide-border/50">
        {paymentsData.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">{p.resident}</span>
              <span className="text-xs text-muted-foreground">{p.method} • {p.date}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-bold">{p.amount}</span>
              <span className={cn("text-[10px] font-bold uppercase", p.status === "Success" ? "text-emerald-500" : "text-red-500")}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

// --- System Info ---
const notifications = [
  { msg: "New resident registered from Sobha City.", time: "10m ago" },
  { msg: "Operator Ramesh K. assigned to 4 pickups.", time: "1h ago" },
  { msg: "Order #ORD-1089 marked as Delivered.", time: "2h ago" },
  { msg: "Payment of ₹1,200 received via UPI.", time: "3h ago" },
  { msg: "New society 'Brigade Gateway' added.", time: "5h ago" },
];

export function SystemNotifications() {
  return (
    <CardWrapper title="System Notifications">
      <div className="p-4 space-y-4">
        {notifications.map((n, i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-0.5 shrink-0 h-2 w-2 rounded-full bg-primary/60" />
            <div className="flex-1">
              <p className="text-sm text-foreground">{n.msg}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

export function SystemHealth() {
  const systems = [
    { name: "Database", icon: Database, status: "Healthy", color: "text-emerald-500" },
    { name: "API Services", icon: Server, status: "Healthy", color: "text-emerald-500" },
    { name: "Redis Cache", icon: HardDrive, status: "Healthy", color: "text-emerald-500" },
    { name: "Storage", icon: HardDrive, status: "Warning", color: "text-amber-500" },
    { name: "Background Jobs", icon: Cpu, status: "Healthy", color: "text-emerald-500" },
  ];

  return (
    <CardWrapper title="System Health">
      <div className="p-4 space-y-3">
        {systems.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
            <div className="flex items-center gap-3">
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{s.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{s.status}</span>
              <div className={cn("h-2 w-2 rounded-full bg-current", s.color)} />
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

// --- Right Sidebar ---
export function RightSidebar() {
  return (
    <div className="flex flex-col gap-6">
      {/* Today's Schedule Mini */}
      <div className="bg-card border border-border rounded-[18px] overflow-hidden p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Today's Schedule</h3>
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          <div className="relative flex items-center group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-emerald-500 shadow shrink-0 z-10">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="ml-4 p-3 rounded-lg border border-border bg-card shadow-sm w-full">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-foreground text-xs">08:00 AM</div>
              </div>
              <div className="text-xs text-muted-foreground">Morning Shift Start</div>
            </div>
          </div>
          <div className="relative flex items-center group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-primary shadow shrink-0 z-10">
              <Truck className="h-4 w-4" />
            </div>
            <div className="ml-4 p-3 rounded-lg border border-border bg-card shadow-sm w-full">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-foreground text-xs">12:00 PM</div>
              </div>
              <div className="text-xs text-muted-foreground">Peak Pickup Window</div>
            </div>
          </div>
          <div className="relative flex items-center group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-muted-foreground shadow shrink-0 z-10">
              <Clock className="h-4 w-4" />
            </div>
            <div className="ml-4 p-3 rounded-lg border border-border bg-card shadow-sm w-full">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-foreground text-xs">06:00 PM</div>
              </div>
              <div className="text-xs text-muted-foreground">Evening Deliveries</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mini Stats */}
      <div className="bg-card border border-border rounded-[18px] p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Queue Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground font-medium">Pending Pickups</p>
            </div>
            <div className="h-8 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
              -12%
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold">18</p>
              <p className="text-xs text-muted-foreground font-medium">Pending Deliveries</p>
            </div>
            <div className="h-8 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs">
              +4%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
