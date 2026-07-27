"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminNav } from "@/lib/portal-nav";

type Ticket = {
  id: string;
  ticket_code: string;
  category: string;
  status: string;
  priority: string;
  description: string;
  resident_name: string | null;
  resident_phone: string | null;
  resident_uuid: string | null;
  assignee_name: string | null;
  assignee_user_id: string | null;
  created_at: string;
};

type Operator = {
  id: string;
  user_id: string;
  full_name: string;
  operator_code: string | null;
};

type Message = {
  id: string;
  body: string;
  created_at: string;
  sender_name?: string;
};

const STATUSES = ["open", "in_progress", "resolved", "closed"];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    const res = await fetch("/api/admin/support", { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed");
    setTickets((data.tickets as Ticket[]) ?? []);
  }, []);

  const loadOperators = useCallback(async () => {
    const res = await fetch("/api/admin/operators", { credentials: "same-origin" });
    const data = await res.json();
    if (res.ok) setOperators((data.operators as Operator[]) ?? []);
  }, []);

  const loadMessages = useCallback(async (ticketId: string) => {
    const res = await fetch(`/api/admin/support?ticketId=${ticketId}`, { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed");
    setMessages((data.messages as Message[]) ?? []);
    if (Array.isArray(data.tickets)) setTickets(data.tickets as Ticket[]);
  }, []);

  useEffect(() => {
    void Promise.all([loadTickets(), loadOperators()]).catch((err) =>
      setError(err instanceof Error ? err.message : "Load failed"),
    );
  }, [loadTickets, loadOperators]);

  useEffect(() => {
    if (selectedId) void loadMessages(selectedId).catch(() => null);
    else setMessages([]);
  }, [selectedId, loadMessages]);

  async function patch(body: Record<string, unknown>) {
    setMsg(null);
    setError(null);
    const res = await fetch("/api/admin/support", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Update failed");
    setMsg("Ticket updated.");
    if (body.reply) setReply("");
    await loadTickets();
    if (selectedId) await loadMessages(selectedId);
  }

  const open = tickets.filter((t) => t.status === "open").length;
  const pending = tickets.filter((t) => t.status === "in_progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
  const selected = tickets.find((t) => t.id === selectedId);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Support Tickets"
      subtitle="Assign, update status, and reply to tickets"
    >
      {msg && <p className="mb-3 text-sm text-primary">{msg}</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="mt-1 text-2xl font-bold">{open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">In progress</p>
            <p className="mt-1 text-2xl font-bold">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Resolved</p>
            <p className="mt-1 text-2xl font-bold">{resolved}</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tickets</CardTitle>
            <CardDescription>{tickets.length} total</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] space-y-2 overflow-y-auto">
            {tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                  selectedId === t.id ? "border-primary bg-muted/40" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{t.ticket_code} · {t.category}</p>
                  <div className="flex gap-2">
                    <Badge>{t.status}</Badge>
                    <Badge variant="secondary">{t.priority}</Badge>
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-muted-foreground">{t.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.resident_name ?? "—"} · {t.assignee_name ?? "Unassigned"}
                </p>
              </button>
            ))}
            {tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket detail</CardTitle>
            <CardDescription>{selected ? selected.ticket_code : "Select a ticket"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
                {selected.resident_uuid && (
                  <p className="text-sm">
                    Resident:{" "}
                    <Link href={`/admin/residents/${selected.resident_uuid}`} className="text-primary hover:underline">
                      {selected.resident_name}
                    </Link>
                  </p>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-sm">
                    Status
                    <select
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={selected.status}
                      onChange={(e) =>
                        void patch({ ticketId: selected.id, status: e.target.value }).catch((err) =>
                          setError(err instanceof Error ? err.message : "Failed"),
                        )
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    Assign to
                    <select
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={selected.assignee_user_id ?? ""}
                      onChange={(e) =>
                        void patch({
                          ticketId: selected.id,
                          assignedToUserId: e.target.value || null,
                        }).catch((err) => setError(err instanceof Error ? err.message : "Failed"))
                      }
                    >
                      <option value="">Unassigned</option>
                      {operators.map((o) => (
                        <option key={o.user_id} value={o.user_id}>
                          {o.operator_code ?? o.id.slice(0, 6)} · {o.full_name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border p-3 text-sm">
                  {messages.map((m) => (
                    <div key={m.id}>
                      <p className="text-xs text-muted-foreground">
                        {m.sender_name ?? "Staff"} · {new Date(m.created_at).toLocaleString()}
                      </p>
                      <p>{m.body}</p>
                    </div>
                  ))}
                  {messages.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
                </div>

                <div className="flex gap-2">
                  <Input placeholder="Reply to resident…" value={reply} onChange={(e) => setReply(e.target.value)} />
                  <Button
                    disabled={!reply.trim()}
                    onClick={() =>
                      void patch({ ticketId: selected.id, reply: reply.trim() }).catch((err) =>
                        setError(err instanceof Error ? err.message : "Failed"),
                      )
                    }
                  >
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a ticket from the list to manage it.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
