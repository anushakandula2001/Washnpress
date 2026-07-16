import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KanbanBoard } from "@/components/widgets/kanban-board";
import { LifecycleWidget } from "@/components/widgets/lifecycle-widget";
import { ActivityFeed } from "@/components/widgets/activity-feed";
import {
  activityFeed,
  operatorPerformanceByHour,
  operatorQueues,
  orderLifecycle,
  sustainabilityImpact,
  womenLedImpact,
} from "@/lib/experience-data";
import { canMarkDelivered } from "@/lib/domain";
import { orders } from "@/lib/mock-data";

export default function OperationsPage() {
  const deliveryCheck = canMarkDelivered(18, 18);
  const blockedCheck = canMarkDelivered(12, 10);

  return (
    <AppShell
      title="Operations Portal"
      subtitle="Field-optimized workflow for pickups, processing, QC, delivery, and earnings"
    >
      <Alert className="mb-4 border-primary/30 bg-primary/10">
        <AlertTitle>Offline Sync: Stable</AlertTitle>
        <AlertDescription>
          No pending actions. Last sync completed 40 seconds ago.
        </AlertDescription>
      </Alert>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Today Pickups" value="31" trend={12} footnote="Against plan: 28" />
        <KpiCard label="Today Deliveries" value="24" trend={18} footnote="On-time delivery 96%" />
        <KpiCard label="Pending QC" value="2" trend={-3} footnote="Auto ticketing enabled" />
        <KpiCard label="Operator Earnings" value="INR 4,820" trend={9} footnote="Projected payout this cycle" />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>One-hand actions for field operators.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button className="h-12">Mark Picked Up</Button>
            <Button className="h-12" variant="outline">Scan QR</Button>
            <Button className="h-12" variant="outline">Move to Wash</Button>
            <Button className="h-12" variant="outline">Mark Delivered</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity by Hour</CardTitle>
            <CardDescription>Garment batches handled across shift window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {operatorPerformanceByHour.map((slot) => (
              <div key={slot.hour}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{slot.hour}</span>
                  <span className="font-medium">{slot.value} batches</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary to-cyan-400"
                    style={{ width: `${(slot.value / 15) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact Snapshot</CardTitle>
            <CardDescription>Operational and social contribution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-lg border border-border bg-background p-3">
              Water saved today: {sustainabilityImpact.todayLitersSaved.toLocaleString()} L
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              Women-led units active: {womenLedImpact.activeUnits}
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              Average QC pass: 97.4%
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <KanbanBoard
          columns={[
            { title: "Scheduled", items: operatorQueues.scheduled },
            { title: "Picked Up", items: operatorQueues.pickedUp },
            { title: "Processing", items: operatorQueues.processing },
            { title: "QC", items: operatorQueues.qc },
            { title: "Delivery", items: operatorQueues.delivery },
          ]}
        />
      </section>

      <section className="mt-8">
        <LifecycleWidget items={orderLifecycle} />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Queue</CardTitle>
            <CardDescription>Bookings grouped by operational status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{order.id}</p>
                  <Badge variant="secondary">{order.garments} garments</Badge>
                </div>
                <p className="font-semibold text-foreground">
                  {order.flatNumber} | Water used {order.waterUsedLiters}L
                </p>
                <div className="mt-2">
                  <Badge variant={order.status === "QC Hold" ? "destructive" : "secondary"}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Guard Rails</CardTitle>
            <CardDescription>
              Delivery is blocked automatically on garment count mismatch.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              Match check (18 vs 18): <strong>{deliveryCheck.ok ? "Allowed" : "Blocked"}</strong>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              Mismatch check (12 vs 10): <strong>{blockedCheck.ok ? "Allowed" : "Blocked"}</strong>
            </div>
            {!blockedCheck.ok ? (
              <Alert className="border-destructive/30 bg-destructive/5">
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>{blockedCheck.reason}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2" aria-label="Loading preview">
              <p className="text-sm text-muted-foreground">Syncing queued actions</p>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <ActivityFeed items={activityFeed} />
      </section>

      <button
        aria-label="Open QR scanner"
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-xl ring-4 ring-primary/20 md:bottom-8 md:right-8"
      >
        QR
      </button>
    </AppShell>
  );
}
