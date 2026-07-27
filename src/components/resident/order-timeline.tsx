"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TrackingEvent } from "@/lib/resident-data";

export function OrderVerticalTimeline({ events }: { events: TrackingEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((event, idx) => (
        <div key={event.stage} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                event.completed && "border-emerald-500 bg-emerald-500 text-white",
                event.active && "border-primary bg-primary/10 text-primary",
                !event.completed && !event.active && "border-border bg-muted text-muted-foreground",
              )}
            >
              {event.completed ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" />
              )}
            </div>
            {idx < events.length - 1 && (
              <div
                className={cn(
                  "w-0.5 flex-1 min-h-[28px]",
                  event.completed ? "bg-emerald-500" : "bg-border",
                )}
              />
            )}
          </div>
          <div className="pb-5">
            <p
              className={cn(
                "text-sm font-medium",
                event.active ? "text-primary" : event.completed ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {event.label}
            </p>
            {event.timestamp && (
              <p className="mt-0.5 text-xs text-muted-foreground">{event.timestamp}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
