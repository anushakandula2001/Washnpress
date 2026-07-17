"use client";

import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supportTickets } from "@/lib/experience-data";

const categories = ["Pickup Issue", "Quality Concern", "Billing", "Delivery", "Other"];

export default function SupportPage() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState(supportTickets);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !description.trim()) return;

    const newTicket = {
      id: `SUP-${300 + tickets.length}`,
      issue: description,
      status: "In Progress" as const,
      slaHours: 6,
    };
    setTickets([newTicket, ...tickets]);
    setSubmitted(true);
    setCategory("");
    setDescription("");
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
            {submitted ? (
              <div className="rounded-xl bg-emerald-500/10 p-6 text-center">
                <p className="font-semibold text-emerald-700">Ticket Submitted!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We&apos;ll get back to you within 6 hours.
                </p>
                <Button className="mt-3" variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Submit Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Tell us what happened..."
                    className="mt-1"
                    required
                  />
                </label>
                <Button type="submit" className="w-full" disabled={!category || !description.trim()}>
                  Submit Ticket
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <a
                href="tel:+919876543210"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border p-4 transition hover:bg-muted"
              >
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Call Us</span>
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border p-4 transition hover:bg-muted"
              >
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{ticket.id}</p>
                    <Badge variant={ticket.status === "Resolved" ? "success" : "secondary"}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ticket.issue}</p>
                  <p className="mt-1 text-xs text-muted-foreground">SLA: {ticket.slaHours}h</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ResidentShell>
  );
}
