"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrackOrderPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/resident/orders");
  }, [router]);

  return null;
}
