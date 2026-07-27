"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ImpactPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/resident/dashboard");
  }, [router]);

  return null;
}
