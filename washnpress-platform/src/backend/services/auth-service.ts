import { z } from "zod";
import { isValidIndianMobile, isOtpUsable } from "@/lib/domain";
import { redis, otpKey, OTP_TTL_SECONDS } from "@/backend/db/redis";
import { findUserByPhone } from "@/backend/repositories/residents";
import { createSession } from "@/backend/api/session";
import { queryOne } from "@/backend/db/pool";
import type { SessionUser } from "@/backend/types";

export async function sendOtp(phone: string) {
  if (!isValidIndianMobile(phone)) {
    throw new Error("Invalid Indian mobile number");
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const payload = JSON.stringify({ otp, issuedAt: new Date().toISOString(), attempts: 0 });

  await redis.setex(otpKey(phone), OTP_TTL_SECONDS, payload);

  if (process.env.NODE_ENV === "development") {
    const banner = [
      "",
      "========================================",
      "  WASHNPRESS DEV OTP",
      `  Phone: +91 ${phone}`,
      `  Code:  ${otp}`,
      `  Expires in ${OTP_TTL_SECONDS / 60} minutes`,
      "========================================",
      "",
    ].join("\n");
    process.stdout.write(banner);
  }

  return { sent: true, expiresInSeconds: OTP_TTL_SECONDS };
}

export async function verifyOtp(phone: string, otp: string): Promise<SessionUser> {
  const raw = await redis.get(otpKey(phone));
  if (!raw) {
    throw new Error("OTP expired or not found");
  }

  const stored = JSON.parse(raw) as { otp: string; issuedAt: string; attempts: number };
  const check = isOtpUsable(otp, stored.issuedAt, stored.attempts);

  if (!check.ok) {
    await redis.setex(
      otpKey(phone),
      OTP_TTL_SECONDS,
      JSON.stringify({ ...stored, attempts: stored.attempts + 1 }),
    );
    throw new Error(check.reason ?? "Invalid OTP");
  }

  await redis.del(otpKey(phone));

  let user = await findUserByPhone(phone);

  if (!user) {
    user = await queryOne<{ id: string; phone: string; full_name: string | null }>(
      `INSERT INTO users (phone) VALUES ($1) RETURNING id, phone, full_name`,
      [phone],
    );
  }

  if (!user) throw new Error("Failed to create user");

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

  const token = await createSession({
    userId: sessionUser.userId,
    residentId: sessionUser.residentId,
    phone: sessionUser.phone,
    fullName: sessionUser.fullName,
    unitNumber: sessionUser.unitNumber,
    towerBlock: sessionUser.towerBlock,
    societyId: sessionUser.societyId,
    societyName: sessionUser.societyName,
    roles: sessionUser.roles,
  });

  return { ...sessionUser, token } as SessionUser & { token: string };
}

export const otpSendSchema = z.object({
  phone: z.string().trim(),
});

export const otpVerifySchema = z.object({
  phone: z.string().trim(),
  otp: z.string().trim(),
});
