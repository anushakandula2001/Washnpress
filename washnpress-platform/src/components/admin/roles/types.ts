export type PlatformRole = "admin" | "operator" | "resident";

export type RoleRow = {
  id: string;
  name: PlatformRole;
};

export type UserRoleRow = {
  id: string;
  phone: string;
  full_name: string;
  email?: string | null;
  status: string;
  roles: string[];
  societies?: string[];
  resident_id?: string | null;
  operator_id?: string | null;
  last_login_at?: string | null;
  created_at?: string;
};

export type AuditLogRow = {
  id: string;
  actor_user_id?: string | null;
  actor_role?: string | null;
  action: string;
  entity_name: string;
  entity_id?: string | null;
  before_state?: Record<string, unknown> | null;
  after_state?: Record<string, unknown> | null;
  created_at: string;
};

export type SocietyOpt = { id: string; name: string };

export type RoleFilters = {
  q: string;
  role: string;
  status: string;
  societyId: string;
};

export const defaultRoleFilters: RoleFilters = {
  q: "",
  role: "",
  status: "",
  societyId: "",
};

export const PLATFORM_ROLES: PlatformRole[] = ["admin", "operator", "resident"];

export const ROLE_META: Record<
  PlatformRole,
  { label: string; description: string; color: string }
> = {
  admin: {
    label: "Admin",
    description: "Full platform access — societies, pricing, users, analytics, and system settings.",
    color: "text-violet-600 dark:text-violet-400",
  },
  operator: {
    label: "Operator",
    description: "Manages pickups, deliveries, QC, and resident support for assigned societies.",
    color: "text-sky-600 dark:text-sky-400",
  },
  resident: {
    label: "Resident",
    description: "Books pickups, tracks orders, manages wallet, subscription, and support tickets.",
    color: "text-emerald-600 dark:text-emerald-400",
  },
};

export type PermissionFeature = {
  id: string;
  label: string;
  category: string;
  admin: boolean;
  operator: boolean;
  resident: boolean;
};

export const PERMISSION_MATRIX: PermissionFeature[] = [
  { id: "dashboard", label: "Dashboard", category: "Core", admin: true, operator: true, resident: true },
  { id: "orders", label: "Orders & Pickups", category: "Operations", admin: true, operator: true, resident: true },
  { id: "residents", label: "Residents Management", category: "User Management", admin: true, operator: true, resident: false },
  { id: "operators", label: "Operators Management", category: "User Management", admin: true, operator: false, resident: false },
  { id: "societies", label: "Societies & Branches", category: "Platform", admin: true, operator: false, resident: false },
  { id: "pricing", label: "Pricing & Catalog", category: "Commerce", admin: true, operator: false, resident: false },
  { id: "subscriptions", label: "Subscriptions", category: "Commerce", admin: true, operator: false, resident: true },
  { id: "wallet", label: "Wallet & Payments", category: "Commerce", admin: true, operator: false, resident: true },
  { id: "analytics", label: "Reports & Analytics", category: "Insights", admin: true, operator: true, resident: false },
  { id: "notifications", label: "Notifications", category: "Communications", admin: true, operator: true, resident: true },
  { id: "support", label: "Support Tickets", category: "Communications", admin: true, operator: true, resident: true },
  { id: "audit", label: "Audit Logs", category: "System", admin: true, operator: false, resident: false },
  { id: "roles", label: "Roles & Permissions", category: "System", admin: true, operator: false, resident: false },
  { id: "settings", label: "Platform Settings", category: "System", admin: true, operator: false, resident: false },
];

export function primaryRole(roles: string[]): PlatformRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("operator")) return "operator";
  return "resident";
}

export function societyLabel(societies?: string[]): string {
  if (!societies?.length) return "—";
  return societies.join(", ");
}

export function isRoleChangeLog(log: AuditLogRow): boolean {
  return log.action === "update_user_roles" || log.entity_name === "user_roles";
}
