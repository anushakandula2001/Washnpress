"use client";

export function ResidentNotifications({ data }: { data: Record<string, unknown> }) {
  const notifications = (data.notifications as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs">
        <span className="rounded-full bg-muted px-2 py-1">SMS</span>
        <span className="rounded-full bg-muted px-2 py-1">Email</span>
        <span className="rounded-full bg-muted px-2 py-1">Push</span>
      </div>
      {notifications.map((n) => (
        <div
          key={String(n.id)}
          className={`rounded-lg border px-3 py-2 text-sm ${n.is_read ? "border-border" : "border-primary/30 bg-primary/5"}`}
        >
          <p className="font-medium">{String(n.title)}</p>
          <p className="text-xs text-muted-foreground">{String(n.body)}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{new Date(String(n.created_at)).toLocaleString()}</p>
        </div>
      ))}
      {notifications.length === 0 && <p className="text-sm text-muted-foreground">No notifications sent</p>}
    </div>
  );
}
