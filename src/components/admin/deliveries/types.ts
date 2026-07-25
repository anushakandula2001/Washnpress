export type DeliveryTab = "ready" | "out" | "delivered" | "failed";

export type DeliveryRow = {
  id: string;
  order_code: string;
  status: string;
  updated_at: string;
  created_at?: string;
  pickup_garment_count: number;
  delivered_garment_count?: number | null;
  resident_name: string;
  phone: string;
  email?: string | null;
  society_name: string;
  society_city?: string | null;
  resident_id: string;
  society_id: string;
  tower_block?: string | null;
  unit_number?: string | null;
  scheduled_for: string;
  special_instructions?: string | null;
  operator_id?: string | null;
  operator_code?: string | null;
  operator_name?: string | null;
  operator_phone?: string | null;
  route_date?: string | null;
  route_id?: string | null;
  stop_status?: string | null;
};

export type SocietyOpt = { id: string; name: string };
export type OperatorOpt = {
  id: string;
  operator_code: string | null;
  full_name: string;
  phone: string;
};

export type DeliveryFilters = {
  q: string;
  societyId: string;
  operatorId: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
};

export const defaultDeliveryFilters: DeliveryFilters = {
  q: "",
  societyId: "",
  operatorId: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "newest",
};

export const DELIVERY_TABS: { id: DeliveryTab; label: string }[] = [
  { id: "ready", label: "Ready" },
  { id: "out", label: "Out For Delivery" },
  { id: "delivered", label: "Delivered" },
  { id: "failed", label: "Failed" },
];

export function normalizeDeliveryRow(raw: Record<string, unknown>): DeliveryRow {
  return {
    id: String(raw.id),
    order_code: String(raw.order_code ?? ""),
    status: String(raw.status ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    created_at: raw.created_at ? String(raw.created_at) : undefined,
    pickup_garment_count: Number(raw.pickup_garment_count ?? 0),
    delivered_garment_count:
      raw.delivered_garment_count != null ? Number(raw.delivered_garment_count) : null,
    resident_name: String(raw.resident_name ?? ""),
    phone: String(raw.phone ?? ""),
    email: raw.email ? String(raw.email) : null,
    society_name: String(raw.society_name ?? ""),
    society_city: raw.society_city ? String(raw.society_city) : null,
    resident_id: String(raw.resident_id ?? ""),
    society_id: String(raw.society_id ?? ""),
    tower_block: raw.tower_block ? String(raw.tower_block) : null,
    unit_number: raw.unit_number ? String(raw.unit_number) : null,
    scheduled_for: String(raw.scheduled_for ?? ""),
    special_instructions: raw.special_instructions ? String(raw.special_instructions) : null,
    operator_id: raw.operator_id ? String(raw.operator_id) : null,
    operator_code: raw.operator_code ? String(raw.operator_code) : null,
    operator_name: raw.operator_name ? String(raw.operator_name) : null,
    operator_phone: raw.operator_phone ? String(raw.operator_phone) : null,
    route_date: raw.route_date ? String(raw.route_date) : null,
    route_id: raw.route_id ? String(raw.route_id) : null,
    stop_status: raw.stop_status ? String(raw.stop_status) : null,
  };
}
