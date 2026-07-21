"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { StatusBadge } from "./StatusBadge";
import type { SocietyDetail } from "./types";

export function SocietySettings({
  society,
  onUpdated,
}: {
  society: SocietyDetail;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: society.name,
    addressLine1: society.address_line_1 ?? "",
    city: society.city,
    state: society.state,
    pincode: society.pincode ?? "",
    status: society.status,
  });
  const [saving, setSaving] = useState(false);

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/societies/${society.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Update failed");
      toast("Society settings saved", "success");
      onUpdated();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Society Settings</CardTitle>
        <StatusBadge status={form.status} />
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Society Name</label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Address</label>
          <Input value={form.addressLine1} onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">City</label>
          <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">State</label>
          <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Pincode</label>
          <Input value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} maxLength={6} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            className={selectClass}
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="active">Active</option>
            <option value="coming_soon">Coming Soon</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
