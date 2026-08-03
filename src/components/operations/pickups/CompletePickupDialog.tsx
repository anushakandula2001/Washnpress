import * as React from "react";
import { OrderRow } from "@/components/admin/orders/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Complete Pickup?">
        <DialogHeader>
          <DialogTitle>Complete Pickup?</DialogTitle>
          <DialogDescription>
            Are you sure you want to complete the pickup for order{" "}
            <span className="font-semibold text-foreground">{order.order_code}</span>?
            This order will move to the Processing Center and will no longer appear in Today's Pickups.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={isBusy} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              onConfirm(order);
            }} 
            disabled={isBusy}
          >
            {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Pickup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
