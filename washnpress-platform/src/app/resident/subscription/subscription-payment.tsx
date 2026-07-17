"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentCard } from "./components/payment-card";
import { useSubscription } from "./subscription-provider";

export function SubscriptionPayment() {
  const { paymentMethods } = useSubscription();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Methods</CardTitle>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {paymentMethods.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payment methods on file.</p>
        ) : (
          paymentMethods.map((method) => (
            <PaymentCard
              key={method.id}
              brand={method.brand}
              last4={method.last4}
              expiry={method.expiry}
              isDefault={method.isDefault}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
