import { query, queryOne } from "@/backend/db/pool";

export type UnifiedTicketFilters = {
  status?: string;
  priority?: string;
  category?: string;
  executiveUserId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type SupportTicketRow = {
  id: string;
  ticket_code: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  resident_name: string | null;
  resident_phone: string | null;
  society_name: string | null;
  assigned_executive_name: string | null;
  order_code: string | null;
};

export async function listUnifiedSupportTickets(filters: UnifiedTicketFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;

  let whereClauses: string[] = ["1=1"];
  const params: any[] = [];
  let paramIdx = 1;

  if (filters.status && filters.status !== "all") {
    whereClauses.push(`t.status = $${paramIdx++}`);
    params.push(filters.status);
  }

  if (filters.priority && filters.priority !== "all") {
    whereClauses.push(`t.priority = $${paramIdx++}`);
    params.push(filters.priority);
  }

  if (filters.category && filters.category !== "all") {
    whereClauses.push(`t.category = $${paramIdx++}`);
    params.push(filters.category);
  }

  if (filters.executiveUserId) {
    whereClauses.push(`t.assigned_to_user_id = $${paramIdx++}`);
    params.push(filters.executiveUserId);
  }

  if (filters.search) {
    whereClauses.push(`(
      t.ticket_code ILIKE $${paramIdx} OR 
      u.full_name ILIKE $${paramIdx} OR 
      u.phone ILIKE $${paramIdx}
    )`);
    params.push(`%${filters.search}%`);
    paramIdx++;
  }

  const sql = `
    SELECT 
      t.id, 
      t.ticket_code, 
      t.category, 
      t.description, 
      t.status, 
      t.priority, 
      t.created_at, 
      t.updated_at,
      u.full_name AS resident_name,
      u.phone AS resident_phone,
      s.name AS society_name,
      eu.full_name AS assigned_executive_name,
      o.order_code
    FROM support_tickets t
    LEFT JOIN residents r ON r.id = t.resident_id
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN societies s ON s.id = r.society_id
    LEFT JOIN users eu ON eu.id = t.assigned_to_user_id
    LEFT JOIN orders o ON o.id = t.order_id
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY t.created_at DESC
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `;
  params.push(limit, offset);

  const countSql = `
    SELECT COUNT(t.id) as total
    FROM support_tickets t
    LEFT JOIN residents r ON r.id = t.resident_id
    LEFT JOIN users u ON u.id = r.user_id
    WHERE ${whereClauses.join(" AND ")}
  `;
  
  const [dataRes, countRes] = await Promise.all([
    query<SupportTicketRow>(sql, params),
    queryOne<{ total: string }>(countSql, params.slice(0, paramIdx - 3))
  ]);

  return {
    data: dataRes.rows,
    total: parseInt(countRes?.total || "0", 10),
    page,
    limit,
  };
}

export async function getSupportTicketDetails(ticketId: string) {
  const sql = `
    SELECT 
      t.id, 
      t.ticket_code, 
      t.category, 
      t.description, 
      t.status, 
      t.priority, 
      t.created_at, 
      t.updated_at,
      t.assigned_to_user_id,
      eu.full_name AS assigned_executive_name,
      
      -- Resident Info
      u.full_name AS resident_name,
      u.phone AS resident_phone,
      r.unit_number AS resident_flat,
      r.tower_block AS resident_tower,
      s.name AS society_name,
      
      -- Order Info
      o.id AS order_id,
      o.order_code,
      o.status AS order_status
    FROM support_tickets t
    LEFT JOIN residents r ON r.id = t.resident_id
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN societies s ON s.id = r.society_id
    LEFT JOIN users eu ON eu.id = t.assigned_to_user_id
    LEFT JOIN orders o ON o.id = t.order_id
    WHERE t.id = $1
  `;
  const ticketRes = await queryOne(sql, [ticketId]);
  if (!ticketRes) return null;

  // Fetch messages
  const msgRes = await query(`
    SELECT 
      m.id, 
      m.sender_user_id, 
      m.body, 
      m.created_at,
      u.full_name AS sender_name
    FROM ticket_messages m
    LEFT JOIN users u ON u.id = m.sender_user_id
    WHERE m.ticket_id = $1
    ORDER BY m.created_at ASC
  `, [ticketId]);

  return {
    ...ticketRes,
    messages: msgRes.rows,
  };
}

export async function updateTicketFields(ticketId: string, fields: { status?: string, priority?: string, assignedUserId?: string | null }) {
  const updates: string[] = [];
  const params: any[] = [ticketId];
  let idx = 2;

  if (fields.status) {
    updates.push(`status = $${idx++}`);
    params.push(fields.status);
  }
  if (fields.priority) {
    updates.push(`priority = $${idx++}`);
    params.push(fields.priority);
  }
  if (fields.assignedUserId !== undefined) {
    updates.push(`assigned_to_user_id = $${idx++}`);
    params.push(fields.assignedUserId);
  }

  if (updates.length === 0) return false;
  updates.push(`updated_at = NOW()`);

  const sql = `UPDATE support_tickets SET ${updates.join(", ")} WHERE id = $1 RETURNING id`;
  const res = await queryOne(sql, params);
  return !!res;
}

export async function addTicketMessage(ticketId: string, senderUserId: string, body: string) {
  const sql = `
    INSERT INTO ticket_messages (ticket_id, sender_user_id, body, message, sender_type, channel)
    VALUES ($1, $2, $3, $3, 'operations', 'customer')
    RETURNING id, sender_user_id, body, message, created_at
  `;
  const res = await queryOne(sql, [ticketId, senderUserId, body]);
  return res;
}
