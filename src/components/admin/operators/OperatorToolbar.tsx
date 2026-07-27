"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OperatorToolbar({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="mb-4 flex justify-end">
      <Button
        size="sm"
        className="gap-1.5 bg-primary hover:bg-primary/90"
        onClick={onCreate}
      >
        <Plus className="h-4 w-4" />
        Create Operator
      </Button>
    </div>
  );
}