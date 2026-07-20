import { getSessionFromRequest } from "@/backend/api/session";
import { queryOne } from "@/backend/db/pool";
import type { SessionUser } from "@/backend/types";
import { unauthorized, forbidden } from "@/backend/api/response";

const DEMO_PHONES: Record<string, string> = {
  resident: "9876543210",
  operator: "9876500002",
  admin: "9876500001",
};

async function loadSessionByPhone(phone: string): Promise<SessionUser | null> {
  const row = await queryOne<{
    userId: string;
    residentId: string | null;
    phone: string;
    fullName: string | null;
    unitNumber: string | null;
    towerBlock: string | null;
    societyId: string | null;
    societyName: string | null;
    roles: string[];
  }>(
    `SELECT u.id AS "userId", r.id AS "residentId", u.phone, u.full_name AS "fullName",
            r.unit_number AS "unitNumber", r.tower_block AS "towerBlock",
            r.society_id AS "societyId", s.name AS "societyName",
            COALESCE(array_agg(DISTINCT ro.name) FILTER (WHERE ro.name IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN residents r ON r.user_id = u.id
     LEFT JOIN societies s ON s.id = r.society_id
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles ro ON ro.id = ur.role_id
     WHERE u.phone = $1
     GROUP BY u.id, r.id, s.name`,
    [phone],
  );
  return row;
}

export async function getSessionForRole(
  request: Request,
  role?: "resident" | "operator" | "admin",
): Promise<SessionUser | null> {
  const session = await getSessionFromRequest(request);
  if (session) return session;

  // Dev-only cookie-less fallback for API smoke tests — never overrides a real session
  if (process.env.NODE_ENV === "development" && role && process.env.WNP_DEMO_SESSION === "1") {
    return loadSessionByPhone(DEMO_PHONES[role]);
  }

  return null;
}

export async function requireSession(request: Request, role?: "resident" | "operator" | "admin") {
  const session = await getSessionForRole(request, role);
  if (!session) return { error: unauthorized() };
  return { session };
}

export async function requireResident(request: Request) {
  const result = await requireSession(request, "resident");
  if ("error" in result) return result;
  if (!result.session.residentId) return { error: forbidden("Resident profile required") };
  if (!result.session.roles.includes("resident") && !result.session.roles.includes("admin")) {
    return { error: forbidden("Requires resident role") };
  }
  return result;
}

export async function requireRole(request: Request, role: "resident" | "operator" | "admin") {
  const result = await requireSession(request, role);
  if ("error" in result) return result;

  const roles = result.session.roles ?? [];
  const ok =
    roles.includes(role) ||
    (role === "operator" && roles.includes("admin"));

  if (!ok) {
    return { error: forbidden(`Requires ${role} role`) };
  }
  return result;
}

export function hasRole(session: SessionUser, role: string) {
  return session.roles.includes(role) || (role === "operator" && session.roles.includes("admin"));
}
