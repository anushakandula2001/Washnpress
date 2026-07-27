"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddonsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/resident/pickup");
  }, [router]);

  return null;
}
