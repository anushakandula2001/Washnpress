import type { AuthUser } from "@/frontend/api-client";

export type PortalRole = "resident" | "operator" | "admin";

export function primaryRole(roles: string[]): PortalRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("operator")) return "operator";
  return "resident";
}

export function homePathForRoles(roles: string[]): string {
  switch (primaryRole(roles)) {
    case "admin":
      return "/admin/dashboard";
    case "operator":
      return "/operations/dashboard";
    default:
      return "/resident/dashboard";
  }
}

export function homePathForUser(user: AuthUser): string {
  return homePathForRoles(user.roles ?? []);
}

export function roleAllowedForPath(roles: string[], pathname: string): boolean {
  const role = primaryRole(roles);
  if (pathname.startsWith("/admin")) return role === "admin";
  if (pathname.startsWith("/operations")) return role === "operator" || role === "admin";
  if (pathname.startsWith("/resident") || pathname.startsWith("/onboarding")) {
    return role === "resident";
  }
  return true;
}
