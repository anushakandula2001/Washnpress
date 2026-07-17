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
import {
  nextPickup as defaultPickup,
  residentOrders as defaultOrders,
  walletBalance as defaultBalance,
  walletTransactions as defaultTransactions,
  societies,
  type ResidentPickup,
  type ResidentOrder,
  type WalletTransaction,
  type Society,
} from "@/lib/resident-data";

type ResidentContextValue = {
  balance: number;
  transactions: WalletTransaction[];
  pickup: ResidentPickup;
  orders: ResidentOrder[];
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  selectedSociety: Society | null;
  selectSociety: (society: Society) => void;
  addMoney: (amount: number) => void;
  reschedulePickup: (pickup: ResidentPickup) => void;
  addOrder: (order: ResidentOrder) => void;
  selectedOrder: ResidentOrder | undefined;
};

const STORAGE_KEY = "wnp-resident-wallet";
const SOCIETY_STORAGE_KEY = "wnp-resident-society";

const ResidentContext = createContext<ResidentContextValue | null>(null);

function loadWalletState(): { balance: number; transactions: WalletTransaction[] } {
  if (typeof window === "undefined") {
    return { balance: defaultBalance, transactions: defaultTransactions };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as { balance: number; transactions: WalletTransaction[] };
    }
  } catch {
    // fall through to defaults
  }
  return { balance: defaultBalance, transactions: defaultTransactions };
}

function loadSocietyState(): Society | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SOCIETY_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Society;
  } catch {
    // fall through
  }
  return null;
}

export function ResidentProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(defaultBalance);
  const [transactions, setTransactions] = useState(defaultTransactions);
  const [pickup, setPickup] = useState(defaultPickup);
  const [orders, setOrders] = useState(defaultOrders);
  const [selectedOrderId, setSelectedOrderId] = useState(defaultOrders[0]?.id ?? "");
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);

  useEffect(() => {
    const stored = loadWalletState();
    setBalance(stored.balance);
    setTransactions(stored.transactions);
    const society = loadSocietyState();
    if (society) {
      setSelectedSociety(society);
    } else {
      // Default society so dashboard works without onboarding step
      const defaultSociety = societies.find((s) => s.id === "soc-green-heights") ?? societies[0];
      setSelectedSociety(defaultSociety);
      localStorage.setItem(SOCIETY_STORAGE_KEY, JSON.stringify(defaultSociety));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, transactions }));
  }, [balance, transactions]);

  const selectSociety = useCallback((society: Society) => {
    setSelectedSociety(society);
    localStorage.setItem(SOCIETY_STORAGE_KEY, JSON.stringify(society));
  }, []);

  const addMoney = useCallback((amount: number) => {
    if (amount <= 0) return;
    const txn: WalletTransaction = {
      id: `txn-${Date.now()}`,
      type: "credit",
      description: "Added to Wallet",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      amountInr: amount,
    };
    setBalance((b) => b + amount);
    setTransactions((t) => [txn, ...t]);
  }, []);

  const reschedulePickup = useCallback((newPickup: ResidentPickup) => {
    setPickup(newPickup);
  }, []);

  const addOrder = useCallback((order: ResidentOrder) => {
    setOrders((current) => [order, ...current]);
    setSelectedOrderId(order.id);
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId),
    [orders, selectedOrderId],
  );

  const value = useMemo(
    () => ({
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
      addOrder,
      selectedOrder,
    }),
    [balance, transactions, pickup, orders, selectedOrderId, selectedSociety, selectSociety, addMoney, reschedulePickup, addOrder, selectedOrder],
  );

  return <ResidentContext.Provider value={value}>{children}</ResidentContext.Provider>;
}

export function useResident() {
  const ctx = useContext(ResidentContext);
  if (!ctx) throw new Error("useResident must be used within ResidentProvider");
  return ctx;
}
