"use client";

import { readApiJson } from "@/frontend/api-client";

import { useEffect, useState } from "react";
import {
  X,
  MessageSquare,
  Clock,
  Paperclip,
  ShieldAlert,
  ShoppingBag,
  Send,
  AlertCircle,
  FileText,
  UserCircle2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getSlaStatusBadge } from "./SupportTicketTable";
import type { SupportTicketRecord } from "@/backend/repositories/support";
import { Card, CardContent } from "@/components/ui/card";

type TicketMessageItem = {
  id: string;
  ticket_id?: string;
  sender_name: string | null;
  sender_type: "resident" | "support" | "operations" | "manager" | "system" | string;
  channel: "customer" | "internal" | string;
  message: string;
  created_at: string;
};

type TicketAttachmentItem = {
  id: string;
  file_url: string;
  file_name: string;
  file_type?: string;
};

type TicketNoteItem = {
  id: string;
  author_name: string;
  note: string;
  created_at: string;
};

type TicketHistoryItem = {
  id: string;
  actor_name: string;
  action: string;
  changes?: Record<string, unknown>;
  created_at: string;
};

type FullTicketData = SupportTicketRecord & {
  messages: TicketMessageItem[];
  attachments: TicketAttachmentItem[];
  notes: TicketNoteItem[];
  history: TicketHistoryItem[];
};

