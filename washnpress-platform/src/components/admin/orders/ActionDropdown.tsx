"use client";

import {
  MoreHorizontal,
  Eye,
  User,
  Truck,
  Clock,
  Package,
  StickyNote,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ActionDropdown({
  onView,
  onTimeline,
  onResident,
  onOperator,
  onItems,
  onNotes,
  onActivity,
  onAssignOperator,
}: {
  onView?: () => void;
  onTimeline?: () => void;
  onResident?: () => void;
  onOperator?: () => void;
  onItems?: () => void;
  onNotes?: () => void;
  onActivity?: () => void;
  onAssignOperator?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuItem onClick={onView}>
          <Eye className="h-4 w-4" /> View Order
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTimeline}>
          <Clock className="h-4 w-4" /> Timeline
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onResident}>
          <User className="h-4 w-4" /> Resident
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOperator}>
          <Truck className="h-4 w-4" /> Operator
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onItems}>
          <Package className="h-4 w-4" /> Items
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNotes}>
          <StickyNote className="h-4 w-4" /> Notes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onActivity}>
          <Activity className="h-4 w-4" /> Activity
        </DropdownMenuItem>
        {onAssignOperator && (
          <DropdownMenuItem onClick={onAssignOperator}>
            <Truck className="h-4 w-4" /> Assign Operator
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
