"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResident } from "@/components/resident/resident-provider";

const PRESET_AMOUNTS = [100, 250, 500, 1000];

export function AddMoneyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addMoney } = useResident();
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  if (!open) return null;

  const finalAmount = selected ?? (parseInt(amount, 10) || 0);

  function handleAdd() {
    if (finalAmount > 0) {
      addMoney(finalAmount);
      setAmount("");
      setSelected(null);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Money to Wallet</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="mb-4 grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelected(amt); setAmount(""); }}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                selected === amt
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>
        <label className="mb-4 block text-sm">
          <span className="text-muted-foreground">Custom Amount (₹)</span>
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setSelected(null); }}
            placeholder="Enter amount"
            className="mt-1"
          />
        </label>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleAdd} disabled={finalAmount <= 0}>
            Add ₹{finalAmount > 0 ? finalAmount : "—"}
          </Button>
        </div>
      </div>
    </div>
  );
}
