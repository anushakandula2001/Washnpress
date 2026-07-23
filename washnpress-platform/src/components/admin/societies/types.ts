export type SocietyRow = {
  id: string;
  name: string;
  address_line_1: string | null;
  city: string;
  state: string;
  pincode: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  towers_count: number;
  flats_count: number;
  residents_count: number;
  orders_count: number;
  wallet_revenue: number;
  subscriptions_count: number;
  assigned_operators: string | null;
};

export type SocietyDetail = {
  id: string;
  name: string;
  address_line_1: string | null;
  city: string;
  state: string;
  pincode: string | null;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
};

export type SocietyTower = {
  id: string;
  society_id: string;
  name: string;
  status: string;
  floors_count: number;
  flats_count: number;
  residents_count: number;
};

export type SocietyOperator = {
  id: string;
  operator_code: string;
  full_name: string;
  phone: string;
  status: string;
};

export type SocietyResident = {
  id: string;
  resident_code: string;
  full_name: string;
  phone: string;
  unit_number: string;
  tower_block: string;
};

export type SocietyOrder = {
  order_code: string;
  status: string;
  created_at: string;
  resident_name: string;
};

export type SocietyDetailData = {
  society: SocietyDetail;
  towers: SocietyTower[];
  operators: SocietyOperator[];
  residents: SocietyResident[];
  orders: SocietyOrder[];
};

export type OperatorOpt = {
  id: string;
  operator_code: string | null;
  full_name: string;
  phone: string;
  status: string;
  societies?: string[];
};

export type SocietyViewMode = "cards" | "table" | "map";

export type SocietyFilters = {
  q: string;
  status: string;
  city: string;
  state: string;
  operator: string;
  residentsMin: string;
  ordersMin: string;
  createdFrom: string;
  createdTo: string;
  sortBy: string;
};

export const defaultSocietyFilters: SocietyFilters = {
  q: "",
  status: "",
  city: "",
  state: "",
  operator: "",
  residentsMin: "",
  ordersMin: "",
  createdFrom: "",
  createdTo: "",
  sortBy: "name",
};

export type PickupSlotDraft = {
  slotWindow: string;
  startTime: string;
  endTime: string;
  capacityTotal: number;
  enabled: boolean;
};

export type CreateSocietyForm = {
  name: string;
  status: "Pending Setup" | "active" | "coming_soon" | "inactive";
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  operatorId: string;
  assignLater: boolean;
  slots: PickupSlotDraft[];
  defaultTurnaroundHours: number;
  allowSubscriptions: boolean;
  notifyResidents: boolean;
};

export const emptyCreateSocietyForm: CreateSocietyForm = {
  name: "",
  status: "Pending Setup",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  operatorId: "",
  assignLater: false,
  slots: [
    { slotWindow: "Morning", startTime: "08:00", endTime: "11:00", capacityTotal: 20, enabled: true },
    { slotWindow: "Afternoon", startTime: "14:00", endTime: "17:00", capacityTotal: 20, enabled: true },
    { slotWindow: "Evening", startTime: "18:00", endTime: "21:00", capacityTotal: 15, enabled: false },
  ],
  defaultTurnaroundHours: 48,
  allowSubscriptions: true,
  notifyResidents: false,
};

export type PickupSlot = {
  id: string;
  society_id: string;
  slot_date: string;
  slot_window: string;
  start_time: string;
  end_time: string;
  capacity_total: number;
  capacity_remaining: number;
  is_active: boolean;
  society_name?: string;
};

export type ExecutiveRow = {
  id: string;
  society_id: string;
  full_name: string;
  phone: string;
  service_area_id?: string | null;
  service_area_name?: string | null;
  status?: string;
};

export type AuditLogRow = {
  id: string;
  actor_role: string;
  action: string;
  entity_name: string;
  entity_id: string;
  created_at: string;
  after_state?: Record<string, unknown>;
};
