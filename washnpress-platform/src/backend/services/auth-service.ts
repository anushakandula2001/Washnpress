import { z } from "zod";
import { isValidIndianMobile, isOtpUsable } from "@/lib/domain";
import { redis, otpKey, OTP_TTL_SECONDS } from "@/backend/db/redis";
import { findUserByPhone } from "@/backend/repositories/residents";
import { checkPhone } from "@/backend/repositories/auth-ext";
import { createSession } from "@/backend/api/session";
import { queryOne } from "@/backend/db/pool";
import type { SessionUser } from "@/backend/types";

async function ensureRedis() {
  try {
    if (redis.status === "wait" || redis.status === "end" || redis.status === "close") {
      await redis.connect();
    }
    const pong = await redis.ping();
    if (pong !== "PONG") throw new Error("Redis ping failed");
  } catch (err) {
    // Already connecting/connected races — retry ping once
    try {
      const pong = await redis.ping();
      if (pong === "PONG") return;
    } catch {
      console.error("[OTP Redis]", err);
      throw new Error("OTP service unavailable. Please try again.");
    }
  }
}

export type OtpPurpose = "login" | "register";

export async function sendOtp(phone: string, purpose: OtpPurpose = "login") {
  if (!isValidIndianMobile(phone)) {
    throw new Error("Invalid Indian mobile number");
  }

  const check = await checkPhone(phone);
  const roles = check.roles ?? [];

  if (purpose === "login") {
    if (!check.exists) {
      throw new Error("No account found. Please create an account.");
    }
  } else {
    // Registration is for residents only
    if (check.exists) {
      if (roles.includes("operator")) {
        throw new Error(
          "An operator account already exists with this mobile number. Please sign in instead.",
        );
      }
      if (roles.includes("admin")) {
        throw new Error(
          "An admin account already exists with this mobile number. Please sign in instead.",
        );
      }
      throw new Error(
        "An account already exists with this mobile number. Please sign in instead.",
      );
    }
  }

  await ensureRedis();

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const payload = JSON.stringify({
    otp,
    issuedAt: new Date().toISOString(),
    attempts: 0,
    purpose,
  });

  await redis.setex(otpKey(phone), OTP_TTL_SECONDS, payload);

  const smsConfigured = Boolean(
    process.env.OTP_PROVIDER_API_KEY &&
      process.env.OTP_PROVIDER_API_KEY !== "replace-with-provider-key",
  );

  if (process.env.NODE_ENV === "production") {
    if (!smsConfigured) {
      await redis.del(otpKey(phone));
      throw new Error("Failed to send OTP. Please try again.");
    }
    try {
      // Wire real SMS provider here. Until then, fail closed in production.
      throw new Error("SMS provider not fully configured");
    } catch (err) {
      await redis.del(otpKey(phone));
      console.error("[OTP SMS] delivery failed", err);
      throw new Error("Failed to send OTP. Please try again.");
    }
  }

  // Development: OTP is printed in the Next.js server terminal (never in the browser)
  const banner = [
    "",
    "========================================",
    "  WASHNPRESS DEV OTP",
    `  Purpose: ${purpose.toUpperCase()}`,
    `  Phone: +91 ${phone}`,
    `  Code:  ${otp}`,
    `  Expires in ${OTP_TTL_SECONDS / 60} minutes`,
    "========================================",
    "",
  ].join("\n");
  process.stdout.write(banner);

  return {
    sent: true,
    expiresInSeconds: OTP_TTL_SECONDS,
    purpose,
    message: "OTP sent successfully",
  };
}

export async function verifyOtp(phone: string, otp: string): Promise<SessionUser> {
  if (!isValidIndianMobile(phone)) {
    throw new Error("Invalid Indian mobile number");
  }

  await ensureRedis();

  const raw = await redis.get(otpKey(phone));
  if (!raw) {
    throw new Error("OTP expired or not found");
  }

  const stored = JSON.parse(raw) as {
    otp: string;
    issuedAt: string;
    attempts: number;
    purpose?: string;
  };
  const check = isOtpUsable(otp, stored.issuedAt, stored.attempts, new Date(), stored.otp);

  if (!check.ok) {
    await redis.setex(
      otpKey(phone),
      OTP_TTL_SECONDS,
      JSON.stringify({ ...stored, attempts: stored.attempts + 1 }),
    );
    throw new Error(check.reason ?? "Invalid OTP");
  }

  // One-time use — delete before creating session
  await redis.del(otpKey(phone));

  let user = await findUserByPhone(phone);

  if (!user) {
    // Only registration OTP may create a shell user; login requires an existing account
    if (stored.purpose === "login") {
      throw new Error("No account found. Please create an account.");
    }
    user = await queryOne<{ id: string; phone: string; full_name: string | null }>(
      `INSERT INTO users (phone) VALUES ($1) RETURNING id, phone, full_name`,
      [phone],
    );
  }

  if (!user) throw new Error("Failed to create user");

  await queryOne(`UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1`, [
    user.id,
  ]);

  const sessionUser = await queryOne<SessionUser & { roles: string[] }>(
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
    [user.id],
  );

  if (!sessionUser) throw new Error("Failed to load user session");

  // Ensure operators/admins always have their role even if resident join is null
  const roles = Array.isArray(sessionUser.roles) ? sessionUser.roles.filter(Boolean) : [];

  const token = await createSession({
    userId: sessionUser.userId,
    residentId: sessionUser.residentId,
    phone: sessionUser.phone,
    fullName: sessionUser.fullName,
    unitNumber: sessionUser.unitNumber,
    towerBlock: sessionUser.towerBlock,
    societyId: sessionUser.societyId,
    societyName: sessionUser.societyName,
    roles,
  });

  return { ...sessionUser, roles, token } as SessionUser & { token: string };
}

export const otpSendSchema = z.object({
  phone: z.string().trim(),
  purpose: z.enum(["login", "register"]).default("login"),
});

export const otpVerifySchema = z.object({
  phone: z.string().trim(),
  otp: z.string().trim(),
});
