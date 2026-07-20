"use client";

import { OperationsQueuePage } from "@/components/portal/operations-queue-page";

export default function Page() {
  return (
    <OperationsQueuePage
      title="Out for Delivery"
      description="Orders currently with delivery executives."
      stageLabel="Delivery"
      filterStatuses={["Out for Delivery"]}
      nextByStatus={{
        "Out for Delivery": { status: "Delivered", label: "Mark Delivered" },
      }}
    />
  );
}
