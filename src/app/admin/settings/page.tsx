"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

const SETTING_KEYS = ["working_hours", "otp", "notifications"] as const;

export default function AdminSettingsPage() {
  const [texts, setTexts] = useState<Record<string, string>>({
    working_hours: "{}",
    otp: "{}",
    notifications: "{}",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/settings", { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed");
    const settings = (data.settings as Record<string, unknown>) ?? {};
    setTexts({
      working_hours: JSON.stringify(settings.working_hours ?? {}, null, 2),
      otp: JSON.stringify(settings.otp ?? {}, null, 2),
      notifications: JSON.stringify(settings.notifications ?? {}, null, 2),
    });
  }, []);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  async function save(key: (typeof SETTING_KEYS)[number]) {
    setMsg(null);
    setError(null);
    setSaving(key);
    try {
      let value: unknown;
      try {
        value = JSON.parse(texts[key]);
      } catch {
        throw new Error(`Invalid JSON for ${key}`);
      }
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Save failed");
      setMsg(`${key} saved.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="System Settings"
      subtitle="Platform configuration stored as JSON"
    >
      {msg && <p className="mb-3 text-sm text-primary">{msg}</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="space-y-6">
        {SETTING_KEYS.map((key) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-base">{key.replace(/_/g, " ")}</CardTitle>
              <CardDescription>Edit JSON and save with PUT /api/admin/settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
                value={texts[key]}
                onChange={(e) => setTexts({ ...texts, [key]: e.target.value })}
              />
              <Button onClick={() => void save(key)} disabled={saving === key}>
                {saving === key ? "Saving…" : "Save"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
