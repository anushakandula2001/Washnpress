"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { operationsNav } from "@/lib/portal-nav";

type Notif = {
  id: string;
  title: string;
  body: string;
  unread: boolean;
  relatedOrderCode?: string | null;
  createdAt: string;
};

export default function OperationsNotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/operations/notifications", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load");
      setItems((data.notifications as Notif[]) ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: string) {
    await fetch("/api/operations/notifications", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    await load();
  }

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Notifications"
      subtitle={`${unreadCount} unread · New pickups and order alerts`}
    >
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inbox</CardTitle>
          <CardDescription>Stored in PostgreSQL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border px-4 py-3 ${n.unread ? "border-primary/40 bg-primary/5" : "border-border"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                      {n.relatedOrderCode ? ` · ${n.relatedOrderCode}` : ""}
                    </p>
                  </div>
                  {n.unread ? (
                    <Button size="sm" variant="outline" onClick={() => void markRead(n.id)}>
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
