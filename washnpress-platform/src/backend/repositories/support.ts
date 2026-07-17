import { query, queryOne } from "@/backend/db/pool";
import type { DbSupportTicket } from "@/backend/types";

export async function listTicketsByResident(residentId: string) {
  const result = await query<DbSupportTicket>(
    `SELECT id, ticket_code, category, description, status, priority, created_at, updated_at
     FROM support_tickets WHERE resident_id = $1 ORDER BY created_at DESC`,
    [residentId],
  );
  return result.rows;
}

export async function createTicket(data: {
  residentId: string;
  orderId?: string;
  category: string;
  description: string;
  priority?: string;
}) {
  const ticketCode = `SUP-${Date.now().toString().slice(-6)}`;

  return queryOne<DbSupportTicket>(
    `INSERT INTO support_tickets (ticket_code, resident_id, order_id, category, description, status, priority)
     VALUES ($1, $2, $3, $4, $5, 'open', $6)
     RETURNING id, ticket_code, category, description, status, priority, created_at, updated_at`,
    [
      ticketCode,
      data.residentId,
      data.orderId ?? null,
      data.category,
      data.description,
      data.priority ?? "medium",
    ],
  );
}

export async function createQcTicket(data: {
  orderId: string;
  residentId: string;
  reason: string;
}) {
  return createTicket({
    residentId: data.residentId,
    orderId: data.orderId,
    category: "QC Issue",
    description: data.reason,
    priority: "high",
  });
}

export async function findOrderResidentId(orderCode: string) {
  return queryOne<{ order_id: string; resident_id: string }>(
    `SELECT o.id AS order_id, p.resident_id
     FROM orders o JOIN pickups p ON p.id = o.pickup_id
     WHERE o.order_code = $1`,
    [orderCode],
  );
}
