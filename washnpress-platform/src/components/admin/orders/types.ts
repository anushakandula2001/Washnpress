export type OrderTab =
  | "all"
  | "pending_pickup"
  | "processing"
  | "ready"
  | "out"
  | "completed"
  | "cancelled";

export type OrderRow = {
  id: string;
  order_code: string;
  status: string;
  pickup_garment_count: number;
  delivered_garment_count?: number | null;
  qc_status?: string | null;
  created_at: string;
  updated_at: string;
  scheduled_for: string;
  resident_id: string;
  society_id: string;
  resident_name: string;
  resident_phone: string;
  society_name: string;
  tower_block?: string | null;
  unit_number?: string | null;
  operator_id?: string | null;
  operator_code?: string | null;
  operator_name?: string | null;
  operator_phone?: string | null;
};

export type SocietyOpt = { id: string; name: string };
export type OperatorOpt = {
  id: string;
  operator_code: string | null;
  full_name: string;
  phone: string;
  status?: string;
};

export type OrderFilters = {
  q: string;
  societyId: string;
  operatorId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
};

export const defaultOrderFilters: OrderFilters = {
  q: "",
  societyId: "",
  operatorId: "",
  status: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "newest",
};

export const ORDER_TABS: { id: OrderTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending_pickup", label: "Pending Pickup" },
  { id: "processing", label: "Processing" },
  { id: "ready", label: "Ready For Delivery" },
  { id: "out", label: "Out For Delivery" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export function normalizeOrderRow(raw: Record<string, unknown>): OrderRow {
  return {
    id: String(raw.id),
    order_code: String(raw.order_code ?? ""),
    status: String(raw.status ?? ""),
    pickup_garment_count: Number(raw.pickup_garment_count ?? 0),
    delivered_garment_count:
      raw.delivered_garment_count != null ? Number(raw.delivered_garment_count) : null,
    qc_status: raw.qc_status ? String(raw.qc_status) : null,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    scheduled_for: String(raw.scheduled_for ?? ""),
    resident_id: String(raw.resident_id ?? ""),
    society_id: String(raw.society_id ?? ""),
    resident_name: String(raw.resident_name ?? ""),
    resident_phone: String(raw.resident_phone ?? ""),
    society_name: String(raw.society_name ?? ""),
    tower_block: raw.tower_block ? String(raw.tower_block) : null,
    unit_number: raw.unit_number ? String(raw.unit_number) : null,
    operator_id: raw.operator_id ? String(raw.operator_id) : null,
    operator_code: raw.operator_code ? String(raw.operator_code) : null,
    operator_name: raw.operator_name ? String(raw.operator_name) : null,
    operator_phone: raw.operator_phone ? String(raw.operator_phone) : null,
  };
}

export function formatUnit(row: Pick<OrderRow, "tower_block" | "unit_number">) {
  const parts = [row.tower_block, row.unit_number].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}
