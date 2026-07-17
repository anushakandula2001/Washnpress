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
import { api } from "@/frontend/api-client";
import {
  nextPickup as defaultPickup,
  residentOrders as defaultOrders,
  walletBalance as defaultBalance,
  walletTransactions as defaultTransactions,
  societies as defaultSocieties,
  type ResidentPickup,
  type ResidentOrder,
  type WalletTransaction,
  type Society,
} from "@/lib/resident-data";

type ResidentContextValue = {
  loading: boolean;
  balance: number;
  transactions: WalletTransaction[];
  pickup: ResidentPickup;
  orders: ResidentOrder[];
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  selectedSociety: Society | null;
  selectSociety: (society: Society) => void;
  addMoney: (amount: number) => Promise<void>;
  reschedulePickup: (pickup: ResidentPickup) => void;
  selectedOrder: ResidentOrder | undefined;
  refresh: () => Promise<void>;
};

const SOCIETY_STORAGE_KEY = "wnp-resident-society";

const ResidentContext = createContext<ResidentContextValue | null>(null);

export function ResidentProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(defaultBalance);
  const [transactions, setTransactions] = useState(defaultTransactions);
  const [pickup, setPickup] = useState(defaultPickup);
  const [orders, setOrders] = useState(defaultOrders);
  const [selectedOrderId, setSelectedOrderId] = useState(defaultOrders[0]?.id ?? "");
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [walletData, ordersData, pickupData, societiesData] = await Promise.all([
        api.wallet.get(),
        api.orders.list(),
        api.pickups.get(),
        api.societies(),
      ]);

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

      setOrders(
        (ordersData.orders as Array<Record<string, unknown>>).map((o) => ({
          id: o.id as string,
          placedDate: o.placedDate as string,
          pickupDate: o.pickupDate as string,
          pickupTime: o.pickupTime as string,
          garments: o.garments as number,
          addons: (o.addons as string[]) ?? [],
          status: o.status as ResidentOrder["status"],
          displayStatus: o.displayStatus as string,
          badgeVariant: o.badgeVariant as ResidentOrder["badgeVariant"],
          stages: o.stages as ResidentOrder["stages"],
          currentStage: o.currentStage as ResidentOrder["currentStage"],
        })),
      );

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
      }

      const stored = typeof window !== "undefined"
        ? localStorage.getItem(SOCIETY_STORAGE_KEY)
        : null;

      if (stored) {
        setSelectedSociety(JSON.parse(stored) as Society);
      } else if (societiesData.societies.length > 0) {
        const first = societiesData.societies[0] as Record<string, unknown>;
        const society: Society = {
          id: first.id as string,
          name: first.name as string,
          address: first.address as string,
          city: first.city as string,
          residents: 0,
          distanceKm: 0,
          status: first.status as Society["status"],
        };
        setSelectedSociety(society);
        localStorage.setItem(SOCIETY_STORAGE_KEY, JSON.stringify(society));
      }
    } catch {
      // Fall back to static defaults when API/DB unavailable
      setOrders(defaultOrders);
      setBalance(defaultBalance);
      setTransactions(defaultTransactions);
      setPickup(defaultPickup);
      const defaultSociety = defaultSocieties.find((s) => s.id === "soc-green-heights") ?? defaultSocieties[0];
      setSelectedSociety(defaultSociety);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectSociety = useCallback((society: Society) => {
    setSelectedSociety(society);
    localStorage.setItem(SOCIETY_STORAGE_KEY, JSON.stringify(society));
  }, []);

  const addMoney = useCallback(async (amount: number) => {
    if (amount <= 0) return;
    try {
      const result = await api.wallet.topup(amount);
      setBalance((result as { balance: number }).balance);
      await refresh();
    } catch {
      const txn: WalletTransaction = {
        id: `txn-${Date.now()}`,
        type: "credit",
        description: "Added to Wallet",
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        amountInr: amount,
      };
      setBalance((b) => b + amount);
      setTransactions((t) => [txn, ...t]);
    }
  }, [refresh]);

  const reschedulePickup = useCallback((newPickup: ResidentPickup) => {
    setPickup(newPickup);
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId),
    [orders, selectedOrderId],
  );

  const value = useMemo(
    () => ({
      loading,
      balance,
      transactions,
      pickup,
      orders,
      selectedOrderId,
      setSelectedOrderId,
      selectedSociety,
      selectSociety,
      addMoney,
      reschedulePickup,
      selectedOrder,
      refresh,
    }),
    [loading, balance, transactions, pickup, orders, selectedOrderId, selectedSociety, selectSociety, addMoney, reschedulePickup, selectedOrder, refresh],
  );

  return <ResidentContext.Provider value={value}>{children}</ResidentContext.Provider>;
}

export function useResident() {
  const ctx = useContext(ResidentContext);
  if (!ctx) throw new Error("useResident must be used within ResidentProvider");
  return ctx;
}
