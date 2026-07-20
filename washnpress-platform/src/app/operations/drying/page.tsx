"use client";

import { OperationsQueuePage } from "@/components/portal/operations-queue-page";

export default function Page() {
  return (
    <OperationsQueuePage
      title="Drying Queue"
      description="Orders in drying. Complete to move into ironing."
      stageLabel="Drying"
      filterStatuses={["Dry"]}
      nextByStatus={{
        Dry: { status: "Iron", label: "Complete Drying" },
      }}
    />
  );
}
