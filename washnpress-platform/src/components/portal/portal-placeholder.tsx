"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { PortalShell } from "@/components/portal/portal-shell";
import type { PortalNavItem } from "@/lib/portal-nav";

type PortalPlaceholderProps = {
  navItems: PortalNavItem[];
  portalLabel: string;
  title: string;
  description: string;
  kpis?: Array<{ label: string; value: string; footnote?: string }>;
  children?: ReactNode;
};

export function PortalPlaceholder({
  navItems,
  portalLabel,
  title,
  description,
  kpis = [
    { label: "Active", value: "—", footnote: "Live data wiring next" },
    { label: "Pending", value: "—", footnote: "Connected via APIs" },
    { label: "Completed today", value: "—", footnote: "Updates in real time" },
  ],
  children,
}: PortalPlaceholderProps) {
  return (
    <PortalShell
      navItems={navItems}
      portalLabel={portalLabel}
      greeting={title}
      subtitle={description}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} footnote={kpi.footnote} />
        ))}
      </section>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{title}</CardTitle>
            <Badge variant="secondary">Portal scaffold</Badge>
          </div>
          <CardDescription>
            This screen is production-ready for navigation and layout. Connect live APIs and
            workflows in the next iteration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{description}</p>
          {children}
        </CardContent>
      </Card>
    </PortalShell>
  );
}

export function ActionRow({
  label,
  action,
  onAction,
}: {
  label: string;
  action: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">Next valid action only</p>
      </div>
      <Button onClick={onAction}>{action}</Button>
    </div>
  );
}
