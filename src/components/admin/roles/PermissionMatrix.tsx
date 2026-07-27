"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PERMISSION_MATRIX, PLATFORM_ROLES, ROLE_META, type PlatformRole } from "./types";

function Cell({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Allowed" />
  ) : (
    <X className="mx-auto h-4 w-4 text-muted-foreground/40" aria-label="Not allowed" />
  );
}

export function PermissionMatrix({ highlightRole }: { highlightRole?: PlatformRole }) {
  const categories = [...new Set(PERMISSION_MATRIX.map((p) => p.category))];

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Feature</th>
            <th className="px-4 py-3">Category</th>
            {PLATFORM_ROLES.map((role) => (
              <th
                key={role}
                className={cn(
                  "px-4 py-3 text-center",
                  highlightRole === role && "bg-primary/5 text-primary",
                )}
              >
                {ROLE_META[role].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) =>
            PERMISSION_MATRIX.filter((p) => p.category === category).map((feature) => (
              <tr key={feature.id} className="border-b border-border/60">
                <td className="px-4 py-2.5 font-medium">{feature.label}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{feature.category}</td>
                {PLATFORM_ROLES.map((role) => (
                  <td
                    key={role}
                    className={cn(
                      "px-4 py-2.5 text-center",
                      highlightRole === role && "bg-primary/5",
                    )}
                  >
                    <Cell allowed={feature[role]} />
                  </td>
                ))}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
