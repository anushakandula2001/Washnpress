import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarClock,
  UserPlus,
  ListOrdered,
  PackageCheck,
  Truck,
  CircleCheck,
  Users,
  Bike,
  BarChart3,
  Bell,
  Settings,
  Building2,
  MapPin,
  Factory,
  Headphones,
} from "lucide-react";

// Re-export admin navigation from dedicated module
export {
  adminNav,
  adminNavGroups,
  adminQuickActions,
  flattenAdminNav,
  getAllAdminNavItems,
  type AdminNavGroup,
  type AdminNavItem,
} from "@/lib/navigation/admin-navigation";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  section?: string;
};


export const operationsNav: PortalNavItem[] = [
  {
    href: "/operations/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    section: "Overview",
  },
  {
    href: "/operations/pickup-slots",
    label: "Pickup Slots",
    icon: CalendarClock,
    section: "Pickups",
  },
  {
    href: "/operations/pickups",
    label: "Today's Pickups",
    icon: CalendarClock,
    section: "Pickups",
  },
  {
    href: "/operations/processing-center",
    label: "Processing Center",
    icon: Factory,
    section: "Processing",
  },
  {
    href: "/operations/delivery",
    label: "Delivery",
    icon: Truck,
    section: "Delivery",
  },
  {
    href: "/operations/delivered-orders",
    label: "Delivered Orders",
    icon: CircleCheck,
    section: "Delivery",
  },
  {
    href: "/operations/reports",
    label: "Reports",
    icon: BarChart3,
    section: "System",
  },
  
  {
    href: "/operations/customers",
    label: "Residents",
    icon: Users,
    section: "People",
  },
  {
    href: "/operations/assigned-societies",
    label: "Assigned Societies",
    icon: Building2,
    section: "Societies",
  },
  {
    href: "/operations/support-center",
    label: "Support Center",
    icon: Headphones,
    section: "Support Center",
  },
  {
    href: "/operations/settings",
    label: "Settings",
    icon: Settings,
    section: "System",
  },
] as const;

export const residentNavExtras: PortalNavItem[] = [
  { href: "/resident/notifications", label: "Notifications", icon: Bell },
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
