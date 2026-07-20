"use client";

import { PortalPlaceholder } from "@/components/portal/portal-placeholder";
import { operationsNav } from "@/lib/portal-nav";

export default function Page() {
  return (
    <PortalPlaceholder
      navItems={operationsNav}
      portalLabel="Operations Portal"
      title="Today's Pickups"
      description="All pickups scheduled for today across societies and branches."
    >
      <ul className="list-disc space-y-1 pl-5">
        <li>Filter by society, tower, and time window</li>
        <li>Assign executives from Pickup Assignment</li>
        <li>Mark pickup completed to enter the laundry pipeline</li>
      </ul>
    </PortalPlaceholder>
  );
}
