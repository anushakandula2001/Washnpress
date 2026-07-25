"use client";

import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export default function ResidentNotificationsPage() {
  const { notifications } = useResident();

  return (
    <ResidentShell greeting="Notifications" subtitle="Pickup reminders, order updates, and wallet alerts">
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>Synced from platform notification services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "rounded-xl border border-border p-4",
                  n.unread ? "bg-primary/5" : "bg-background",
                )}
              >
                <p className="font-medium">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </ResidentShell>
  );
}
