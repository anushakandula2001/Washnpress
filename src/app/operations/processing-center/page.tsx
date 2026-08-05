"use client";

import { OperationsShell } from "@/components/operations/OperationsShell";
import ProcessingCenterContent from "@/components/portal/processing-center-page";

export default function Page() {
  return (
    <OperationsShell>
      <ProcessingCenterContent />
    </OperationsShell>
  );
}
