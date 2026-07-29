"use client";

export function NotificationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="space-y-2">
              <div className="h-7 w-12 rounded-lg bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted/60" />
            </div>
            <div className="h-12 w-12 rounded-2xl bg-muted" />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm lg:flex-row lg:items-center">
        <div className="h-10 flex-1 rounded-xl bg-muted" />
        <div className="flex items-center gap-2">
          <div className="h-10 w-36 rounded-xl bg-muted" />
          <div className="h-10 w-40 rounded-xl bg-muted" />
          <div className="h-10 w-40 rounded-xl bg-muted" />
        </div>
      </div>

      {/* Two Column Layout Skeleton */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (70%) */}
        <div className="space-y-4 lg:col-span-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex gap-4 flex-1">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-muted" />
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-44 rounded bg-muted" />
                    <div className="h-5 w-16 rounded-full bg-muted" />
                  </div>
                  <div className="h-4 w-full rounded bg-muted/80" />
                  <div className="h-4 w-3/4 rounded bg-muted/50" />
                  <div className="flex items-center gap-4 pt-1">
                    <div className="h-3 w-24 rounded bg-muted" />
                    <div className="h-3 w-32 rounded bg-muted" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
                <div className="h-6 w-20 rounded-full bg-muted" />
                <div className="flex gap-2">
                  <div className="h-8 w-16 rounded-lg bg-muted" />
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column (30%) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="space-y-1">
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted/60" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 w-full rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
