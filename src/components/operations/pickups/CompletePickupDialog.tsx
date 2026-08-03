import * as React from "react";
import { OrderRow } from "@/components/admin/orders/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface CompletePickupDialogProps {
  order: OrderRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (order: OrderRow) => void;
  isBusy?: boolean;
}

export function CompletePickupDialog({
  order,
  open,
  onOpenChange,
  onConfirm,
  isBusy
}: CompletePickupDialogProps) {
  if (!order) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Pickup?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to complete the pickup for order{" "}
            <span className="font-semibold text-foreground">{order.order_code}</span>?
            This order will move to the Processing Center and will no longer appear in Today's Pickups.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              onConfirm(order);
            }} 
            disabled={isBusy}
          >
            {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Pickup
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
