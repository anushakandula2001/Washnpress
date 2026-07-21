"use client";

import { Avatar } from "@/components/admin/shared/Avatar";
import { Sheet, SheetBody, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";
import { ROLE_META, societyLabel, type PlatformRole, type UserRoleRow, primaryRole } from "./types";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

export function UserDetailsDrawer({
  user,
  open,
  onOpenChange,
  onChangeRole,
  onToggleStatus,
}: {
  user: UserRoleRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeRole: (user: UserRoleRow) => void;
  onToggleStatus: (user: UserRoleRow) => void;
}) {
  if (!user) return null;

  const role = primaryRole(user.roles);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent width="480px">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar name={user.full_name} size="lg" />
            <div>
              <h2 className="text-lg font-semibold">{user.full_name || "—"}</h2>
              <p className="text-sm text-muted-foreground">+91 {user.phone}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant="secondary" className="capitalize">
                  {ROLE_META[role as PlatformRole]?.label ?? role}
                </Badge>
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>
        </SheetHeader>
        <SheetBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="User ID" value={<span className="font-mono text-xs">{user.id}</span>} />
            <Field label="Email" value={user.email || "—"} />
            <Field label="Society" value={societyLabel(user.societies)} />
            <Field
              label="Last Login"
              value={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"}
            />
            <Field
              label="Registered"
              value={user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            />
            <Field
              label="Roles"
              value={
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((r) => (
                    <Badge key={r} variant="secondary" className="capitalize">
                      {r}
                    </Badge>
                  ))}
                </div>
              }
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button size="sm" onClick={() => onChangeRole(user)}>
              Change Role
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleStatus(user)}
            >
              {user.status === "active" ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
