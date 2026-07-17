import { requireResident } from "@/backend/api/guards";
import { listNotifications, markNotificationRead } from "@/backend/repositories/billing";
import { ok, unauthorized } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const notifications = await listNotifications(session.residentId!);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return ok({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      unread: !n.is_read,
      createdAt: n.created_at,
    })),
    unreadCount,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const body = await request.json();
  if (body.notificationId) {
    await markNotificationRead(body.notificationId, session.residentId!);
  }

  return ok({ updated: true });
}
