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
import type { CurrentSubscription, PaymentMethod, BillingHistory } from "./subscription";

type PlanFromApi = {
  id: string;
  tier: string;
  name: string;
  garmentCap: number;
  turnaroundHours: number;
  monthlyInr: number;
  isCurrent: boolean;
  features: string[];
};

type SubscriptionContextValue = {
  loading: boolean;
  error: string | null;
  subscription: CurrentSubscription | null;
  plans: PlanFromApi[];
  paymentMethods: PaymentMethod[];
  billingHistory: BillingHistory[];
  usageStats: {
    garmentsUsed: number;
    garmentCap: number;
    garmentsLeft: number;
    amountSaved: number;
    waterSavedLiters: number;
    carbonReducedKg: number;
  } | null;
  refresh: () => Promise<void>;
  upgradePlan: (planId: string) => Promise<void>;
  pauseSubscription: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [plans, setPlans] = useState<PlanFromApi[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [usageStats, setUsageStats] = useState<SubscriptionContextValue["usageStats"]>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [subData, plansData] = await Promise.all([
        api.subscription.get(),
        api.subscription.plans(),
      ]);

      const sub = subData.subscription as Record<string, unknown>;
      setSubscription({
        planId: sub.planId as string,
        name: `${sub.tier} Plan`,
        monthlyPrice: sub.monthlyInr as number,
        renewalDate: sub.renewsOn as string,
        usedGarments: sub.garmentsUsed as number,
        totalGarments: sub.garmentCap as number,
        daysLeft: sub.daysRemaining as number,
      });

      setUsageStats(subData.usageStats as SubscriptionContextValue["usageStats"]);
      setPaymentMethods(subData.paymentMethods as unknown as PaymentMethod[]);
      setBillingHistory(
        (subData.billingHistory as Array<Record<string, unknown>>).map((inv) => ({
          id: inv.id as string,
          month: inv.month as string,
          date: inv.date as string,
          amount: inv.amount as number,
          status: inv.status as BillingHistory["status"],
        })),
      );
      setPlans(plansData.plans as PlanFromApi[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upgradePlan = useCallback(async (planId: string) => {
    await api.subscription.upgrade(planId);
    await refresh();
  }, [refresh]);

  const pauseSubscription = useCallback(async () => {
    await api.subscription.pause();
    await refresh();
  }, [refresh]);

  const cancelSubscription = useCallback(async () => {
    await api.subscription.cancel();
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      loading,
      error,
      subscription,
      plans,
      paymentMethods,
      billingHistory,
      usageStats,
      refresh,
      upgradePlan,
      pauseSubscription,
      cancelSubscription,
    }),
    [loading, error, subscription, plans, paymentMethods, billingHistory, usageStats, refresh, upgradePlan, pauseSubscription, cancelSubscription],
  );

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}
