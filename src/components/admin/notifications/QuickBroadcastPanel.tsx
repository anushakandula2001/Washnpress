"use client";

import {
  Users,
  Building2,
  ShieldCheck,
  User,
  Lightbulb,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { NotificationAudience } from "./types";

type Props = {
  onSelectQuickAudience: (audience: NotificationAudience) => void;
};

export function QuickBroadcastPanel({ onSelectQuickAudience }: Props) {
  const options = [
    {
      id: "all_residents" as NotificationAudience,
      title: "To All Residents",
      description: "Send to all residents across all societies",
      icon: Users,
      accentBg: "bg-[#0EA5A8]/10 text-[#0EA5A8]",
    },
    {
      id: "society" as NotificationAudience,
      title: "To Specific Society",
      description: "Send to one or more selected societies",
      icon: Building2,
      accentBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      id: "operator" as NotificationAudience,
      title: "To Operators",
      description: "Send to all delivery operators",
      icon: ShieldCheck,
      accentBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      id: "resident" as NotificationAudience,
      title: "To Individual Resident",
      description: "Send to a specific resident or operator",
      icon: User,
      accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="sticky top-20 space-y-4">
      {/* Quick Broadcast Options Panel */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>Quick Broadcast</span>
            <span className="flex h-2 w-2 rounded-full bg-[#0EA5A8]" />
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Send a quick message to your audience
          </p>
        </div>

        <div className="space-y-2.5">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectQuickAudience(opt.id)}
                className="group flex w-full items-center justify-between rounded-xl border border-border bg-background p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0EA5A8]/50 hover:bg-[#0EA5A8]/5 hover:shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${opt.accentBg} transition-transform duration-200 group-hover:scale-105`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-[#0EA5A8] transition-colors truncate">
                      {opt.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {opt.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#0EA5A8]" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Tips Card */}
      <div className="rounded-2xl border border-[#0EA5A8]/20 bg-[#0EA5A8]/5 p-4 text-foreground shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0EA5A8]/15 text-[#0EA5A8]">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-[#0EA5A8]">Tips</p>
            <p className="text-muted-foreground leading-relaxed">
              Use specific audience targeting to ensure your message reaches the right people and reduces notification fatigue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
