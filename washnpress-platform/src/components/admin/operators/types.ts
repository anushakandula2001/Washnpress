export type OperatorRow = {
  id: string;
  operator_code: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  status: string;
  user_status?: string;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  address_line_1?: string | null;
  societies: string[];
  society_ids?: string[];
  residents_count?: number;
  orders_managed?: number;
  created_at?: string;
  joined_at?: string | null;
  last_login_at: string | null;
};

export type SocietyOpt = { id: string; name: string; city?: string | null };

export type OperatorFilters = {
  q: string;
  societyId: string;
  status: string;
  city: string;
  joinedFrom: string;
  joinedTo: string;
  sortBy: string;
};

export const defaultOperatorFilters: OperatorFilters = {
  q: "",
  societyId: "",
  status: "",
  city: "",
  joinedFrom: "",
  joinedTo: "",
  sortBy: "newest",
};

export type CreateOperatorForm = {
  fullName: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  societyIds: string[];
};

export const emptyCreateOperatorForm: CreateOperatorForm = {
  fullName: "",
  phone: "",
  email: "",
  status: "active",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  societyIds: [],
};
