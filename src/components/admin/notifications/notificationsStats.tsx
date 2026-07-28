"use client";

import { SendHorizontal, CheckCircle2, Clock, FileText } from "lucide-react";

type Props = {
  total: number;
  delivered: number;
  scheduled: number;
  drafts: number;
};

export function NotificationStats({
  total,
  delivered,
  scheduled,
  drafts,
}: Props) {
  const cards = [
    {
      title: "Total Broadcasts",
      value: total,
      helperText: "All time messages",
      icon: SendHorizontal,
      iconBg: "bg-[#0EA5A8]/10 text-[#0EA5A8]",
      accentBorder: "hover:border-[#0EA5A8]/40",
    },
    {
      title: "Delivered",
      value: delivered,
      helperText: "Delivered to audience",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      accentBorder: "hover:border-emerald-500/40",
    },
    {
      title: "Scheduled",
      value: scheduled,
      helperText: "To be sent later",
      icon: Clock,
      iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      accentBorder: "hover:border-orange-500/40",
    },
    {
      title: "Drafts",
      value: drafts,
      helperText: "Not sent yet",
      icon: FileText,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      accentBorder: "hover:border-blue-500/40",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`group flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.accentBorder}`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3 sm:hidden">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {card.value}
              </h2>
              <p className="text-sm font-semibold text-foreground/90">
                {card.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {card.helperText}
              </p>
            </div>

            <div className={`hidden h-12 w-12 items-center justify-center rounded-2xl sm:flex ${card.iconBg} transition-transform duration-200 group-hover:scale-105`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}