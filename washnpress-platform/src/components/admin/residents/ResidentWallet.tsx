"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ResidentWallet({
  data,
  onRefresh,
}: {
  data: Record<string, unknown>;
  residentId?: string;
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const r = data.resident as Record<string, unknown>;
  const walletTx = (data.walletTx as Array<Record<string, unknown>>) ?? [];
  const balance = Number(r.wallet_balance ?? 0);

  async function adjust(type: "add" | "deduct") {
    const amount = prompt(type === "add" ? "Amount to add (₹)" : "Amount to deduct (₹)");
    if (!amount || isNaN(Number(amount))) return;
    toast(`${type === "add" ? "Add" : "Deduct"} money: use Wallet Transactions admin page for ledger entries`, "info");
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs text-muted-foreground">Wallet Balance</p>
          <p className="text-2xl font-bold text-primary">₹{balance.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Reward Points</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => void adjust("add")}>Add Money</Button>
        <Button size="sm" variant="outline" onClick={() => void adjust("deduct")}>Deduct Money</Button>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Transactions</h4>
        <div className="space-y-2">
          {walletTx.map((t, i) => (
            <div key={i} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span>{String(t.description ?? t.type)}</span>
              <span className={Number(t.amount_inr) >= 0 ? "text-emerald-600" : "text-red-500"}>
                {Number(t.amount_inr) >= 0 ? "+" : ""}₹{Number(t.amount_inr).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
          {walletTx.length === 0 && <p className="text-sm text-muted-foreground">No transactions</p>}
        </div>
      </div>
    </div>
  );
}
