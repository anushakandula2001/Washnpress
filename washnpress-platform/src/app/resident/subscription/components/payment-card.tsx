"use client";

import { CreditCard, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface PaymentCardProps {
  brand: string;
  last4: string;
  expiry: string;
  isDefault?: boolean;
  className?: string;
}

export function PaymentCard({
  brand,
  last4,
  expiry,
  isDefault = false,
  className,
}: PaymentCardProps) {
  return (
    <Card
      className={cn(
        "border-border/50 transition-all duration-200 hover:shadow-md",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-semibold">{brand}</h3>

              <p className="text-sm text-muted-foreground">
                •••• {last4}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Expires {expiry}
              </p>
            </div>
          </div>

          {isDefault && (
            <Badge className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Default
            </Badge>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1">
            Edit
          </Button>

          <Button variant="ghost" className="flex-1">
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}