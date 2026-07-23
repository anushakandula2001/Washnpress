"use client";

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

type FullTicketData = SupportTicketRecord & {
  messages: any[];
  attachments: any[];
  notes: any[];
  history: any[];
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
    fetchData();
  }, [ticketId]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}?channel=all`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

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
      fetchData();
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
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }

  if (!data && !loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="w-full max-w-4xl bg-background shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {data?.ticket_code || "Loading..."}
            </h2>
            {data && (
              <div className="flex gap-2">
                <Badge variant={data.priority === "Critical" ? "destructive" : data.priority === "High" ? "default" : "secondary"}>
                  {data.priority}
                </Badge>
                <Badge variant={data.status === "Resolved" || data.status === "Closed" ? "success" : "outline"}>
                  {data.status}
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
              <p className="text-muted-foreground text-xs font-semibold uppercase mb-1">Assigned To</p>
              <p className="font-medium">{data.assigned_team || "Unassigned"}</p>
              <p className="text-xs text-muted-foreground">{data.assigned_user_name || "Any Executive"}</p>
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
              onClick={() => setActiveTab(tab.id as any)}
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
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        R
                      </div>
                      <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%]">
                        <p className="text-xs font-semibold text-primary mb-1">{data.resident_name} (Resident)</p>
                        <p className="text-sm">{data.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-2 text-right">
                          {new Date(data.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    {data.messages
                      .filter((m) => m.channel === "customer")
                      .map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender_type === "support" ? "justify-end" : ""}`}>
                          {msg.sender_type !== "support" && (
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                              {msg.sender_name?.[0] || "U"}
                            </div>
                          )}
                          <div
                            className={`p-3 rounded-2xl shadow-sm max-w-[80%] ${
                              msg.sender_type === "support"
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-card border border-border text-foreground rounded-tl-none"
                            }`}
                          >
                            <p className="text-xs font-semibold opacity-80 mb-1">{msg.sender_name}</p>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            <p className="text-[10px] opacity-60 mt-2 text-right">
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          </div>
                          {msg.sender_type === "support" && (
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
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
                           {hist.field_changed === "status" ? `Status updated to ${hist.new_value}` :
                            hist.field_changed === "priority" ? `Priority escalated to ${hist.new_value}` :
                            hist.field_changed === "assigned_team" ? `Assigned to ${hist.new_value}` :
                            `${hist.field_changed} updated`}
                         </p>
                         <p className="text-xs text-muted-foreground">{new Date(hist.created_at).toLocaleString()} by {hist.actor_name}</p>
                      </div>
                    ))}

                    {data.status !== "Resolved" && data.status !== "Closed" && (
                      <div className="relative pl-6 opacity-40">
                         <div className="absolute left-[-9px] top-1 h-4 w-4 rounded-full border-2 border-dashed border-muted-foreground bg-background ring-4 ring-background">
                         </div>
                         <p className="text-sm font-semibold text-muted-foreground">Resolution Pending</p>
                         <p className="text-xs text-muted-foreground">SLA Target: {new Date(data.sla_resolution_due_at).toLocaleString()}</p>
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
                            {att.file_type.startsWith("image/") ? (
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
                           <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{h.action_type}</Badge></td>
                           <td className="px-3 py-2 text-xs">Changed <span className="font-semibold">{h.field_changed}</span> from <span className="opacity-60">{h.old_value}</span> to <span className="font-semibold">{h.new_value}</span></td>
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
