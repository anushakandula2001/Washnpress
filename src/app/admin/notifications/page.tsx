"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminNav } from "@/lib/portal-nav";

type Society = { id: string; name: string };

type Broadcast = {
  id: string;
  title: string;
  body: string;
  type: string;
  audience: string;
  society_name: string | null;
  creator_name: string | null;
  created_at: string;
};

const TYPES = ["system", "maintenance", "offer", "subscription", "order", "emergency"] as const;
const AUDIENCES = ["all_residents", "society", "operator", "resident"] as const;

export default function AdminNotificationsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "system" as (typeof TYPES)[number],
    audience: "all_residents" as (typeof AUDIENCES)[number],
    societyId: "",
    residentId: "",
    operatorUserId: "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [bRes, sRes] = await Promise.all([
      fetch("/api/admin/notifications", { credentials: "same-origin" }),
      fetch("/api/admin/societies", { credentials: "same-origin" }),
    ]);
    const bData = await bRes.json();
    const sData = await sRes.json();
    if (!bRes.ok) throw new Error(bData.message ?? "Failed to load broadcasts");
    setBroadcasts((bData.broadcasts as Broadcast[]) ?? []);
    if (sRes.ok) setSocieties((sData.societies as Society[]) ?? []);
  }, []);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  async function send() {
    setMsg(null);
    setError(null);
    const payload: Record<string, string> = {
      title: form.title,
      body: form.body,
      type: form.type,
      audience: form.audience,
    };
    if (form.societyId) payload.societyId = form.societyId;
    if (form.residentId) payload.residentId = form.residentId;
    if (form.operatorUserId) payload.operatorUserId = form.operatorUserId;

    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Send failed");
    setMsg("Broadcast sent.");
    setForm({ title: "", body: "", type: "system", audience: "all_residents", societyId: "", residentId: "", operatorUserId: "" });
    await load();
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Notifications"
      subtitle="Broadcast messages to residents, societies, or operators"
    >
      {msg && <p className="mb-3 text-sm text-primary">{msg}</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New broadcast</CardTitle>
            <CardDescription>Target audience and optional scope IDs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Message body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-sm">
                Type
                <select
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as (typeof TYPES)[number] })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Audience
                <select
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value as (typeof AUDIENCES)[number] })}
                >
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="text-sm">
                Society (optional)
                <select
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.societyId}
                  onChange={(e) => setForm({ ...form, societyId: e.target.value })}
                >
                  <option value="">—</option>
                  {societies.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <Input placeholder="Resident ID (optional)" value={form.residentId} onChange={(e) => setForm({ ...form, residentId: e.target.value })} />
              <Input placeholder="Operator user ID (optional)" value={form.operatorUserId} onChange={(e) => setForm({ ...form, operatorUserId: e.target.value })} />
            </div>
            <Button onClick={() => void send().catch((e) => setError(e instanceof Error ? e.message : "Failed"))}>
              Send broadcast
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Past broadcasts</CardTitle>
            <CardDescription>{broadcasts.length} messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {broadcasts.map((b) => (
              <div key={b.id} className="rounded-xl border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{b.title}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{b.type}</Badge>
                    <Badge>{b.audience}</Badge>
                  </div>
                </div>
                <p className="mt-1 text-muted-foreground">{b.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {b.society_name ? `${b.society_name} · ` : ""}
                  By {b.creator_name ?? "Admin"} · {new Date(b.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            {broadcasts.length === 0 && <p className="text-muted-foreground">No broadcasts yet.</p>}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
