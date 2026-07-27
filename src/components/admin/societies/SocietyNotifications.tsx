"use client";

import { EmptyState } from "@/components/admin/shared/EmptyState";

export function SocietyNotifications({ societyName }: { societyId: string; societyName: string }) {
  return (
    <EmptyState
      title="Notifications"
      description={`Send announcements and service updates to residents at ${societyName}.`}
      actions={
        <p className="text-xs text-muted-foreground">
          Use the Communications module to broadcast to society residents.
        </p>
      }
    />
  );
}
