export type PickupTab = "today" | "scheduled" | "assigned" | "completed" | "missed";

export const PICKUP_TABS: { id: PickupTab; label: string; filter: string }[] = [
  { id: "today", label: "Today's Pickups", filter: "today" },
  { id: "scheduled", label: "Scheduled", filter: "upcoming" },
  { id: "assigned", label: "Assigned", filter: "assigned" },
  { id: "completed", label: "Completed", filter: "completed" },
  { id: "missed", label: "Missed", filter: "missed" },
];

export type PickupRow = {
  id: string;
  status: string;
  scheduled_for: string;
  recurring: boolean;
  recurring_day?: string | null;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
  resident_id: string;
  resident_name: string;
  resident_code?: string | null;
  resident_email?: string | null;
  phone: string;
  society_id: string;
  society_name: string;
  society_city?: string | null;
  tower_block: string | null;
  unit_number: string | null;
  slot_window: string | null;
  start_time: string | null;
  end_time: string | null;
  order_id?: string | null;
  order_code: string | null;
  order_status: string | null;
  pickup_garment_count?: number | null;
  operator_id: string | null;
  operator_code: string | null;
  operator_name: string | null;
  operator_phone: string | null;
};

export type PickupStats = {
  today: number;
  scheduled: number;
  assigned: number;
  completed: number;
  missed: number;
  cancelled: number;
};

export type SocietyOpt = { id: string; name: string; city?: string | null };
export type OperatorOpt = {
  id: string;
  operator_code: string | null;
  full_name: string;
  status?: string;
};

export type PickupFilters = {
  q: string;
  societyId: string;
  operatorId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
};

export const defaultPickupFilters: PickupFilters = {
  q: "",
  societyId: "",
  operatorId: "",
  status: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "scheduled_desc",
};
