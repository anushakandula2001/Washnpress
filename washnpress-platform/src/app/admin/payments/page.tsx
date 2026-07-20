"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminNav } from "@/lib/portal-nav";

type OnlinePayment = {
  id: string;
  amount_inr: string | number;
  status: string;
  payment_method: string | null;
  gateway_ref: string | null;
  resident_name: string;
  phone: string;
  created_at: string;
};

type WalletTx = {
  id: string;
  type: string;
  description: string;
  amount_inr: string | number;
  wallet_balance: string | number;
  resident_name: string;
  phone: string;
  resident_id: string;
  created_at: string;
};

type Refund = {
  id: string;
  amount_inr: string | number;
  status: string;
  reason: string | null;
  resident_name: string;
  phone: string;
  order_code: string | null;
  created_at: string;
};

type Invoice = {
  id: string;
  invoice_code: string | null;
  amount_inr: string | number;
  status: string;
  billed_on: string;
  resident_name: string;
  phone: string;
};

export default function AdminPaymentsPage() {
  const [onlinePayments, setOnlinePayments] = useState<OnlinePayment[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTx[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/payments", { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed");
    setOnlinePayments((data.onlinePayments as OnlinePayment[]) ?? []);
    setWalletTransactions((data.walletTransactions as WalletTx[]) ?? []);
    setRefunds((data.refunds as Refund[]) ?? []);
    setInvoices((data.invoices as Invoice[]) ?? []);
  }, []);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  async function patchRefund(refundId: string, status: "approved" | "rejected") {
    setMsg(null);
    setError(null);
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refundId, status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Update failed");
    setMsg(`Refund ${status}.`);
    await load();
  }

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Payments"
      subtitle="Online payments, wallet ledger, refunds, and invoices"
    >
      {msg && <p className="mb-3 text-sm text-primary">{msg}</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Online Payments</CardTitle>
            <CardDescription>{onlinePayments.length} recent captures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {onlinePayments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium">{p.resident_name} · +91 {p.phone}</p>
                  <p className="text-muted-foreground">
                    {p.payment_method ?? "online"} · {p.gateway_ref ?? "—"} · {new Date(p.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge>{p.status}</Badge>
                  <p className="mt-1 font-medium">₹{Number(p.amount_inr).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
            {onlinePayments.length === 0 && <p className="text-muted-foreground">No online payments.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wallet Transactions</CardTitle>
            <CardDescription>{walletTransactions.length} ledger entries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {walletTransactions.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <Link href={`/admin/residents/${t.resident_id}`} className="font-medium text-primary hover:underline">
                    {t.resident_name}
                  </Link>
                  <p className="text-muted-foreground">
                    {t.description} · +91 {t.phone} · bal ₹{Number(t.wallet_balance).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={t.type === "credit" ? "success" : "secondary"}>{t.type}</Badge>
                  <p className="mt-1 font-medium">₹{Number(t.amount_inr).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
            {walletTransactions.length === 0 && <p className="text-muted-foreground">No wallet transactions.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Refunds</CardTitle>
            <CardDescription>Approve or reject pending refund requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {refunds.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium">
                    {r.resident_name} · {r.order_code ?? "No order"}
                  </p>
                  <p className="text-muted-foreground">
                    {r.reason ?? "—"} · +91 {r.phone} · {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{r.status}</Badge>
                  <span className="font-medium">₹{Number(r.amount_inr).toLocaleString("en-IN")}</span>
                  {r.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => void patchRefund(r.id, "approved").catch((e) => setError(e instanceof Error ? e.message : "Failed"))}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void patchRefund(r.id, "rejected").catch((e) => setError(e instanceof Error ? e.message : "Failed"))}>
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {refunds.length === 0 && <p className="text-muted-foreground">No refunds.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoices</CardTitle>
            <CardDescription>{invoices.length} billing records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium">{inv.invoice_code ?? inv.id.slice(0, 8)} · {inv.resident_name}</p>
                  <p className="text-muted-foreground">
                    +91 {inv.phone} · {new Date(inv.billed_on).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge>{inv.status}</Badge>
                  <p className="mt-1 font-medium">₹{Number(inv.amount_inr).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
            {invoices.length === 0 && <p className="text-muted-foreground">No invoices.</p>}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
