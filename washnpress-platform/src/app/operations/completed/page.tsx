"use client";

import { PortalPlaceholder } from "@/components/portal/portal-placeholder";
import { operationsNav } from "@/lib/portal-nav";

export default function Page() {
  return (
    <PortalPlaceholder
      navItems={operationsNav}
      portalLabel="Operations Portal"
      title="Completed Orders"
      description="Successfully delivered orders for audit and payout reconciliation."
    >
      
    </PortalPlaceholder>
  );
}
