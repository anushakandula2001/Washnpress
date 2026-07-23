"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProcessingCenterPage } from "@/components/portal/processing-center-page";

function ProcessingCenterContent() {
  const searchParams = useSearchParams();
  const stage = searchParams.get("stage") ?? undefined;
  return <ProcessingCenterPage initialStage={stage} />;
}

export default function Page() {
  return (
    <Suspense fallback={<ProcessingCenterPage />}>
      <ProcessingCenterContent />
    </Suspense>
  );
}
