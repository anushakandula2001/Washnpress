"use client";

import {
  MoreHorizontal,
  Eye,
  Truck,
  CalendarClock,
  User,
  MapPin,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ActionDropdown({
  onView,
  onAssign,
  onReschedule,
  onResident,
  onOperator,
  onTimeline,
}: {
  onView?: () => void;
  onAssign?: () => void;
  onReschedule?: () => void;
  onResident?: () => void;
  onOperator?: () => void;
  onTimeline?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuItem onClick={onView}>
          <Eye className="h-4 w-4" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAssign}>
          <Truck className="h-4 w-4" /> Assign Operator
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onReschedule}>
          <CalendarClock className="h-4 w-4" /> Reschedule
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onResident}>
          <User className="h-4 w-4" /> Resident
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOperator}>
          <MapPin className="h-4 w-4" /> Operator
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTimeline}>
          <FileText className="h-4 w-4" /> Timeline
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
