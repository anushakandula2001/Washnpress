"use client";

import { Shield, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PERMISSIONS = [
  { key: "orders", label: "Manage Orders", description: "View and update order status in assigned societies" },
  { key: "pickups", label: "Manage Pickups", description: "Schedule and confirm pickup slots" },
  { key: "residents", label: "View Residents", description: "Access resident profiles in assigned societies" },
  { key: "qc", label: "Quality Control", description: "Submit QC pass/fail on garments" },
  { key: "delivery", label: "Delivery Handoff", description: "Mark deliveries complete" },
  { key: "notifications", label: "Send Notifications", description: "Notify residents in assigned societies" },
];

export function PermissionsCard({ status }: { status?: string }) {
  const active = status === "active";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4 text-primary" />
          Operator Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {PERMISSIONS.map((p) => (
          <div
            key={p.key}
            className="flex items-start gap-3 rounded-lg border border-border/60 px-3 py-2 text-sm"
          >
            {active ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </div>
          </div>
        ))}
        {!active && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Permissions are suspended while operator is inactive.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
