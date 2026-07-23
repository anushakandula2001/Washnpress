"use client";

import { useEffect, useState } from "react";
import { SupportTicketTable } from "@/components/operations/support/SupportTicketTable";
import { SupportTicketDetailDrawer } from "@/components/operations/support/SupportTicketDetailDrawer";
import type { SupportTicketRecord } from "@/backend/repositories/support";

export default function SupportCenterMyTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets?assignedUserId=demo-staff-user"); // Hardcoded for demo purposes
      if (res.ok) {
        const json = await res.json();
        setTickets(json.tickets || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <SupportTicketTable
        tickets={tickets}
        loading={loading}
        onSelectTicket={(t) => setSelectedTicketId(t.id)}
      />

      {selectedTicketId && (
        <SupportTicketDetailDrawer
          ticketId={selectedTicketId}
          onClose={() => {
            setSelectedTicketId(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
