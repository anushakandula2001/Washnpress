"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PickupSlot = {
  id: string;
  date: string;
  startTime24h: string;
  endTime24h: string;
  window: string;
};

interface PickupSummaryProps {
  slot: PickupSlot | null;
}

function formatSlot(slot: PickupSlot) {
  const date = new Date(`${slot.date}T${slot.startTime24h}`);

  const formattedDate = date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);

    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute
      .toString()
      .padStart(2, "0")} ${period}`;
  };

  return {
    date: formattedDate,
    time: `${formatTime(slot.startTime24h)} - ${formatTime(
      slot.endTime24h
    )}`,
  };
}

export default function PickupSummary({
  slot,
}: PickupSummaryProps) {
  if (!slot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pickup Summary</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">
              No Pickup Slot Selected
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Select a pickup slot to review your schedule.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const details = formatSlot(slot);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pickup Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">
            Pickup Date
          </p>

          <p className="mt-1 font-semibold">
            {details.date}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Pickup Time
          </p>

          <p className="mt-1 font-semibold">
            {details.time}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Pickup Window
          </p>

          <span className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {slot.window}
          </span>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-700">
            ✔ Your operator will arrive during the selected time window.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}