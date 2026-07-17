import { cookies } from "next/headers";
import { redis, sessionKey, SESSION_TTL_SECONDS } from "@/backend/db/redis";
import { queryOne } from "@/backend/db/pool";
import type { SessionUser } from "@/backend/types";

const SESSION_COOKIE = "wnp_session";
const DEMO_PHONE = "9876543210";

export async function createSession(user: SessionUser): Promise<string> {
  const token = crypto.randomUUID();
  await redis.setex(sessionKey(token), SESSION_TTL_SECONDS, JSON.stringify(user));
  return token;
}

export async function destroySession(token: string) {
  await redis.del(sessionKey(token));
}

export async function getSessionFromToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const raw = await redis.get(sessionKey(token));
    if (!raw) return null;
    const session = JSON.parse(raw) as SessionUser;
    if (session.residentId && session.societyId) return session;

    const fresh = await loadSessionUser(session.userId);
    if (!fresh) return session;

    await redis.setex(sessionKey(token), SESSION_TTL_SECONDS, JSON.stringify(fresh));
    return fresh;
  } catch {
    return null;
  }
}

export async function loadSessionUser(userId: string): Promise<SessionUser | null> {
  return queryOne<SessionUser>(
    `SELECT u.id AS "userId", r.id AS "residentId", u.phone, u.full_name AS "fullName",
            r.unit_number AS "unitNumber", r.tower_block AS "towerBlock",
            r.society_id AS "societyId", s.name AS "societyName",
            COALESCE(array_agg(DISTINCT ro.name) FILTER (WHERE ro.name IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN residents r ON r.user_id = u.id
     LEFT JOIN societies s ON s.id = r.society_id
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles ro ON ro.id = ur.role_id
     WHERE u.id = $1
     GROUP BY u.id, r.id, s.name`,
    [userId],
  );
}

export async function refreshSessionForToken(
  token: string,
  userId: string,
): Promise<SessionUser | null> {
  const user = await loadSessionUser(userId);
  if (!user) return null;
  await redis.setex(sessionKey(token), SESSION_TTL_SECONDS, JSON.stringify(user));
  return user;
}

export function getTokenFromRequest(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match?.[1];
}

async function getDemoSession(): Promise<SessionUser | null> {
  const row = await queryOne<{
    user_id: string;
    resident_id: string;
    phone: string;
    full_name: string | null;
    unit_number: string;
    tower_block: string | null;
    society_id: string;
    society_name: string;
    roles: string[];
  }>(
    `SELECT u.id AS user_id, r.id AS resident_id, u.phone, u.full_name,
            r.unit_number, r.tower_block, r.society_id, s.name AS society_name,
            COALESCE(array_agg(DISTINCT ro.name) FILTER (WHERE ro.name IS NOT NULL), '{}') AS roles
     FROM users u
     JOIN residents r ON r.user_id = u.id
     JOIN societies s ON s.id = r.society_id
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles ro ON ro.id = ur.role_id
     WHERE u.phone = $1
     GROUP BY u.id, r.id, s.name`,
    [DEMO_PHONE],
  );

  if (!row) return null;

  return {
    userId: row.user_id,
    residentId: row.resident_id,
    phone: row.phone,
    fullName: row.full_name,
    unitNumber: row.unit_number,
    towerBlock: row.tower_block,
    societyId: row.society_id,
    societyName: row.society_name,
    roles: row.roles,
  };
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await getSessionFromToken(token);

  if (session) return session;

  if (process.env.NODE_ENV === "development") {
    return getDemoSession();
  }

  return null;
}

export async function getSessionFromRequest(request: Request): Promise<SessionUser | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const session = await getSessionFromToken(match?.[1]);

  if (session) return session;

  if (process.env.NODE_ENV === "development") {
    return getDemoSession();
  }

  return null;
}

export { SESSION_COOKIE };
