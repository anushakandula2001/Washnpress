export type SessionUser = {
  userId: string;
  residentId: string | null;
  phone: string;
  fullName: string | null;
  unitNumber: string | null;
  towerBlock: string | null;
  societyId: string | null;
  societyName: string | null;
  roles: string[];
};

export type DbPlan = {
  id: string;
  tier: string;
  garment_cap: number;
  turnaround_hours: number;
  monthly_inr: string;
  annual_discount_percent: string;
  is_active: boolean;
};

export type DbSubscription = {
  id: string;
  resident_id: string;
  plan_id: string;
  status: string;
  cycle_start: string;
  cycle_end: string;
  garments_used: number;
  auto_renew: boolean;
  tier: string;
  garment_cap: number;
  turnaround_hours: number;
  monthly_inr: string;
};

export type DbOrder = {
  id: string;
  order_code: string;
  status: string;
  pickup_garment_count: number;
  delivered_garment_count: number | null;
  qc_status: string | null;
  qc_reason: string | null;
  created_at: string;
  updated_at: string;
  scheduled_for: string;
  special_instructions: string | null;
};

export type DbPickupSlot = {
  id: string;
  society_id: string;
  slot_date: string;
  window: string;
  start_time: string;
  end_time: string;
  capacity_total: number;
  capacity_remaining: number;
};

export type DbWallet = {
  id: string;
  balance_inr: string;
};

export type DbWalletTransaction = {
  id: string;
  type: string;
  description: string;
  amount_inr: string;
  created_at: string;
};

export type DbSociety = {
  id: string;
  name: string;
  address_line_1: string | null;
  city: string;
  state: string;
  pincode: string | null;
  status: string;
};

export type DbSupportTicket = {
  id: string;
  ticket_code: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
};

export type DbPaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
};

export type DbBillingInvoice = {
  id: string;
  invoice_code: string;
  billing_month: string;
  billed_on: string;
  amount_inr: string;
  status: string;
};

export type DbAddon = {
  id: string;
  code: string;
  name: string;
  description: string;
  price_inr: string;
  icon: string;
};

export type DbNotification = {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export type DbResidentProfile = {
  user_id: string;
  resident_id: string;
  phone: string;
  full_name: string | null;
  unit_number: string;
  tower_block: string | null;
  alternate_contact: string | null;
  preferred_windows: string[];
  society_id: string;
  society_name: string;
  city: string;
};
