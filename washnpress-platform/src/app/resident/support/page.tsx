"use client";

import { useEffect, useState } from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Headphones, Search, PlusCircle, CheckCircle2, Clock, AlertTriangle, ArrowRight, MessageSquare, ChevronRight, Sparkles, Star } from "lucide-react";

// Mock Resident Data
const RESIDENT_ID = "res-101";
const RESIDENT_NAME = "Anusha Kandula";
const SOCIETY_ID = "soc-202";

type SupportTicketRecord = {
  id: string;
  ticket_code: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  created_at: string;
  sla_resolution_due_at: string;
  csat_rating: number | null;
  messages?: any[];
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Description, 2: AI Suggestion, 3: Success
  const [issueDesc, setIssueDesc] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Chat modal state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRecord | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch(`/api/support/tickets?residentId=${RESIDENT_ID}`);
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyzeIssue() {
    if (issueDesc.trim().length < 5) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/support/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: issueDesc, residentName: RESIDENT_NAME }),
      });
      const data = await res.json();
      setAiSuggestion(data.analysis);
      setWizardStep(2);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSubmitTicket() {
    try {
      await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId: RESIDENT_ID,
          description: issueDesc,
          category: aiSuggestion?.category || "Other",
          societyId: SOCIETY_ID,
          priority: aiSuggestion?.suggestedPriority || "Medium",
        }),
      });
      setWizardStep(3);
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSendReply() {
    if (!chatInput.trim() || !selectedTicket) return;
    try {
      await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          senderUserId: RESIDENT_ID,
          senderName: RESIDENT_NAME,
          senderType: "resident",
          channel: "customer",
          message: chatInput,
        }),
      });
      setChatInput("");
      
      // Refresh the specific ticket
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}?channel=customer`);
      const updated = await res.json();
      setSelectedTicket(updated);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmitRating() {
    if (!selectedTicket || rating === 0) return;
    try {
      await fetch(`/api/support/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csatRating: rating, csatFeedback: feedback }),
      });
      
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}?channel=customer`);
      const updated = await res.json();
      setSelectedTicket(updated);
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  }

  function openTicket(t: SupportTicketRecord) {
    // Fetch full ticket details to get messages
    fetch(`/api/support/tickets/${t.id}?channel=customer`)
      .then(res => res.json())
      .then(data => setSelectedTicket(data));
  }

  return (
    <ResidentShell greeting="Help & Support" subtitle="We're here to help you 24/7">
      
      {/* Search & Hero */}
      <div className="relative mb-8 rounded-3xl bg-gradient-to-br from-primary to-blue-600 p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 opacity-20 pointer-events-none">
           <Headphones className="h-48 w-48 -mt-8 -mr-8" />
        </div>
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-bold mb-2">How can we help you?</h2>
          <p className="text-primary-foreground/80 mb-6">Search for help, track your issues, or chat with our support team.</p>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              placeholder="Search help articles or describe your issue..." 
              className="pl-12 py-6 rounded-2xl bg-white/95 text-slate-900 border-0 shadow-lg text-lg w-full focus-visible:ring-2 focus-visible:ring-white"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & FAQs */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Need Assistance?</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                className="p-4 flex items-center justify-between border-b border-border cursor-pointer hover:bg-muted/50 transition group"
                onClick={() => { setIsWizardOpen(true); setWizardStep(1); setIssueDesc(""); }}
              >
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition">
                     <PlusCircle className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="font-semibold text-sm">Report an Issue</p>
                     <p className="text-xs text-muted-foreground">Orders, missing items, etc.</p>
                   </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition group">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition">
                     <AlertTriangle className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="font-semibold text-sm">Escalate Delay</p>
                     <p className="text-xs text-muted-foreground">Pickup or delivery delays</p>
                   </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: My Tickets */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Your Tickets</h3>
            <Badge variant="outline" className="rounded-full bg-background">
              {tickets.length} total
            </Badge>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading your tickets...</div>
          ) : tickets.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent text-center py-12 shadow-none">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground">No support tickets</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                You haven't reported any issues yet. If you need help, feel free to raise a ticket.
              </p>
              <Button onClick={() => { setIsWizardOpen(true); setWizardStep(1); }}>Raise a Ticket</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.map(t => (
                <Card 
                  key={t.id} 
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition duration-200 border-border rounded-2xl group"
                  onClick={() => openTicket(t)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                          t.status === 'Resolved' || t.status === 'Closed' ? 'bg-success/10 text-success' :
                          t.status === 'Escalated' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                        }`}>
                           {t.status === 'Resolved' || t.status === 'Closed' ? <CheckCircle2 className="h-6 w-6" /> :
                            t.status === 'Escalated' ? <AlertTriangle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-muted-foreground">{t.ticket_code}</span>
                            <Badge variant={t.status === 'Resolved' || t.status === 'Closed' ? 'success' : 'secondary'} className="text-[10px]">
                              {t.status}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-foreground line-clamp-1">{t.category}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{t.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TICKET WIZARD OVERLAY */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-lg">Report an Issue</h3>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsWizardOpen(false)}>
                &times;
              </Button>
            </div>
            
            <div className="p-6">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">What seems to be the problem?</h4>
                    <p className="text-sm text-muted-foreground mb-4">Please describe your issue in detail. Our AI will automatically categorize and route it to the right team.</p>
                    <Textarea 
                      placeholder="E.g., My pickup was scheduled for 10 AM but the executive hasn't arrived yet..."
                      className="min-h-[120px] rounded-xl resize-none"
                      value={issueDesc}
                      onChange={e => setIssueDesc(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full rounded-xl" 
                    size="lg" 
                    disabled={issueDesc.trim().length < 5 || isAnalyzing}
                    onClick={handleAnalyzeIssue}
                  >
                    {isAnalyzing ? "Analyzing..." : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {wizardStep === 2 && aiSuggestion && (
                <div className="space-y-6">
                  <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                      <Sparkles className="h-5 w-5" /> AI Analysis
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-primary/10 pb-2">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-semibold">{aiSuggestion.category}</span>
                      </div>
                      <div className="flex justify-between border-b border-primary/10 pb-2">
                        <span className="text-muted-foreground">Routing To</span>
                        <span className="font-semibold">{aiSuggestion.assignedTeam}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <Badge variant={aiSuggestion.suggestedPriority === 'Critical' ? 'destructive' : 'default'}>
                          {aiSuggestion.suggestedPriority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => setWizardStep(1)}>
                      Back
                    </Button>
                    <Button className="w-full rounded-xl" onClick={handleSubmitTicket}>
                      Submit Ticket
                    </Button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ticket Submitted!</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Our team is on it. You will receive an update shortly. You can track the status in your tickets list.
                  </p>
                  <Button className="w-full rounded-xl" onClick={() => setIsWizardOpen(false)}>
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TICKET DETAILS & CHAT MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm sm:p-4">
          <div className="w-full sm:w-[450px] bg-background sm:rounded-3xl shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border bg-card flex justify-between items-center shadow-sm z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-sm">{selectedTicket.ticket_code}</span>
                  <Badge variant={selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed' ? 'success' : 'secondary'} className="text-[10px]">
                    {selectedTicket.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm line-clamp-1">{selectedTicket.category}</h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelectedTicket(null)}>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            {/* SLA Tracker */}
            {selectedTicket.status !== "Resolved" && selectedTicket.status !== "Closed" && (
              <div className="bg-muted/50 px-4 py-3 text-xs border-b border-border flex items-center justify-between">
                <span className="font-medium text-muted-foreground">Estimated Resolution</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {new Date(selectedTicket.sla_resolution_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-4">
               {/* Initial Issue */}
               <div className="flex gap-3 justify-end">
                  <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-sm">
                    {selectedTicket.description}
                    <div className="text-[10px] opacity-70 mt-1 text-right">
                      {new Date(selectedTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
               </div>

               {/* Messages */}
               {selectedTicket.messages?.map((msg) => (
                 <div key={msg.id} className={`flex gap-3 ${msg.sender_type === "resident" ? "justify-end" : ""}`}>
                   {msg.sender_type !== "resident" && (
                     <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border shadow-sm flex items-center justify-center flex-shrink-0">
                       <img src="/logo.svg" alt="WNP" className="h-4 w-4" onError={(e) => e.currentTarget.style.display='none'} />
                       <span className="font-bold text-xs text-primary">{!msg.sender_type && 'S'}</span>
                     </div>
                   )}
                   <div className={`p-3 rounded-2xl shadow-sm max-w-[85%] text-sm ${
                     msg.sender_type === "resident" 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-white dark:bg-slate-800 border border-border text-foreground rounded-tl-none"
                   }`}>
                     {msg.sender_type !== "resident" && (
                       <div className="text-xs font-semibold text-primary mb-1">{msg.sender_name}</div>
                     )}
                     <div className="whitespace-pre-wrap">{msg.message}</div>
                     <div className={`text-[10px] mt-1 text-right ${msg.sender_type === "resident" ? "opacity-70" : "text-muted-foreground"}`}>
                       {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                   </div>
                 </div>
               ))}
               
               {selectedTicket.status === "Resolved" && !selectedTicket.csat_rating && (
                 <div className="bg-white dark:bg-slate-800 border border-success/30 rounded-2xl p-4 shadow-sm my-4 text-center">
                    <div className="mx-auto w-10 h-10 bg-success/20 text-success rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold mb-1">Issue Resolved</h4>
                    <p className="text-xs text-muted-foreground mb-4">How would you rate your support experience?</p>
                    
                    <div className="flex justify-center gap-2 mb-4">
                      {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star}
                          className={`h-8 w-8 cursor-pointer transition ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400/50'}`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>

                    {rating > 0 && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <Textarea 
                          placeholder="Tell us more about your experience..." 
                          className="text-sm min-h-[80px] rounded-xl"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                        <Button className="w-full rounded-xl" onClick={handleSubmitRating}>Submit Feedback</Button>
                      </div>
                    )}
                 </div>
               )}

               {selectedTicket.csat_rating && (
                 <div className="bg-muted/50 rounded-2xl p-3 text-center border border-border mt-4">
                   <p className="text-xs font-medium">You rated this support interaction</p>
                   <div className="flex justify-center gap-1 mt-1">
                     {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`h-4 w-4 ${selectedTicket.csat_rating! >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                     ))}
                   </div>
                 </div>
               )}
            </div>

            {/* Reply Input */}
            {selectedTicket.status !== "Closed" && !selectedTicket.csat_rating && selectedTicket.status !== "Resolved" && (
              <div className="p-4 bg-card border-t border-border">
                <div className="relative">
                  <Input 
                    placeholder="Type a message..." 
                    className="pr-12 rounded-full bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background h-12"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-1 top-1 rounded-full h-10 w-10 shrink-0 shadow-sm"
                    onClick={handleSendReply}
                    disabled={!chatInput.trim()}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ResidentShell>
  );
}
