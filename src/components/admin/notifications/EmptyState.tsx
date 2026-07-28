"use client";

import { BellRing, Plus } from "lucide-react";

type Props = {
  onCreateClick: () => void;
};

export function EmptyState({ onCreateClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
      {/* Large Notification Illustration */}
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#0EA5A8]/10 text-[#0EA5A8]">
        <div className="absolute inset-0 rounded-full bg-[#0EA5A8]/5 animate-ping opacity-75" />
        <BellRing className="h-10 w-10 relative z-10" />
      </div>

      <h3 className="text-xl font-bold text-foreground">
        No notifications yet
      </h3>

      <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
        Create your first broadcast to communicate with residents, societies, or operators across the WashNPress network.
      </p>

      <button
        type="button"
        onClick={onCreateClick}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0EA5A8] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0EA5A8]/90 transition-all hover:scale-[1.02] active:scale-95"
      >
        <Plus className="h-4 w-4" />
        <span>Create Broadcast</span>
      </button>
    </div>
  );
}
