type FetchOptions = RequestInit & { params?: Record<string, string> };

export type AuthUser = {
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

export type CheckPhoneResult = {
  exists: boolean;
  isNew: boolean;
  hasProfile?: boolean;
  fullName?: string | null;
};

export type OnboardingPayload = {
  societyId: string;
  fullName: string;
  unitNumber: string;
  towerBlock?: string;
  alternateContact?: string;
  preferredWindows?: string[];
};

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;
  let url = path;
  if (params) {
    const search = new URLSearchParams(params);
    url = `${path}?${search}`;
  }

  const res = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  health: () => apiFetch<{ status: string; services: Record<string, string> }>("/api/health"),

  me: () => apiFetch<{ user: Record<string, unknown> }>("/api/auth/me"),

  profile: {
    get: () => apiFetch<Record<string, unknown>>("/api/resident/profile"),
    update: (data: Record<string, unknown>) =>
      apiFetch("/api/resident/profile", { method: "PUT", body: JSON.stringify(data) }),
  },

  subscription: {
    get: () => apiFetch<{
      subscription: Record<string, unknown>;
      usageStats: Record<string, unknown>;
      paymentMethods: Array<Record<string, unknown>>;
      billingHistory: Array<Record<string, unknown>>;
    }>("/api/subscription"),
    plans: () => apiFetch<{ plans: Array<Record<string, unknown>> }>("/api/subscription/plans"),
    upgrade: (planId: string) =>
      apiFetch("/api/subscription/upgrade", { method: "POST", body: JSON.stringify({ planId }) }),
    pause: () => apiFetch("/api/subscription/pause", { method: "POST" }),
    cancel: () => apiFetch("/api/subscription/cancel", { method: "POST" }),
  },

  orders: {
    list: () => apiFetch<{ orders: Array<Record<string, unknown>> }>("/api/orders"),
    get: (id: string) => apiFetch<{ order: Record<string, unknown> }>(`/api/orders/${id}`),
  },

  wallet: {
    get: () => apiFetch<{
      balance: number;
      transactions: Array<Record<string, unknown>>;
    }>("/api/wallet"),
    topup: (amount: number) =>
      apiFetch("/api/wallet", { method: "POST", body: JSON.stringify({ amount }) }),
  },

  pickups: {
    get: () => apiFetch<{ pickup: Record<string, unknown> | null }>("/api/pickups"),
  },

  schedule: (data: {
    preferredWindows?: string[];
    slotId?: string;
    book?: boolean;
    specialInstructions?: string;
  }) => apiFetch("/api/schedule", { method: "POST", body: JSON.stringify(data) }),

  societies: (city?: string) =>
    apiFetch<{ societies: Array<Record<string, unknown>> }>("/api/societies", {
      params: city ? { city } : undefined,
    }),

  addons: () => apiFetch<{ addons: Array<Record<string, unknown>> }>("/api/addons"),

  notifications: () =>
    apiFetch<{ notifications: Array<Record<string, unknown>>; unreadCount: number }>(
      "/api/notifications",
    ),

  support: {
    list: () => apiFetch<{ tickets: Array<Record<string, unknown>> }>("/api/support/tickets"),
    create: (data: { category: string; description: string; orderId?: string }) =>
      apiFetch("/api/support/tickets", { method: "POST", body: JSON.stringify(data) }),
  },

  sustainability: () => apiFetch<Record<string, number>>("/api/sustainability"),

  auth: {
    sendOtp: (phone: string) =>
      apiFetch<{ sent: boolean; expiresInSeconds: number }>("/api/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),
    verifyOtp: (phone: string, otp: string) =>
      apiFetch<{ user: AuthUser }>("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      }),
    checkPhone: (phone: string) =>
      apiFetch<CheckPhoneResult>("/api/auth/check-phone", { params: { phone } }),
    onboarding: (data: OnboardingPayload) =>
      apiFetch<{ residentId: string; onboarded: boolean; user: AuthUser }>(
        "/api/auth/onboarding",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      ),
    logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
  },
};

export function needsOnboarding(user: AuthUser): boolean {
  return !user.residentId || !user.societyId;
}
