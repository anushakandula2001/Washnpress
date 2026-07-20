"use client";

import { OperationsQueuePage } from "@/components/portal/operations-queue-page";

export default function Page() {
  return (
    <OperationsQueuePage
      title="Packing Queue"
      description="Orders cleared by QC and ready to pack for delivery."
      stageLabel="Packing"
      filterStatuses={["QC Hold"]}
      nextByStatus={{
        "QC Hold": { status: "Out for Delivery", label: "Mark Packed" },
      }}
    />
  );
}
