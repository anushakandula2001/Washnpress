"use client";

import { AlertTriangle, TrendingUp, Calendar, Crown, Wallet, Star } from "lucide-react";

export function ResidentAIInsights({ data }: { data: Record<string, unknown> }) {
  const r = data.resident as Record<string, unknown>;
  const orders = (data.orders as Array<Record<string, unknown>>) ?? [];
  const balance = Number(r.wallet_balance ?? 0);
  const lastLogin = r.last_login_at ? new Date(String(r.last_login_at)) : null;
  const now = new Date();
  const daysSinceLogin = lastLogin ? Math.floor((now.getTime() - lastLogin.getTime()) / 86400000) : 999;
  const weekendOrders = orders.filter((o) => {
    const d = new Date(String(o.created_at)).getDay();
    return d === 0 || d === 6;
  }).length;

  const insights: Array<{ icon: typeof Star; title: string; desc: string; color: string }> = [];

  if (daysSinceLogin > 30) {
    insights.push({
      icon: AlertTriangle,
      title: `Inactive for ${daysSinceLogin} days`,
      desc: "Likely to churn — send re-engagement offer",
      color: "border-red-500/30 bg-red-500/5",
    });
  }
  if (weekendOrders > orders.length / 2 && orders.length > 2) {
    insights.push({
      icon: Calendar,
      title: "Frequently orders on weekends",
      desc: "Schedule pickup reminders on Friday evenings",
      color: "border-sky-500/30 bg-sky-500/5",
    });
  }
  if (!data.subscription) {
    insights.push({
      icon: Crown,
      title: "Recommend Premium Plan",
      desc: "High order volume — subscription could save 20%",
      color: "border-amber-500/30 bg-amber-500/5",
    });
  }
  if (balance < 100) {
    insights.push({
      icon: Wallet,
      title: "Wallet low",
      desc: "Suggest top-up before next order",
      color: "border-orange-500/30 bg-orange-500/5",
    });
  }
  if (orders.length > 10) {
    insights.push({
      icon: Star,
      title: "High-value customer",
      desc: `${orders.length} orders — VIP treatment recommended`,
      color: "border-emerald-500/30 bg-emerald-500/5",
    });
  }
  if (insights.length === 0) {
    insights.push({
      icon: TrendingUp,
      title: "Healthy engagement",
      desc: "Resident activity is within normal range",
      color: "border-primary/30 bg-primary/5",
    });
  }

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2">
      {insights.map((ins, i) => {
        const Icon = ins.icon;
        return (
          <div key={i} className={`rounded-xl border p-4 ${ins.color}`}>
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{ins.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{ins.desc}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
