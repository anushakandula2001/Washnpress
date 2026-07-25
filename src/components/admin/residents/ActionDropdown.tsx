"use client";

import {
  MoreHorizontal,
  Eye,
  Pencil,
  ShoppingBag,
  Wallet,
  Crown,
  Bell,
  UserX,
  Trash2,
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
  onOrders,
  onWallet,
  onSubscription,
  onNotifications,
  onDeactivate,
  onDelete,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onOrders?: () => void;
  onWallet?: () => void;
  onSubscription?: () => void;
  onNotifications?: () => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuItem onClick={onView}><Eye className="h-4 w-4" /> Open Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={onOrders}><ShoppingBag className="h-4 w-4" /> Orders</DropdownMenuItem>
        <DropdownMenuItem onClick={onWallet}><Wallet className="h-4 w-4" /> Wallet</DropdownMenuItem>
        <DropdownMenuItem onClick={onSubscription}><Crown className="h-4 w-4" /> Subscription</DropdownMenuItem>
        <DropdownMenuItem onClick={onNotifications}><Bell className="h-4 w-4" /> Notifications</DropdownMenuItem>
        <DropdownMenuItem onClick={onDeactivate} destructive><UserX className="h-4 w-4" /> Deactivate</DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} destructive><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
