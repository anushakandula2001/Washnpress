"use client";

import { EmptyState } from "@/components/admin/shared/EmptyState";
import { Image } from "lucide-react";

export function PickupPhotos() {
  return (
    <EmptyState
      icon={Image}
      title="No photos uploaded"
      description="Pickup proof photos will appear here once executives capture them at the doorstep."
    />
  );
}
