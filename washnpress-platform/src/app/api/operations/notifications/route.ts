import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import {
  listUserNotifications,
  markUserNotificationRead,
  countUnreadUserNotifications,
} from "@/backend/repositories/notifications";

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const notifications = await listUserNotifications(auth.session.userId);
  const unreadCount = await countUnreadUserNotifications(auth.session.userId);

  return ok({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      unread: !n.is_read,
      relatedOrderCode: n.related_order_code,
      createdAt: n.created_at,
    })),
    unreadCount,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const body = await request.json();
  if (body.notificationId) {
    await markUserNotificationRead(body.notificationId, auth.session.userId);
  }
  return ok({ updated: true });
}
