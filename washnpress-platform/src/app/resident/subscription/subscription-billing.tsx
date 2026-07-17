"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingItem } from "./components/billing-item";
import { useSubscription } from "./subscription-provider";

export function SubscriptionBilling() {
  const { billingHistory } = useSubscription();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {billingHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          billingHistory.map((invoice) => (
            <BillingItem
              key={invoice.id}
              month={invoice.month}
              date={invoice.date}
              amount={invoice.amount}
              status={invoice.status}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
