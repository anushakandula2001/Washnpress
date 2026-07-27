"use client";

import { useState } from "react";
import { Bell, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function OperatorNotifications({ data }: { data: Record<string, unknown> }) {
  const { toast } = useToast();
  const op = data.operator as Record<string, unknown>;
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!title.trim() || !message.trim()) {
      toast("Title and message are required", "error");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          audience: "operator",
          operatorUserId: op.user_id ?? op.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Send failed");
      toast("Notification sent to operator", "success");
      setTitle("");
      setMessage("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Send failed", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <Bell className="h-4 w-4 text-primary" />
          Send Notification
        </h4>
        <div className="space-y-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            className="min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Message to operator…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button size="sm" className="gap-1.5" disabled={sending} onClick={() => void send()}>
            <Send className="h-4 w-4" />
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
