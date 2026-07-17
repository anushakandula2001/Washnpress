"use client";

type PickupSlot = {
  id: string;
  date: string;
  startTime24h: string;
  endTime24h: string;
  window: string;
  remainingCapacity: number;
};

interface PickupSlotListProps {
  slots: PickupSlot[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
}

function formatSlotLabel(
  date: string,
  start: string,
  end: string,
  window: string
) {
  const d = new Date(`${date}T${start}:00`);

  const day = d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
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
    day,
    time: `${formatTime(start)} - ${formatTime(end)}`,
    window,
  };
}

export default function PickupSlotList({
  slots,
  selectedSlotId,
  onSelect,
}: PickupSlotListProps) {
  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">
          No Pickup Slots Available
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          All pickup slots are currently full.
        </p>

        <p className="text-sm text-muted-foreground">
          Please check again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {slots.map((slot) => {
        const label = formatSlotLabel(
          slot.date,
          slot.startTime24h,
          slot.endTime24h,
          slot.window
        );

        const selected = selectedSlotId === slot.id;

        return (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSelect(slot.id)}
            className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
              selected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">
                  {label.day}
                </h4>

                <p className="mt-1 text-sm text-muted-foreground">
                  {label.time}
                </p>

                <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {label.window}
                </span>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">
                  {slot.remainingCapacity} left
                </p>

                {selected && (
                  <div className="mt-2 text-primary">
                    ✓ Selected
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}