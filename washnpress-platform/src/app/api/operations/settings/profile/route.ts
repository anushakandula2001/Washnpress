import { requireRole } from "@/backend/api/guards";
import { query, queryOne } from "@/backend/db/pool";
import { ok, badRequest, notFound } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const userId = auth.session.userId;

  try {
    // Load user + operator profile
    const profile = await queryOne(
      `
      SELECT
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,
        u.created_at AS date_joined,

        o.id AS operator_id,
        o.operator_code,
        o.status,
        o.designation,
        o.reporting_manager

      FROM users u
      LEFT JOIN operators o
        ON o.user_id = u.id

      WHERE u.id = $1
      `,
      [userId]
    );

    if (!profile) {
      return notFound("Profile not found");
    }

    let assignedSocieties: any[] = [];

    // Load assigned societies only if operator exists
    if (profile.operator_id) {
      const result = await query(
        `
        SELECT
          s.id,
          s.name,
          s.address_line_1,
          s.city,
          s.state,
          s.status

        FROM operator_societies os
        JOIN societies s
          ON s.id = os.society_id

        WHERE os.operator_id = $1

        ORDER BY s.name
        `,
        [profile.operator_id]
      );

      assignedSocieties = result.rows;
    }

    return ok({
      profile: {
        userId: profile.user_id,
        operatorId: profile.operator_id,
        operatorCode: profile.operator_code,
        fullName: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        role: auth.session.roles?.[0] ?? "operator",
        status: profile.status,
        designation: profile.designation,
        reportingManager: profile.reporting_manager,
        dateJoined: profile.date_joined,
      },
      assignedSocieties,
    });
  } catch (error) {
    console.error("Settings API Error:", error);

    return badRequest(
      error instanceof Error
        ? error.message
        : "Failed to load profile"
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const userId = auth.session.userId;

  try {
    const body = await request.json();

    const { phone } = body;

    const result = await query(
      `
      UPDATE users
      SET
        phone = COALESCE($1, phone),
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        full_name,
        email,
        phone,
        updated_at
      `,
      [phone, userId]
    );

    return ok({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return badRequest(
      error instanceof Error
        ? error.message
        : "Failed to update profile"
    );
  }
}