export type ResidentRow = {
  id: string;
  resident_code: string | null;
  full_name: string | null;
  phone: string;
  email: string | null;
  society_id: string;
  society_name: string;
  tower_name: string | null;
  tower_block: string | null;
  flat_number: string | null;
  unit_number: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  wallet_balance: number;
  orders_count: number;
  created_at: string;
  status: string;
  last_login_at?: string | null;
  reward_points?: number;
};

export type SocietyOpt = { id: string; name: string };

export type ResidentFilters = {
  q: string;
  societyId: string;
  tower: string;
  floor: string;
  subscription: string;
  status: string;
  walletMin: string;
  walletMax: string;
  regFrom: string;
  regTo: string;
  gender: string;
  sortBy: string;
};

export const defaultResidentFilters: ResidentFilters = {
  q: "",
  societyId: "",
  tower: "",
  floor: "",
  subscription: "",
  status: "",
  walletMin: "",
  walletMax: "",
  regFrom: "",
  regTo: "",
  gender: "",
  sortBy: "newest",
};
