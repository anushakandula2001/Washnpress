"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export function PickupNotes({
  pickupId,
  instructions,
  onSaved,
}: {
  pickupId: string;
  instructions: string | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [note, setNote] = useState(instructions ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNote(instructions ?? "");
  }, [instructions, pickupId]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pickups", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickupId, specialInstructions: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Save failed");
      toast("Notes saved", "success");
      onSaved();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pickup Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Add instructions or internal notes for this pickup…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving…" : "Save Notes"}
        </Button>
      </CardContent>
    </Card>
  );
}
