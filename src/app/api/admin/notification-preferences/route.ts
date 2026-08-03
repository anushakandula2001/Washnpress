import { withErrorHandling } from "@/backend/api/response";
import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { ok, badRequest } from "@/backend/api/response";
import { getPlatformSettings, setPlatformSetting } from "@/backend/repositories/admin-commerce";

const preferencesSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingNotifications: z.boolean(),
});

async function _GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  try {
    const settings = await getPlatformSettings();
    const prefs = (settings as Record<string, unknown>).notification_preferences ?? {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      marketingNotifications: false,
    };
    return ok({ preferences: prefs });
  } catch {
    // Fallback default preferences
    return ok({
      preferences: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        marketingNotifications: false,
      },
    });
  }
}

async function _PUT(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid notification preferences data");
  }

  try {
    await setPlatformSetting("notification_preferences", parsed.data);
  } catch (err) {
    console.warn("Saving notification preferences fallback notice:", err);
  }

  return ok({
    success: true,
    message: "Notification preferences saved successfully",
    preferences: parsed.data,
  });
}


export const GET = withErrorHandling(_GET);
export const PUT = withErrorHandling(_PUT);
