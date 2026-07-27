"use client";

import {
  MoreHorizontal,
  Eye,
  Pencil,
  UserCog,
  Clock,
  Users,
  ShoppingBag,
  PauseCircle,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ActionDropdown({
  onView,
  onEdit,
  onAssignOperator,
  onPickupSlots,
  onResidents,
  onOrders,
  onDeactivate,
  onComingSoon,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onAssignOperator?: () => void;
  onPickupSlots?: () => void;
  onResidents?: () => void;
  onOrders?: () => void;
  onDeactivate?: () => void;
  onComingSoon?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuItem onClick={onView}><Eye className="h-4 w-4" /> View Society</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={onAssignOperator}><UserCog className="h-4 w-4" /> Assign Operator</DropdownMenuItem>
        <DropdownMenuItem onClick={onPickupSlots}><Clock className="h-4 w-4" /> Pickup Slots</DropdownMenuItem>
        <DropdownMenuItem onClick={onResidents}><Users className="h-4 w-4" /> Residents</DropdownMenuItem>
        <DropdownMenuItem onClick={onOrders}><ShoppingBag className="h-4 w-4" /> Orders</DropdownMenuItem>
        <DropdownMenuItem onClick={onComingSoon}><MapPin className="h-4 w-4" /> Mark Coming Soon</DropdownMenuItem>
        <DropdownMenuItem onClick={onDeactivate} destructive><PauseCircle className="h-4 w-4" /> Deactivate</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
