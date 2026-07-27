"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Gift } from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { AddMoneyModal } from "@/components/resident/add-money-modal";
import { useResident } from "@/components/resident/resident-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WalletPage() {
  const { balance, transactions } = useResident();
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);

  return (
    <ResidentShell greeting="Wallet" subtitle="Manage your balance and transactions">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-primary text-primary-foreground lg:col-span-1">
          <CardContent className="p-6">
            <p className="text-sm opacity-80">Available Balance</p>
            <p className="mt-1 text-3xl font-bold">₹{balance.toFixed(2)}</p>
            <Button
              className="mt-4 bg-white text-primary hover:bg-white/90"
              onClick={() => setAddMoneyOpen(true)}
            >
              Add Money
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden lg:col-span-2">
          <CardContent className="flex items-center gap-4 p-6">
            <Gift className="h-12 w-12 text-primary" />
            <div>
              <p className="font-bold">Refer & Earn ₹100</p>
              <p className="text-sm text-muted-foreground">
                Share your referral code with friends. You both get ₹100 when they subscribe.
              </p>
              <p className="mt-2 rounded-lg bg-muted px-3 py-1.5 font-mono text-sm font-semibold text-primary">
                ANANYA100
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex items-center justify-between rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    txn.type === "credit"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {txn.type === "credit" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">{txn.date}</p>
                </div>
              </div>
              <span
                className={`font-semibold ${
                  txn.type === "credit" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {txn.type === "credit" ? "+" : "-"}₹{txn.amountInr.toFixed(2)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <AddMoneyModal open={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
    </ResidentShell>
  );
}
