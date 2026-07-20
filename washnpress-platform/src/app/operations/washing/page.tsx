"use client";

import { OperationsQueuePage } from "@/components/portal/operations-queue-page";

export default function Page() {
  return (
    <OperationsQueuePage
      title="Washing Queue"
      description="Orders currently in wash. Complete washing to move into drying."
      stageLabel="Washing"
      filterStatuses={["Picked Up", "In Wash"]}
      nextByStatus={{
        "Picked Up": { status: "In Wash", label: "Start Washing" },
        "In Wash": { status: "Dry", label: "Complete Washing" },
      }}
    />
  );
}
