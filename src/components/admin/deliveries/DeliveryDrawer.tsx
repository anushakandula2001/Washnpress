"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  CalendarClock,
  Clock,
  FileImage,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { Sheet, SheetBody, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { useToast } from "@/components/ui/toast";
import type { DeliveryRow } from "./types";

const TABS = [
  "overview",
  "resident",
  "operator",
  "details",
  "proof",
  "timeline",
  "notes",
  "activity",
] as const;

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function OverviewTab({ row, detail }: { row: DeliveryRow; detail: Record<string, unknown> | null }) {
  const order = (detail?.order as Record<string, unknown> | undefined) ?? {};
  return (
    <Card>
      <CardContent className="p-4">
        <InfoRow label="Order Code" value={<span className="font-mono text-primary">{row.order_code}</span>} />
        <InfoRow label="Status" value={<DeliveryStatusBadge status={row.status} />} />
        <InfoRow label="Garments" value={`${row.pickup_garment_count}${row.delivered_garment_count != null ? ` delivered (${row.delivered_garment_count})` : ""}`} />
        <InfoRow label="Scheduled" value={row.scheduled_for ? new Date(row.scheduled_for).toLocaleString() : "—"} />
        <InfoRow label="Last Updated" value={row.updated_at ? new Date(row.updated_at).toLocaleString() : "—"} />
        <InfoRow label="Society" value={row.society_name} />
        <InfoRow label="Route" value={row.route_date ? `Route ${new Date(row.route_date).toLocaleDateString()} · ${row.stop_status ?? "pending"}` : "Not routed"} />
        {order.qr_batch_code ? <InfoRow label="QR Batch" value={String(order.qr_batch_code)} /> : null}
      </CardContent>
    </Card>
  );
}

function ResidentTab({ row }: { row: DeliveryRow }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{row.resident_name}</p>
            <p className="text-sm text-muted-foreground">Resident ID: {row.resident_id.slice(0, 8)}…</p>
          </div>
        </div>
        <InfoRow label="Phone" value={<span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />+91 {row.phone}</span>} />
        {row.email ? <InfoRow label="Email" value={row.email} /> : null}
        <InfoRow label="Society" value={row.society_name} />
        <InfoRow label="Unit" value={[row.tower_block, row.unit_number].filter(Boolean).join(" · ") || "—"} />
        <Link
          href={`/admin/residents?id=${row.resident_id}`}
          className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
        >
          Open Resident Profile
        </Link>
      </CardContent>
    </Card>
  );
}

