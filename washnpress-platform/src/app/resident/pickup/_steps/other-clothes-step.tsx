"use client";

import { useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePickup } from "../hooks/use-pickup";

export function OtherClothesStep() {
  const { addCustomGarment, garments } = usePickup();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");

  const customCount = useMemo(() => {
    return Object.entries(garments).filter(([key, value]) => key.startsWith("custom-") && value > 0).length;
  }, [garments]);

  function handleAdd() {
    const parsed = Number.parseInt(qty, 10);
    if (!name.trim() || Number.isNaN(parsed) || parsed <= 0) return;
    addCustomGarment(name, parsed);
    setName("");
    setQty("1");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Add other clothes</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
          Include items like sarees, blankets, bedsheets, curtains, jackets, towels, kids wear, and other soft goods.
        </p>
      </div>

      <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.4fr_auto]">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Clothing name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Saree, blanket, curtain…" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <Input type="number" min="1" max="50" value={qty} onChange={(e) => setQty(e.target.value)} />
          </label>
          <div className="flex items-end">
            <Button type="button" onClick={handleAdd} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add item
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/5 p-3 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>{customCount > 0 ? `${customCount} custom category added to your basket` : "No custom items added yet"}</span>
        </div>
      </div>
    </div>
  );
}