export function SupportTicketDetailDrawer({
  ticketId,
  onClose,
}: {
  ticketId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<FullTicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"conversation" | "timeline" | "attachments" | "notes" | "order" | "history">("conversation");

  // Chat inputs
  const [messageInput, setMessageInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    async function loadTicket() {
      setLoading(true);
      try {
        const res = await fetch(`/api/support/tickets/${ticketId}?channel=all`);
        if (res.ok) {
          const json = await readApiJson(res);
          setData(json as FullTicketData);
        }
      } catch (e) {
        console.error("Failed to fetch ticket data", e);
      } finally {
        setLoading(false);
      }
    }

    void loadTicket();
  }, [ticketId]);

  async function handleSendMessage() {
    if (!messageInput.trim() || !data) return;
    try {
      await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: data.id,
          senderName: "Support Staff",
          senderType: "support",
          channel: "customer",
          message: messageInput.trim(),
        }),
      });
      setMessageInput("");
      void loadTicket();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddNote() {
    if (!noteInput.trim() || !data) return;
    try {
      await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: data.id,
          senderName: "Support Staff",
          senderType: "support",
          channel: "internal",
          message: noteInput.trim(),
        }),
      });
      setNoteInput("");
      void loadTicket();
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTicket() {
    setLoading(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}?channel=all`);
      if (res.ok) {
        const json = await readApiJson(res);
        setData(json as FullTicketData);
      }
    } catch (e) {
      console.error("Failed to fetch ticket data", e);
    } finally {
      setLoading(false);
    }
  }

  if (!data && !loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="w-full max-w-4xl bg-background/90 backdrop-blur-xl shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300 border-l border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {data?.ticket_code || "Loading..."}
            </h2>
            {data && (
              <div className="flex gap-2">
                <Badge variant={(data.priority || "").toLowerCase() === "critical" ? "destructive" : (data.priority || "").toLowerCase() === "high" ? "default" : "secondary"} className="capitalize">
                  {data.priority || "Normal"}
                </Badge>
                <Badge variant={data.status.toLowerCase() === "resolved" || data.status.toLowerCase() === "closed" ? "success" : "outline"} className="capitalize">
                  {data.status.replace("_", " ")}
                </Badge>
                {getSlaStatusBadge(data)}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Info Bar */}
        {data && (
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-card text-sm">
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase mb-1">Resident</p>
              <p className="font-medium">{data.resident_name || "N/A"}</p>
              <p className="text-xs text-muted-foreground">{data.society_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase mb-1">Assigned Executive</p>
              <p className="font-medium">{data.assigned_user_name || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase mb-1">Category</p>
              <p className="font-medium">{data.category}</p>
              {data.order_code && (
                <p className="text-xs text-primary font-mono">{data.order_code}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="outline">Reassign</Button>
              <Button size="sm" variant="destructive">Escalate</Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          {[
            { id: "conversation", label: "Conversation", icon: MessageSquare },
            { id: "notes", label: "Internal Notes", icon: ShieldAlert },
            { id: "timeline", label: "Timeline", icon: Clock },
            { id: "attachments", label: "Attachments", icon: Paperclip },
            { id: "order", label: "Order Details", icon: ShoppingBag },
            { id: "history", label: "Audit Log", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "conversation" | "timeline" | "attachments" | "notes" | "order" | "history")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "attachments" && data?.attachments?.length ? (
                <span className="ml-1 bg-muted px-1.5 py-0.5 rounded-full text-[10px]">{data.attachments.length}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/10 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">Loading details...</div>
          ) : !data ? null : (
            <>
              {activeTab === "conversation" && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-4 mb-4">
                    {/* Original Description */}
                    <div className="flex gap-3 mb-6">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 mt-1">
                        R
                      </div>
                      <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] border border-border/50 relative group">
                        <p className="text-xs font-bold text-foreground mb-1">{data.resident_name} <span className="opacity-60 font-normal">via App</span></p>
                        <p className="text-sm leading-relaxed">{data.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 left-2">
                          {new Date(data.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    {data.messages
                      .filter((m) => m.channel === "customer")
                      .map((msg) => (
                        <div key={msg.id} className={`flex gap-3 mb-6 ${msg.sender_type === "support" ? "justify-end" : ""}`}>
                          {msg.sender_type !== "support" && (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 mt-1">
                              {msg.sender_name?.[0] || "U"}
                            </div>
                          )}
                          <div
                            className={`p-3.5 rounded-2xl shadow-sm max-w-[80%] relative group ${
                              msg.sender_type === "support"
                                ? "bg-primary text-primary-foreground rounded-tr-none shadow-primary/20"
                                : "bg-muted/50 border border-border/50 text-foreground rounded-tl-none"
                            }`}
                          >
                            <p className="text-xs font-bold opacity-80 mb-1">{msg.sender_name}</p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            <p className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 ${msg.sender_type === "support" ? "text-primary right-2" : "text-muted-foreground left-2"}`}>
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          </div>
                          {msg.sender_type === "support" && (
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 mt-1 ring-2 ring-background">
                              S
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* Reply Box */}
                  <div className="mt-auto bg-card p-3 rounded-xl border border-border shadow-sm flex items-end gap-2 sticky bottom-0">
                    <Textarea
                      placeholder="Type a reply to the resident..."
                      className="min-h-[60px] resize-none border-0 focus-visible:ring-0 px-2 py-1 text-sm bg-transparent"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <Button onClick={handleSendMessage} disabled={!messageInput.trim()} size="icon" className="shrink-0 mb-1">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="flex flex-col h-full">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg flex items-start gap-2 mb-4 text-sm">
                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-yellow-600" />
                    <p>Internal notes are <strong>strictly confidential</strong> and will not be visible to the resident. Use this space for team coordination and investigation notes.</p>
                  </div>

                  <div className="flex-1 space-y-4 mb-4">
                    {data.messages
                      .filter((m) => m.channel === "internal")
                      .map((msg) => (
                        <div key={msg.id} className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-700 font-bold flex-shrink-0">
                            {msg.sender_name?.[0] || "S"}
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%]">
                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-400 mb-1">{msg.sender_name}</p>
                            <p className="text-sm text-yellow-900 dark:text-yellow-100 whitespace-pre-wrap">{msg.message}</p>
                            <p className="text-[10px] text-yellow-700/60 mt-2 text-right">
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    {data.messages.filter((m) => m.channel === "internal").length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No internal notes yet.</p>
                    )}
                  </div>

                  <div className="mt-auto bg-card p-3 rounded-xl border border-yellow-500/30 shadow-sm flex items-end gap-2 sticky bottom-0">
                    <Textarea
                      placeholder="Type an internal note..."
                      className="min-h-[60px] resize-none border-0 focus-visible:ring-0 px-2 py-1 text-sm bg-transparent"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                    />
                    <Button onClick={handleAddNote} disabled={!noteInput.trim()} size="icon" className="shrink-0 mb-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="space-y-6 max-w-2xl mx-auto py-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5" /> Ticket Lifecycle
                  </h3>
                  <div className="relative border-l-2 border-primary/20 ml-3 space-y-8 pb-4">
                    <div className="relative pl-6">
                      <div className="absolute left-[-9px] top-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Ticket Created</p>
                      <p className="text-xs text-muted-foreground">{new Date(data.created_at).toLocaleString()}</p>
                      <p className="text-sm mt-1">{data.description}</p>
                    </div>

                    {data.history.map((hist, i) => (
                      <div key={i} className="relative pl-6">
                         <div className="absolute left-[-9px] top-1 h-4 w-4 rounded-full bg-muted-foreground flex items-center justify-center ring-4 ring-background">
                           <CheckCircle2 className="h-4 w-4 text-background bg-muted-foreground rounded-full" />
                         </div>
                         <p className="text-sm font-semibold text-foreground">
                           {hist.action}
                         </p>
                         <div className="text-xs text-muted-foreground mt-1">
                           {Object.entries(hist.changes || {}).map(([k, v]) => (
                             <span key={k} className="inline-block bg-muted px-2 py-0.5 rounded-md mr-2 mt-1">
                               {k}: <span className="font-semibold text-foreground">{String(v)}</span>
                             </span>
                           ))}
                         </div>
                         <p className="text-[10px] text-muted-foreground mt-2">{new Date(hist.created_at).toLocaleString()} by {hist.actor_name}</p>
                      </div>
                    ))}

                    {data.status.toLowerCase() !== "resolved" && data.status.toLowerCase() !== "closed" && (
                      <div className="relative pl-6 opacity-40">
                         <div className="absolute left-[-9px] top-1 h-4 w-4 rounded-full border-2 border-dashed border-muted-foreground bg-background ring-4 ring-background">
                         </div>
                         <p className="text-sm font-semibold text-muted-foreground">Resolution Pending</p>
                         <p className="text-xs text-muted-foreground">Target: {new Date(new Date(data.created_at).getTime() + 24*60*60*1000).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="space-y-4">
                  {data.attachments.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                      <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium text-muted-foreground">No attachments provided</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {data.attachments.map((att) => (
                        <a key={att.id} href={att.file_url} target="_blank" rel="noreferrer" className="block group">
                          <div className="aspect-square bg-muted rounded-xl border border-border overflow-hidden relative flex items-center justify-center">
                            {(att.file_type ?? "").startsWith("image/") ? (
                              <img src={att.file_url} alt={att.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-[10px] text-white truncate">
                              {att.file_name}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "order" && (
                <div className="space-y-4 max-w-2xl">
                  {data.order_code ? (
                    <Card className="border-border">
                      <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-primary">{data.order_code}</h4>
                          <p className="text-xs text-muted-foreground">Order details linked to this ticket</p>
                        </div>
                        <Button variant="outline" size="sm">View Full Order</Button>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                         <div>
                           <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Status</p>
                           <Badge variant="outline">Processing</Badge>
                         </div>
                         <div>
                           <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Pickup Date</p>
                           <p className="font-medium">2026-07-22</p>
                         </div>
                         <div className="col-span-2 mt-2">
                           <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Garments</p>
                           <ul className="space-y-1 bg-muted/20 p-3 rounded-lg border border-border/50">
                             <li className="flex justify-between"><span>2x Cotton Shirt (Wash & Iron)</span> <span>$6.00</span></li>
                             <li className="flex justify-between"><span>1x Denim Jeans (Dry Clean)</span> <span>$8.00</span></li>
                           </ul>
                         </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium text-muted-foreground">No order linked to this ticket</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-2">
                   <table className="w-full text-left text-sm border border-border rounded-lg overflow-hidden">
                     <thead className="bg-muted/50 border-b border-border">
                       <tr>
                         <th className="px-3 py-2">Timestamp</th>
                         <th className="px-3 py-2">Actor</th>
                         <th className="px-3 py-2">Action</th>
                         <th className="px-3 py-2">Details</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border bg-card">
                       {data.history.map((h, i) => (
                         <tr key={i}>
                           <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</td>
                           <td className="px-3 py-2 font-medium">{h.actor_name}</td>
                           <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{h.action}</Badge></td>
                           <td className="px-3 py-2 text-xs">
                             {Object.entries(h.changes || {}).map(([k, v]) => (
                               <div key={k} className="truncate max-w-[200px]">
                                 <span className="opacity-70">{k}:</span> <span className="font-semibold">{String(v)}</span>
                               </div>
                             ))}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
