import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  ShoppingBag,
  CalendarClock,
  Truck,
  Sparkles,
  Tags,
  CreditCard,
  Wallet,
  Banknote,
  BarChart3,
  PieChart,
  Gauge,
  Building,
  Bell,
  Headphones,
  MessageSquare,
  Settings,
  KeyRound,
  ScrollText,
  Activity,
  Plus,
  UserPlus,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
  keywords?: string[];
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
  defaultExpanded?: boolean;
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "overview",
    label: "",
    defaultExpanded: true,
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
        keywords: ["home", "overview"],
      },
    ],
  },
  {
    id: "network",
    label: "Network",
    defaultExpanded: true,
    items: [
      { href: "/admin/societies", label: "Societies", icon: Building2, keywords: ["community", "society"] },
      { href: "/admin/residents", label: "Residents", icon: Users, keywords: ["resident", "customer"] },
      { href: "/admin/operators", label: "Operators", icon: Shield, keywords: ["operator", "staff"] },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    defaultExpanded: true,
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag, keywords: ["order", "laundry"] },
      { href: "/admin/pickups", label: "Pickups", icon: CalendarClock, keywords: ["pickup", "schedule"] },
      { href: "/admin/deliveries", label: "Deliveries", icon: Truck, keywords: ["delivery", "dispatch"] },
    ],
  },
  {
    id: "business",
    label: "Business",
    defaultExpanded: true,
    items: [
      { href: "/admin/services", label: "Services", icon: Sparkles, keywords: ["laundry", "addon", "pricing rules"] },
      { href: "/admin/pricing", label: "Pricing", icon: Tags, keywords: ["price", "garment"] },
      { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, keywords: ["plan", "subscription"] },
      { href: "/admin/wallet-transactions", label: "Wallet", icon: Wallet, keywords: ["wallet", "credits", "refund"] },
      { href: "/admin/payments", label: "Payments", icon: Banknote, keywords: ["payment", "invoice"] },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    defaultExpanded: false,
    items: [
      { href: "/admin/reports", label: "Reports", icon: BarChart3, keywords: ["report", "export"] },
      { href: "/admin/analytics", label: "Analytics", icon: PieChart, keywords: ["analytics", "chart"] },
      { href: "/admin/performance", label: "Operator Performance", icon: Gauge, keywords: ["operator", "performance"] },
      { href: "/admin/analytics?society=1", label: "Society Performance", icon: Building, keywords: ["society", "performance"] },
    ],
  },
  {
    id: "support",
    label: "Support",
    defaultExpanded: false,
    items: [
      { href: "/admin/notifications", label: "Notifications", icon: Bell, keywords: ["notification", "sms", "push"] },
      { href: "/admin/support", label: "Support Tickets", icon: Headphones, keywords: ["support", "ticket", "complaint"] },
      { href: "/admin/support?tab=feedback", label: "Feedback", icon: MessageSquare, keywords: ["feedback", "review", "rating"] },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    defaultExpanded: false,
    items: [
      { href: "/admin/settings", label: "General Settings", icon: Settings, keywords: ["settings", "profile", "branding", "tax"] },
      { href: "/admin/users/roles", label: "Access Control", icon: KeyRound, keywords: ["roles", "permissions", "access"] },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, keywords: ["audit", "log", "history"] },
      { href: "/admin/system-health", label: "System Health", icon: Activity, keywords: ["health", "database", "redis"] },
    ],
  },
];

export const adminQuickActions = [
  { href: "/admin/societies?create=1", label: "Create Society", icon: Plus },
  { href: "/admin/operators?create=1", label: "Create Operator", icon: Plus },
  { href: "/admin/residents", label: "Create Resident", icon: UserPlus },
  { href: "/admin/orders?create=1", label: "Create Order", icon: ShoppingBag },
] as const;

export function flattenAdminNav(groups: AdminNavGroup[] = adminNavGroups): AdminNavItem[] {
  return groups.flatMap((g) => g.items);
}

export function getAllAdminNavItems(): AdminNavItem[] {
  return flattenAdminNav();
}

/** @deprecated Use adminNavGroups — kept for backward compatibility */
export type PortalNavItem = AdminNavItem & { section?: string };

export const adminNav: PortalNavItem[] = flattenAdminNav().map((item) => ({
  ...item,
  section: adminNavGroups.find((g) => g.items.some((i) => i.href === item.href))?.label || "Overview",
}));
