"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/frontend/api-client";

const categories = ["Pickup Issue", "Quality Concern", "Billing", "Delivery", "Other"];

type Ticket = {
  id: string;
  issue: string;
  status: string;
  slaHours?: number;
};

export default function SupportPage() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadTickets() {
    setLoading(true);
    try {
      const data = await api.support.list();
      setTickets(
        data.tickets.map((t) => ({
          id: String(t.id ?? t.ticket_code ?? ""),
          issue: String(t.description ?? t.issue ?? ""),
          status: String(t.status ?? "open"),
          slaHours: typeof t.sla_hours === "number" ? t.sla_hours : 6,
        })),
      );
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTickets();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const resolvedDescription = category === "Other"
      ? `${description.trim()} ${customReason.trim()}`.trim()
      : description.trim();

    if (!category || resolvedDescription.length < 10) {
      setError("Select a category and describe your issue in at least 10 characters.");
      return;
    }
    setError(null);
    try {
      await api.support.create({ category, description: resolvedDescription });
      setSubmitted(true);
      setCategory("");
      setDescription("");
      setCustomReason("");
      await loadTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    }
  }

  return (
    <ResidentShell greeting="Support" subtitle="We're here to help 24/7">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
            <CardDescription>Describe your issue and we&apos;ll respond within 6 hours</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {submitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="mt-4 font-semibold text-emerald-700">Ticket submitted successfully</p>
                <p className="mt-2 text-sm text-muted-foreground">A care specialist will reply shortly. You can continue the chat while waiting.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button className="gap-1" variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    <Sparkles className="h-4 w-4" /> Open another ticket
                  </Button>
                  <Button className="gap-1" size="sm">
                    <MessageCircle className="h-4 w-4" /> Continue chat
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                          category === cat
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block text-sm">
                  <span className="text-muted-foreground">Describe your issue</span>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    placeholder="Minimum 10 characters"
                  />
                </label>
                {category === "Other" && (
                  <label className="block text-sm">
                    <span className="text-muted-foreground">Tell us more</span>
                    <Input
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="mt-1"
                      placeholder="Share the specific issue"
                    />
                  </label>
                )}
                <Button type="submit">Submit Ticket</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Tickets</CardTitle>
            <CardDescription>Recent support requests from your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets yet.</p>
            ) : (
              tickets.map((t) => (
                <div key={t.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{t.issue}</p>
                    <Badge variant="secondary">{t.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">#{t.id}</p>
                </div>
              ))
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="gap-1">
                <MessageCircle className="h-3.5 w-3.5" /> Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResidentShell>
  );
}
