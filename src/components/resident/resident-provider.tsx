"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type AuthUser } from "@/frontend/api-client";
import type {
  ResidentOrder,
  ResidentPickup,
  ResidentProfile,
  ResidentSubscription,
  Society,
  TrackingEvent,
  WalletTransaction,
  OrderStage,
} from "@/lib/resident-data";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  unread: boolean;
};

type ResidentContextValue = {
  loading: boolean;
  profile: ResidentProfile | null;
  user: AuthUser | null;
  subscription: ResidentSubscription | null;
  balance: number;
  transactions: WalletTransaction[];
  pickup: ResidentPickup;
  orders: ResidentOrder[];
  notifications: NotificationItem[];
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  selectedSociety: Society | null;
  selectSociety: (society: Society) => void;
  addMoney: (amount: number) => Promise<void>;
  reschedulePickup: (pickup: ResidentPickup) => void;
  selectedOrder: ResidentOrder | undefined;
  refresh: () => Promise<void>;
  getOrderTracking: (orderId: string) => Promise<TrackingEvent[]>;
};

const SOCIETY_STORAGE_KEY = "wnp-resident-society";

const ResidentContext = createContext<ResidentContextValue | null>(null);

const EMPTY_PICKUP: ResidentPickup = {
  id: "",
  date: "",
  startTime: "",
  endTime: "",
  window: "Morning",
  status: "scheduled",
};

function mapOrder(o: Record<string, unknown>): ResidentOrder {
  return {
    id: o.id as string,
    placedDate: o.placedDate as string,
    pickupDate: o.pickupDate as string,
    pickupTime: o.pickupTime as string,
    garments: o.garments as number,
    addons: (o.addons as string[]) ?? [],
    status: o.status as ResidentOrder["status"],
    displayStatus: o.displayStatus as string,
    badgeVariant: o.badgeVariant as ResidentOrder["badgeVariant"],
    stages: o.stages as OrderStage[],
    currentStage: o.currentStage as OrderStage,
  };
}

const TRACK_STAGES = [
  "Order Placed",
  "Pickup Scheduled",
  "Picked Up",
  "Washing",
  "Drying",
  "Ironing",
  "Quality Check",
  "Packing",
  "Out For Delivery",
  "Delivered",
] as const;

function normalizeStatus(raw: string): string {
  const s = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    scheduled: "Pickup Scheduled",
    "order placed": "Order Placed",
    "pickup scheduled": "Pickup Scheduled",
    "picked up": "Picked Up",
    washing: "Washing",
    "in wash": "Washing",
    wash: "Washing",
    drying: "Drying",
    dry: "Drying",
    ironing: "Ironing",
    iron: "Ironing",
    "quality check": "Quality Check",
    qc: "Quality Check",
    "qc hold": "Quality Check",
    packing: "Packing",
    "ready for delivery": "Packing",
    "out for delivery": "Out For Delivery",
    delivered: "Delivered",
  };
  return map[s] ?? raw;
}

function eventsToTimeline(
  order: ResidentOrder,
  events: Array<{
    event_type: string;
    event_payload: Record<string, unknown>;
    created_at: string;
  }>,
): TrackingEvent[] {
  const statusTimes = new Map<string, string>();

  for (const e of events) {
    const payloadStatus = e.event_payload.status as string | undefined;
    const fromType =
      e.event_type === "order_placed"
        ? "Order Placed"
        : e.event_type === "pickup_scheduled"
          ? "Pickup Scheduled"
          : undefined;
    const status = payloadStatus ? normalizeStatus(payloadStatus) : fromType;
    if (!status) continue;
    const created =
      typeof e.created_at === "string"
        ? e.created_at
        : new Date(e.created_at).toISOString();
    if (!statusTimes.has(status)) statusTimes.set(status, created);
  }

  // Also mark current order status
  const current = normalizeStatus(order.displayStatus || order.status);
  let currentIdx = TRACK_STAGES.findIndex((s) => s === current);
  if (currentIdx < 0 && order.status === "Delivered") currentIdx = TRACK_STAGES.length - 1;
  if (currentIdx < 0) {
    // fall back to last known event
    for (let i = TRACK_STAGES.length - 1; i >= 0; i -= 1) {
      if (statusTimes.has(TRACK_STAGES[i])) {
        currentIdx = i;
        break;
      }
    }
  }
  if (currentIdx < 0) currentIdx = 0;

  return TRACK_STAGES.map((label, idx) => {
    const ts = statusTimes.get(label) ?? null;
    const completed = idx < currentIdx || order.status === "Delivered";
    const active = idx === currentIdx && order.status !== "Delivered";
    return {
      stage: label,
      label,
      timestamp: ts
        ? new Date(ts).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : active
          ? "In progress"
          : null,
      completed,
      active,
    };
  });
}

