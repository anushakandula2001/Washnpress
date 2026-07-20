"use client";

import { OperationsQueuePage } from "@/components/portal/operations-queue-page";

export default function Page() {
  return (
    <OperationsQueuePage
      title="Ironing Queue"
      description="Orders in ironing. Complete to send to QC."
      stageLabel="Ironing"
      filterStatuses={["Iron"]}
      nextByStatus={{
        Iron: { status: "QC Hold", label: "Complete Ironing" },
      }}
    />
  );
}
