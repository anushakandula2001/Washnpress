"use client";

import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BillingItemProps {
  month: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
}

export function BillingItem({
  month,
  date,
  amount,
  status,
}: BillingItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-muted/40">
      <div className="space-y-1">
        <h4 className="font-semibold">{month}</h4>

        <p className="text-xs text-muted-foreground">
          {date}
        </p>
      </div>

      <div className="text-right space-y-2">
        <Badge>{status}</Badge>

        <p className="font-semibold">
          ₹{amount}
        </p>

        <Button variant="ghost" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Invoice
        </Button>
      </div>
    </div>
  );
}