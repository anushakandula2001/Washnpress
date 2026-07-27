"use client";

import { useState } from "react";
import { Check, Shield, Wrench, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  PLATFORM_ROLES,
  ROLE_META,
  type PlatformRole,
  type UserRoleRow,
  primaryRole,
} from "./types";

const ROLE_ICONS: Record<PlatformRole, typeof Shield> = {
  admin: Shield,
  operator: Wrench,
  resident: Home,
};

// Custom modern structured permissions lists for each role
const ROLE_PERMISSIONS: Record<PlatformRole, Array<{ category: string; items: string[] }>> = {
  admin: [
    {
      category: "Dashboard",
      items: ["View Dashboard"],
    },
    {
      category: "Users",
      items: [
        "View Residents",
        "Create Residents",
        "Edit Residents",
        "Delete Residents",
        "View Operators",
        "Create Operators",
        "Edit Operators",
        "Delete Operators",
      ],
    },
    {
      category: "Orders",
      items: ["View Orders", "Create Manual Orders", "Assign Operators", "Cancel Orders"],
    },
    {
      category: "Pickups",
      items: ["View Pickups", "Reschedule Pickup", "Cancel Pickup"],
    },
    {
      category: "Deliveries",
      items: ["View Deliveries", "Assign Delivery", "Reschedule Delivery", "Cancel Delivery"],
    },
    {
      category: "Payments",
      items: ["View Payments", "Refund Payments", "Manage Invoices"],
    },
    {
      category: "Reports & Insights",
      items: ["View Reports", "View Analytics", "Operator Performance", "Society Performance"],
    },
    {
      category: "Settings & System",
      items: ["Manage Settings", "Access Control", "Audit Logs", "System Health"],
    },
  ],
  operator: [
    {
      category: "Dashboard",
      items: ["View Dashboard"],
    },
    {
      category: "Users",
      items: ["View Assigned Residents"],
    },
    {
      category: "Orders",
      items: ["View Orders", "Update Laundry Stages"],
    },
    {
      category: "Pickups",
      items: ["View Pickups", "Manage Pickups"],
    },
    {
      category: "Deliveries",
      items: ["View Deliveries", "Manage Deliveries"],
    },
    {
      category: "Settings & System",
      items: ["Cannot manage pricing", "Cannot manage subscriptions", "Cannot manage payments", "Cannot manage admin settings"],
    },
  ],
  resident: [
    {
      category: "Dashboard",
      items: ["Book Pickup", "Track Orders"],
    },
    {
      category: "Wallet",
      items: ["View Wallet Balance", "Credits", "Transactions", "Refunds"],
    },
    {
      category: "Subscriptions",
      items: ["View Subscription Plans", "Manage Subscription"],
    },
    {
      category: "Support & Profile",
      items: ["Notifications", "Create Support Tickets", "Feedback & Rating", "Profile Settings"],
    },
  ],
};

export function RoleCards({ users }: { users: UserRoleRow[] }) {
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<PlatformRole | null>(null);

  function countForRole(role: PlatformRole) {
    return users.filter((u) => primaryRole(u.roles) === role).length;
  }

  function openMatrix(role: PlatformRole) {
    setSelectedRole(role);
    setMatrixOpen(true);
  }

  return (
    <>
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {PLATFORM_ROLES.map((role) => {
          const meta = ROLE_META[role];
          const Icon = ROLE_ICONS[role];
          const count = countForRole(role);
          const perms = ROLE_PERMISSIONS[role];

          // Preview first 3 permissions items
          const previewItems = perms.flatMap((p) => p.items).slice(0, 3);

          return (
            <Card key={role} className="border-border/70 bg-card/90 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg bg-muted p-2 ${meta.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{meta.label}</CardTitle>
                      <CardDescription className="text-xs">{count} active users</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground min-h-[40px]">{meta.description}</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Capabilities</p>
                  <ul className="space-y-1.5">
                    {previewItems.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                    <li className="text-xs text-muted-foreground italic">
                      + Click below to view all permissions
                    </li>
                  </ul>
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => openMatrix(role)}>
                  View Permissions
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Dialog open={matrixOpen} onOpenChange={setMatrixOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" title="Role details">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedRole ? `${ROLE_META[selectedRole].label} Permissions` : "Permissions Details"}
            </DialogTitle>
            <DialogDescription>
              Detailed view of capabilities and features assigned to this role.
            </DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-6 py-4">
              {ROLE_PERMISSIONS[selectedRole].map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground border-b border-border/60 pb-1 uppercase tracking-wide text-primary">
                    {group.category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground py-0.5">
                        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
