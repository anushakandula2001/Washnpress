"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/admin/shared/Avatar";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

export function PickupResidentTab({ data }: { data: Record<string, unknown> }) {
  const resident = data.resident as Record<string, unknown> | undefined;
  const p = data.pickup as Record<string, unknown>;

  if (!resident) {
    return <p className="text-sm text-muted-foreground">Resident details unavailable.</p>;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar name={String(resident.full_name)} size="lg" />
          <div>
            <CardTitle className="text-base">{String(resident.full_name)}</CardTitle>
            <p className="text-sm text-muted-foreground">{String(resident.resident_code ?? resident.id)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Phone</p>
          <p>+91 {String(resident.phone ?? "")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p>{String(resident.email ?? "—")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Unit</p>
          <p>
            {[p.tower_block, p.unit_number].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Account Status</p>
          <StatusBadge status={String(resident.user_status ?? "active")} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last Login</p>
          <p>
            {resident.last_login_at
              ? new Date(String(resident.last_login_at)).toLocaleString()
              : "Never"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Member Since</p>
          <p>
            {resident.created_at ? new Date(String(resident.created_at)).toLocaleDateString() : "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
