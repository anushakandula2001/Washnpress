"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_META, type PlatformRole, type UserRoleRow, primaryRole } from "./types";

export function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  saving,
}: {
  user: UserRoleRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (role: PlatformRole) => void;
  saving?: boolean;
}) {
  const [nextRole, setNextRole] = useState<PlatformRole>("resident");

  useEffect(() => {
    if (user) setNextRole(primaryRole(user.roles));
  }, [user]);

  if (!user) return null;

  const current = primaryRole(user.roles);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Change user role">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Update access for <span className="font-medium text-foreground">{user.full_name}</span> (+91 {user.phone})
          </p>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm">
            Current role:{" "}
            <Badge variant="secondary" className="capitalize">
              {current}
            </Badge>
          </p>
          <div className="grid gap-2">
            {(["admin", "operator", "resident"] as PlatformRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setNextRole(role)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  nextRole === role
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className="font-medium">{ROLE_META[role].label}</p>
                <p className="text-xs text-muted-foreground">{ROLE_META[role].description}</p>
              </button>
            ))}
          </div>
          {nextRole !== current && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
              This will replace the user&apos;s current role with <strong>{nextRole}</strong>. This action is logged in audit history.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(nextRole)}
            disabled={saving || nextRole === current}
          >
            {saving ? "Saving…" : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
