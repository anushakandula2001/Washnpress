"use client";

import {
  MoreHorizontal,
  Eye,
  Pencil,
  Building2,
  ShoppingBag,
  Users,
  Bell,
  UserX,
  ArrowRightLeft,
  BarChart3,
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
  onEdit,
  onSocieties,
  onResidents,
  onOrders,
  onPerformance,
  onNotifications,
  onAssignSociety,
  onTransfer,
  onDeactivate,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onSocieties?: () => void;
  onResidents?: () => void;
  onOrders?: () => void;
  onPerformance?: () => void;
  onNotifications?: () => void;
  onAssignSociety?: () => void;
  onTransfer?: () => void;
  onDeactivate?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuItem onClick={onView}>
          <Eye className="h-4 w-4" /> Open Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSocieties}>
          <Building2 className="h-4 w-4" /> Societies
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onResidents}>
          <Users className="h-4 w-4" /> Residents
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOrders}>
          <ShoppingBag className="h-4 w-4" /> Orders
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPerformance}>
          <BarChart3 className="h-4 w-4" /> Performance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNotifications}>
          <Bell className="h-4 w-4" /> Notifications
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAssignSociety}>
          <Building2 className="h-4 w-4" /> Assign Society
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTransfer}>
          <ArrowRightLeft className="h-4 w-4" /> Transfer Society
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDeactivate} destructive>
          <UserX className="h-4 w-4" /> Deactivate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
