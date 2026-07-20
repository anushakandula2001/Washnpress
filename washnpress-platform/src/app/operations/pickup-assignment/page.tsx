"use client";

import { PortalPlaceholder } from "@/components/portal/portal-placeholder";
import { operationsNav } from "@/lib/portal-nav";

export default function Page() {
  return (
    <PortalPlaceholder
      navItems={operationsNav}
      portalLabel="Operations Portal"
      title="Pickup Assignment"
      description="Assign field executives to pickup slots and routes."
    >
      <p>Assign executive → route generated → resident notified. Status updates sync to the Resident Portal timeline.</p>
    </PortalPlaceholder>
  );
}
