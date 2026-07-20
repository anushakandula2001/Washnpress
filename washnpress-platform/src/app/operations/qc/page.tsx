"use client";

import { OperationsQueuePage } from "@/components/portal/operations-queue-page";

export default function Page() {
  return (
    <OperationsQueuePage
      title="QC Queue"
      description="Quality check holds. Pass to ready for delivery."
      stageLabel="QC"
      filterStatuses={["QC Hold"]}
      nextByStatus={{
        "QC Hold": { status: "Out for Delivery", label: "QC Pass" },
      }}
    />
  );
}