function OperatorTab({ row, detail }: { row: DeliveryRow; detail: Record<string, unknown> | null }) {
  const operators = (detail?.operators as Array<Record<string, unknown>>) ?? [];
  const assigned = operators.find((o) => o.id === row.operator_id) ?? operators[0];

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {row.operator_name || assigned ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">{row.operator_name ?? String(assigned?.full_name ?? "—")}</p>
                <p className="text-sm text-muted-foreground">{row.operator_code ?? String(assigned?.operator_code ?? "—")}</p>
              </div>
            </div>
            <InfoRow label="Phone" value={row.operator_phone ?? String(assigned?.phone ?? "—")} />
            <InfoRow label="Route Date" value={row.route_date ? new Date(row.route_date).toLocaleDateString() : "—"} />
            <InfoRow label="Stop Status" value={row.stop_status ?? "—"} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No operator assigned yet.</p>
        )}
        {operators.length > 1 && (
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Society Operators</p>
            <ul className="space-y-1 text-sm">
              {operators.map((o) => (
                <li key={String(o.id)}>
                  {String(o.operator_code ?? "")} · {String(o.full_name)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailsTab({ row, detail }: { row: DeliveryRow; detail: Record<string, unknown> | null }) {
  const order = (detail?.order as Record<string, unknown> | undefined) ?? {};
  return (
    <Card>
      <CardContent className="p-4">
        <InfoRow label="Pickup Scheduled" value={row.scheduled_for ? new Date(row.scheduled_for).toLocaleString() : "—"} />
        <InfoRow label="Society City" value={row.society_city ?? "—"} />
        <InfoRow label="Pickup Garments" value={row.pickup_garment_count} />
        <InfoRow label="Delivered Garments" value={String(row.delivered_garment_count ?? order.delivered_garment_count ?? "—")} />
        <InfoRow label="QC Status" value={String(order.qc_status ?? "—")} />
        {order.qc_reason ? <InfoRow label="QC Reason" value={String(order.qc_reason)} /> : null}
        {row.special_instructions ? (
          <div className="mt-3 rounded-lg bg-muted/40 p-3 text-sm">
            <p className="mb-1 font-medium">Special Instructions</p>
            <p className="text-muted-foreground">{row.special_instructions}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ProofTab({ row, detail }: { row: DeliveryRow; detail: Record<string, unknown> | null }) {
  const events = (detail?.events as Array<Record<string, unknown>>) ?? [];
  const deliveryEvents = events.filter((e) => {
    const t = String(e.event_type ?? "").toLowerCase();
    return t.includes("deliver") || t.includes("proof") || t.includes("signature") || t.includes("otp");
  });

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileImage className="h-4 w-4 text-primary" />
          Proof of Delivery
        </div>
        {row.status.toLowerCase() === "delivered" ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="font-medium text-emerald-700 dark:text-emerald-300">Delivery confirmed</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {row.delivered_garment_count ?? row.pickup_garment_count} garments delivered
              {row.updated_at ? ` on ${new Date(row.updated_at).toLocaleString()}` : ""}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No proof captured yet — order not delivered.</p>
        )}
        {deliveryEvents.length > 0 && (
          <ul className="space-y-2 text-sm">
            {deliveryEvents.map((e) => (
              <li key={String(e.id)} className="rounded-lg border border-border p-3">
                <p className="font-medium capitalize">{String(e.event_type).replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground">{new Date(String(e.created_at)).toLocaleString()}</p>
                {e.event_payload ? (
                  <pre className="mt-2 overflow-x-auto rounded bg-muted/40 p-2 text-xs">
                    {JSON.stringify(e.event_payload, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function TimelineTab({ detail }: { detail: Record<string, unknown> | null }) {
  const events = (detail?.events as Array<Record<string, unknown>>) ?? [];
  return (
    <div className="relative space-y-0 pl-6">
      <div className="absolute bottom-0 left-[11px] top-0 w-px bg-border" />
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No timeline events recorded.</p>
      ) : (
        events.map((e, i) => (
          <div key={String(e.id ?? i)} className="relative pb-6">
            <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card">
              <Clock className="h-3 w-3 text-primary" />
            </div>
            <p className="text-sm font-medium capitalize">{String(e.event_type).replace(/_/g, " ")}</p>
            <p className="text-xs text-muted-foreground">{new Date(String(e.created_at)).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
}

function NotesTab({
  orderId,
  detail,
  onRefresh,
}: {
  orderId: string;
  detail: Record<string, unknown> | null;
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const events = (detail?.events as Array<Record<string, unknown>>) ?? [];
  const notes = events.filter((e) => e.event_type === "admin_note");

  async function saveNote() {
    if (!note.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/deliveries", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, note: note.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Save failed");
      toast("Note saved", "success");
      setNote("");
      onRefresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Add an internal admin note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button size="sm" onClick={() => void saveNote()} disabled={saving || !note.trim()}>
          {saving ? "Saving…" : "Save Note"}
        </Button>
      </div>
      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n, i) => {
            const payload = n.event_payload as { note?: string } | undefined;
            return (
              <li key={String(n.id ?? i)} className="rounded-lg border border-border p-3 text-sm">
                <p>{payload?.note ?? "—"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(String(n.created_at)).toLocaleString()}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ActivityTab({ row, detail }: { row: DeliveryRow; detail: Record<string, unknown> | null }) {
  const events = (detail?.events as Array<Record<string, unknown>>) ?? [];
  const items: Array<{ label: string; at: string; detail: string }> = [
    ...(row.created_at ? [{ label: "Order Created", at: row.created_at, detail: `Order ${row.order_code} created` }] : []),
    ...(row.scheduled_for ? [{ label: "Pickup Scheduled", at: row.scheduled_for, detail: `Scheduled for ${row.society_name}` }] : []),
    {
      label: "Operator",
      at: row.updated_at || row.created_at || new Date().toISOString(),
      detail: row.operator_name ? `Assigned to ${row.operator_name}` : "Awaiting operator assignment",
    },
    ...events.slice(-5).map((e) => ({
      label: String(e.event_type).replace(/_/g, " "),
      at: String(e.created_at),
      detail: "System event",
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </h4>
        <ul className="space-y-3">
          {items.map((e, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-3 w-3 text-primary" />
              </div>
              <div>
                <p className="font-medium capitalize">{e.label}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.at).toLocaleString()} · {e.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {row.society_name}
        {row.society_city ? ` · ${row.society_city}` : ""}
      </div>
    </div>
  );
}

export function DeliveryDrawer({
  delivery,
  open,
  onOpenChange,
  initialTab = "overview",
  onAssign,
  onReschedule,
}: {
  delivery: DeliveryRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
  onAssign?: (delivery: DeliveryRow) => void;
  onReschedule?: (delivery: DeliveryRow) => void;
}) {
  const [tab, setTab] = React.useState(initialTab);
  const [detail, setDetail] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadDetail = React.useCallback(() => {
    if (!delivery?.order_code) return;
    setLoading(true);
    setError(null);
    void fetch(`/api/admin/orders?orderCode=${delivery.order_code}`, { credentials: "same-origin" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Failed");
        setDetail(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"))
      .finally(() => setLoading(false));
  }, [delivery?.order_code]);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab, delivery?.id]);

  React.useEffect(() => {
    if (!open || !delivery) return;
    loadDetail();
  }, [open, delivery, loadDetail]);

  const tabLabel: Record<string, string> = {
    overview: "Overview",
    resident: "Resident",
    operator: "Operator",
    details: "Delivery Details",
    proof: "Proof of Delivery",
    timeline: "Timeline",
    notes: "Notes",
    activity: "Activity",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent width="560px">
        {loading && (
          <div className="flex h-full flex-col p-6">
            <Skeleton className="mb-4 h-16 w-full" />
            <Skeleton className="mb-2 h-8 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
        {error && <div className="p-6 text-sm text-destructive">{error}</div>}
        {!loading && !error && delivery && (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-mono text-lg font-semibold text-primary">{delivery.order_code}</h2>
                  <p className="text-sm text-muted-foreground">{delivery.resident_name} · {delivery.society_name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <DeliveryStatusBadge status={delivery.status} />
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
                      <CalendarClock className="h-3 w-3" />
                      {delivery.scheduled_for ? new Date(delivery.scheduled_for).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={() => onAssign?.(delivery)}>
                    Assign
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onReschedule?.(delivery)}>
                    Reschedule
                  </Button>
                </div>
              </div>
            </SheetHeader>
            <SheetBody className="pt-0">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-2 flex h-auto flex-wrap gap-1">
                  {TABS.map((t) => (
                    <TabsTrigger key={t} value={t} className="text-xs">
                      {tabLabel[t] ?? t}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="overview">
                  <OverviewTab row={delivery} detail={detail} />
                </TabsContent>
                <TabsContent value="resident">
                  <ResidentTab row={delivery} />
                </TabsContent>
                <TabsContent value="operator">
                  <OperatorTab row={delivery} detail={detail} />
                </TabsContent>
                <TabsContent value="details">
                  <DetailsTab row={delivery} detail={detail} />
                </TabsContent>
                <TabsContent value="proof">
                  <ProofTab row={delivery} detail={detail} />
                </TabsContent>
                <TabsContent value="timeline">
                  <TimelineTab detail={detail} />
                </TabsContent>
                <TabsContent value="notes">
                  <NotesTab orderId={delivery.id} detail={detail} onRefresh={loadDetail} />
                </TabsContent>
                <TabsContent value="activity">
                  <ActivityTab row={delivery} detail={detail} />
                </TabsContent>
              </Tabs>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
