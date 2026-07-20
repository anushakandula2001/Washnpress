import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarClock,
  UserPlus,
  ListOrdered,
  Droplets,
  Wind,
  Shirt,
  CheckCircle2,
  Package,
  PackageCheck,
  Truck,
  CircleCheck,
  Users,
  Bike,
  BarChart3,
  Bell,
  Settings,
  Shield,
  Building2,
  Tags,
  CreditCard,
  Sparkles,
  ShoppingBag,
  Wallet,
  PieChart,
  Headphones,
  ScrollText,
  MapPin,
  Activity,
  Gauge,
} from "lucide-react";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  section?: string;
};

export const operationsNav: PortalNavItem[] = [
  { href: "/operations/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true, section: "Overview" },
  { href: "/operations/pickup-slots", label: "Pickup Slots", icon: CalendarClock, section: "Pickups" },
  { href: "/operations/master-data", label: "Master Data", icon: Building2, section: "Master Data" },
  { href: "/operations/service-areas", label: "Service Areas", icon: MapPin, section: "Master Data" },
  { href: "/operations/executive-assignments", label: "Executives", icon: Bike, section: "Master Data" },
  { href: "/operations/pickups", label: "Today's Pickups", icon: CalendarClock, section: "Pickups" },
  { href: "/operations/pickup-assignment", label: "Pickup Assignment", icon: UserPlus, section: "Pickups" },
  { href: "/operations/pickup-queue", label: "Pickup Queue", icon: ListOrdered, section: "Pickups" },
  { href: "/operations/washing", label: "Washing Queue", icon: Droplets, section: "Processing" },
  { href: "/operations/drying", label: "Drying Queue", icon: Wind, section: "Processing" },
  { href: "/operations/ironing", label: "Ironing Queue", icon: Shirt, section: "Processing" },
  { href: "/operations/qc", label: "Quality Check", icon: CheckCircle2, section: "Processing" },
  { href: "/operations/packing", label: "Packing Queue", icon: Package, section: "Processing" },
  { href: "/operations/ready-delivery", label: "Ready For Delivery", icon: PackageCheck, section: "Delivery" },
  { href: "/operations/out-for-delivery", label: "Out For Delivery", icon: Truck, section: "Delivery" },
  { href: "/operations/completed", label: "Completed Orders", icon: CircleCheck, section: "Delivery" },
  { href: "/operations/customers", label: "Customers", icon: Users, section: "People" },
  { href: "/operations/executives", label: "Executives Roster", icon: Bike, section: "People" },
  { href: "/operations/reports", label: "Reports", icon: BarChart3, section: "System" },
  { href: "/operations/notifications", label: "Notifications", icon: Bell, section: "System" },
  { href: "/operations/settings", label: "Settings", icon: Settings, section: "System" },
];

export const adminNav: PortalNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true, section: "Overview" },

  { href: "/admin/residents", label: "Residents", icon: Users, section: "User Management" },
  { href: "/admin/operators", label: "Operators", icon: Shield, section: "User Management" },
  { href: "/admin/users/roles", label: "Roles & Permissions", icon: Shield, section: "User Management" },

  { href: "/admin/societies", label: "Societies", icon: Building2, section: "Communities" },

  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, section: "Operations" },
  { href: "/admin/pickups", label: "Pickups", icon: CalendarClock, section: "Operations" },
  { href: "/admin/deliveries", label: "Deliveries", icon: Truck, section: "Operations" },

  { href: "/admin/pricing", label: "Pricing", icon: Tags, section: "Business" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, section: "Business" },
  { href: "/admin/payments", label: "Payments", icon: Wallet, section: "Business" },

  { href: "/admin/addons", label: "Add-on Services", icon: Sparkles, section: "Services" },

  { href: "/admin/notifications", label: "Notifications", icon: Bell, section: "Support" },
  { href: "/admin/support", label: "Support Tickets", icon: Headphones, section: "Support" },

  { href: "/admin/reports", label: "Reports", icon: BarChart3, section: "Insights" },
  { href: "/admin/analytics", label: "Analytics", icon: PieChart, section: "Insights" },
  { href: "/admin/performance", label: "Operator Performance", icon: Gauge, section: "Insights" },

  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, section: "System" },
  { href: "/admin/system-health", label: "System Health", icon: Activity, section: "System" },
  { href: "/admin/settings", label: "Settings", icon: Settings, section: "System" },
];

export const residentNavExtras: PortalNavItem[] = [
  { href: "/resident/track", label: "Track Order", icon: MapPin },
  { href: "/resident/notifications", label: "Notifications", icon: Bell },
  { href: "/resident/addresses", label: "Addresses", icon: MapPin },
];

export const OPERATIONS_STAGES = [
  { id: "pickup", label: "Pickup", nextAction: "Start Washing", nextHref: "/operations/washing", statusAfter: "Washing" },
  { id: "washing", label: "Washing", nextAction: "Complete Washing", nextHref: "/operations/drying", statusAfter: "Drying" },
  { id: "drying", label: "Drying", nextAction: "Complete Drying", nextHref: "/operations/ironing", statusAfter: "Ironing" },
  { id: "ironing", label: "Ironing", nextAction: "Complete Ironing", nextHref: "/operations/qc", statusAfter: "Quality Check" },
  { id: "qc", label: "Quality Check", nextAction: "Pass QC", nextHref: "/operations/packing", statusAfter: "Packing" },
  { id: "packing", label: "Packing", nextAction: "Mark Packed", nextHref: "/operations/ready-delivery", statusAfter: "Ready for Delivery" },
  { id: "ready", label: "Ready for Delivery", nextAction: "Assign Driver", nextHref: "/operations/out-for-delivery", statusAfter: "Out for Delivery" },
  { id: "ofd", label: "Out for Delivery", nextAction: "Mark Delivered", nextHref: "/operations/completed", statusAfter: "Delivered" },
] as const;
