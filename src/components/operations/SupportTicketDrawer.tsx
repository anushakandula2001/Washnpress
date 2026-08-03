"use client";

import { readApiJson } from "@/frontend/api-client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, Phone, MapPin, Package, Clock, MessageSquare, Send, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export type TicketDetails = {
  id: string;
  ticket_code: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assigned_to_user_id: string | null;
  assigned_executive_name: string | null;
  resident_name: string | null;
  resident_phone: string | null;
  resident_flat: string | null;
  resident_tower: string | null;
  society_name: string | null;
  order_id: string | null;
  order_code: string | null;
  order_status: string | null;
  messages: Array<{
    id: string;
    sender_user_id: string | null;
    body: string;
    created_at: string;
    sender_name: string | null;
  }>;
};

interface SupportTicketDrawerProps {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function SupportTicketDrawer({ ticketId, open, onOpenChange, onUpdated }: SupportTicketDrawerProps) {
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && ticketId) {
      loadTicket(ticketId);
    } else {
      setTicket(null);
    }
  }, [open, ticketId]);

  async function loadTicket(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/operations/support/${id}`);
      if (res.ok) {
        const data = await readApiJson(res);
        setTicket(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(newStatus: string) {
    if (!ticketId) return;
    try {
      await fetch(`/api/operations/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      loadTicket(ticketId);
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSendReply() {
    if (!ticketId || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/operations/support/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      setReplyText("");
      loadTicket(ticketId);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-primary/10 shadow-2xl p-0 flex flex-col">
        {loading || !ticket ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <div className="animate-pulse flex flex-col items-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Loading ticket workspace...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-border/40 bg-muted/20">
              <SheetHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      {ticket.ticket_code}
                      <Badge variant={ticket.priority.toLowerCase() === "critical" ? "destructive" : "secondary"}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <Badge variant={ticket.status === "open" ? "default" : "outline"}>
                        {ticket.status.toUpperCase()}
                      </Badge>
                    </h2>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {ticket.category} • Created {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </SheetHeader>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                {ticket.status !== "resolved" && ticket.status !== "closed" && (
                  <>
                    <Button variant="default" size="sm" onClick={() => handleUpdateStatus("resolved")}>
                      Resolve Ticket
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus("escalated")}>
                      Escalate
                    </Button>
                  </>
                )}
                {ticket.status === "resolved" && (
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus("closed")}>
                    Close Ticket
                  </Button>
                )}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="sticky top-0 bg-background/95 backdrop-blur z-10 px-6 border-b border-border/40 pt-2">
                  <TabsList className="w-full justify-start h-auto bg-transparent p-0 gap-6 rounded-none">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 data-[state=active]:shadow-none">Overview</TabsTrigger>
                    <TabsTrigger value="conversation" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 data-[state=active]:shadow-none">Conversation</TabsTrigger>
                    <TabsTrigger value="timeline" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 data-[state=active]:shadow-none">Timeline</TabsTrigger>
                    <TabsTrigger value="order" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 data-[state=active]:shadow-none">Related Order</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                      <h3 className="font-semibold text-primary mb-2">Description</h3>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Resident Details</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3 text-foreground">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {ticket.resident_name || "Unknown Resident"}
                          </div>
                          <div className="flex items-center gap-3 text-foreground">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {ticket.resident_phone || "N/A"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Address</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3 text-foreground">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {ticket.society_name || "No Society Linked"}
                          </div>
                          <div className="flex items-center gap-3 text-foreground">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {ticket.resident_tower ? `${ticket.resident_tower} - ` : ""}
                            {ticket.resident_flat || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="conversation" className="mt-0 flex flex-col h-[calc(100vh-280px)]">
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                      {ticket.messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">No messages yet.</div>
                      ) : (
                        ticket.messages.map(m => (
                          <div key={m.id} className={`flex flex-col ${!m.sender_user_id ? 'items-start' : 'items-end'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                              !m.sender_user_id 
                                ? "bg-muted/50 rounded-tl-sm" 
                                : "bg-primary text-primary-foreground rounded-tr-sm shadow-md"
                            }`}>
                              <div className="text-xs font-semibold mb-1 opacity-80">
                                {m.sender_name || (m.sender_user_id ? "Operations" : "Resident")} • {new Date(m.created_at).toLocaleTimeString()}
                              </div>
                              <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border flex gap-3">
                      <Textarea 
                        placeholder="Type a reply to the resident..." 
                        className="resize-none min-h-[60px] flex-1 bg-muted/30 focus:bg-background"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                      />
                      <div className="flex flex-col gap-2">
                        <Button 
                          onClick={handleSendReply} 
                          disabled={submitting || !replyText.trim()}
                          className="flex-1 gap-2"
                        >
                          <Send className="h-4 w-4" /> Send
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-0">
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                       <div className="text-center text-sm text-muted-foreground pt-4">Timeline feature tracking events</div>
                       {/* Placeholder for future detailed audit log items */}
                       <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-white group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                              <CheckCircle className="h-4 w-4" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                              <div className="flex items-center justify-between space-x-2 mb-1">
                                  <div className="font-bold text-slate-900 dark:text-slate-100">Ticket Created</div>
                                  <time className="font-caveat font-medium text-indigo-500">{new Date(ticket.created_at).toLocaleString()}</time>
                              </div>
                              <div className="text-slate-500 text-sm">System opened the ticket</div>
                          </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="order" className="mt-0">
                    {ticket.order_id ? (
                      <div className="bg-muted/20 border border-border rounded-xl p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-lg">{ticket.order_code}</h3>
                          <Badge variant="outline">{ticket.order_status?.toUpperCase()}</Badge>
                        </div>
                        <Button variant="secondary" className="w-full">View Full Order Details</Button>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-10 flex flex-col items-center">
                        <Package className="h-10 w-10 mb-3 opacity-50" />
                        <p>No order is linked to this ticket.</p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Temporary check circle icon
function CheckCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