export function ResidentProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [subscription, setSubscription] = useState<ResidentSubscription | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [pickup, setPickup] = useState<ResidentPickup | null>(null);
  const [orders, setOrders] = useState<ResidentOrder[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [meData, profileData, walletData, ordersData, pickupData, societiesData, notifData] =
        await Promise.all([
          api.me(),
          api.profile.get().catch(() => null),
          api.wallet.get().catch(() => ({ balance: 0, transactions: [] })),
          api.orders.list().catch(() => ({ orders: [] })),
          api.pickups.get().catch(() => ({ pickup: null })),
          api.societies().catch(() => ({ societies: [] })),
          api.notifications().catch(() => ({ notifications: [], unreadCount: 0 })),
        ]);

      const authUser = meData.user as unknown as AuthUser;
      setUser(authUser);

      if (profileData) {
        setProfile({
          name: (profileData.name as string) || authUser.fullName || "Resident",
          flatNumber: (profileData.flatNumber as string) || authUser.unitNumber || "",
          tower: (profileData.tower as string) || authUser.towerBlock || "",
          floor: (profileData.floor as string) || null,
          mobile: (profileData.mobile as string) || authUser.phone,
          society: (profileData.society as string) || authUser.societyName || "",
          residentCode: (profileData.residentCode as string) || null,
          email: (profileData.email as string) || null,
          gender: (profileData.gender as string) || null,
        });
      } else {
        setProfile({
          name: authUser.fullName || "Resident",
          flatNumber: authUser.unitNumber || "",
          tower: authUser.towerBlock || "",
          floor: null,
          mobile: authUser.phone,
          society: authUser.societyName || "",
          residentCode: null,
          email: null,
          gender: null,
        });
      }

      try {
        const sub = await api.subscription.get();
        const s = sub.subscription;
        setSubscription({
          planName: (s.planName as string) ?? "Plan",
          garmentsUsed: (s.garmentsUsed as number) ?? 0,
          garmentCap: (s.garmentCap as number) ?? 0,
          daysRemaining: (s.daysRemaining as number) ?? 0,
          renewsOn: (s.renewsOn as string) ?? "",
          monthlyInr: (s.monthlyInr as number) ?? 0,
        });
      } catch {
        setSubscription(null);
      }

      setBalance(walletData.balance);
      setTransactions(
        walletData.transactions.map((t) => ({
          id: t.id as string,
          type: t.type as "credit" | "debit",
          description: t.description as string,
          date: t.date as string,
          amountInr: t.amountInr as number,
        })),
      );

      const mappedOrders = ordersData.orders.map((o) => mapOrder(o as Record<string, unknown>));
      setOrders(mappedOrders);
      setSelectedOrderId((prev) => prev || mappedOrders[0]?.id || "");

      if (pickupData.pickup) {
        const p = pickupData.pickup;
        setPickup({
          id: p.id as string,
          date: p.date as string,
          startTime: p.startTime as string,
          endTime: p.endTime as string,
          window: p.window as string,
          status: p.status as ResidentPickup["status"],
        });
      } else {
        setPickup(null);
      }

      setNotifications(
        notifData.notifications.map((n) => ({
          id: n.id as string,
          title: n.title as string,
          body: n.body as string,
          unread: Boolean(n.unread),
        })),
      );

      const stored =
        typeof window !== "undefined" ? localStorage.getItem(SOCIETY_STORAGE_KEY) : null;
      if (stored) {
        setSelectedSociety(JSON.parse(stored) as Society);
      } else if (societiesData.societies.length > 0) {
        const first = societiesData.societies[0] as Record<string, unknown>;
        const society: Society = {
          id: first.id as string,
          name: first.name as string,
          address: (first.address as string) || "",
          city: (first.city as string) || "",
          residents: 0,
          distanceKm: 0,
          status: (first.status as Society["status"]) || "Active",
        };
        setSelectedSociety(society);
        localStorage.setItem(SOCIETY_STORAGE_KEY, JSON.stringify(society));
      }
    } catch {
      // Keep last known state; avoid reintroducing mock defaults.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectSociety = useCallback((society: Society) => {
    setSelectedSociety(society);
    localStorage.setItem(SOCIETY_STORAGE_KEY, JSON.stringify(society));
  }, []);

  const addMoney = useCallback(
    async (amount: number) => {
      if (amount <= 0) return;
      await api.wallet.topup(amount);
      await refresh();
    },
    [refresh],
  );

  const reschedulePickup = useCallback((newPickup: ResidentPickup) => {
    setPickup(newPickup);
  }, []);

  const getOrderTracking = useCallback(
    async (orderId: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return [];
      try {
        const data = await api.orders.tracking(orderId);
        return eventsToTimeline(order, data.events);
      } catch {
        return order.stages.map((stage, idx) => {
          const stageIndex = order.stages.indexOf(order.currentStage);
          return {
            stage,
            label: stage,
            timestamp: null,
            completed: idx < stageIndex,
            active: idx === stageIndex,
          };
        });
      }
    },
    [orders],
  );

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId),
    [orders, selectedOrderId],
  );

  const value = useMemo(
    () => ({
      loading,
      profile,
      user,
      subscription,
      balance,
      transactions,
      pickup: pickup ?? EMPTY_PICKUP,
      orders,
      notifications,
      selectedOrderId,
      setSelectedOrderId,
      selectedSociety,
      selectSociety,
      addMoney,
      reschedulePickup,
      selectedOrder,
      refresh,
      getOrderTracking,
    }),
    [
      loading,
      profile,
      user,
      subscription,
      balance,
      transactions,
      pickup,
      orders,
      notifications,
      selectedOrderId,
      selectedSociety,
      selectSociety,
      addMoney,
      reschedulePickup,
      selectedOrder,
      refresh,
      getOrderTracking,
    ],
  );

  return <ResidentContext.Provider value={value}>{children}</ResidentContext.Provider>;
}

export function useResident() {
  const ctx = useContext(ResidentContext);
  if (!ctx) throw new Error("useResident must be used within ResidentProvider");
  return ctx;
}
