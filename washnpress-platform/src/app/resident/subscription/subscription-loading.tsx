"use client";

export function SubscriptionLoading() {
  return (
    <div className="space-y-6">
      <div className="h-64 animate-pulse rounded-3xl bg-muted" />

      <div className="grid gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[520px] animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
    </div>
  );
}