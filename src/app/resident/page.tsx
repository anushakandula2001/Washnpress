import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LifecycleWidget } from "@/components/widgets/lifecycle-widget";
import {
  billingHistory,
  orderLifecycle,
  residentFamilyUsage,
  supportTickets,
  sustainabilityImpact,
} from "@/lib/experience-data";
import { choosePickupSlot, isValidIndianMobile } from "@/lib/domain";
import { orders, pickupSlots, plans, waterLogs } from "@/lib/mock-data";

export default function ResidentPage() {
  const suggestedSlot = choosePickupSlot(
    pickupSlots,
    ["Morning"],
    new Date("2026-07-16T07:00:00"),
  );

  const mobileValid = isValidIndianMobile("9876543210");
  const totalGarments = orders.reduce((sum, order) => sum + order.garments, 0);
  const residentWaterSaved = waterLogs
    .map((item) => item.garmentCount * item.baselineLitersPerGarment - item.actualLitersUsed)
    .reduce((sum, item) => sum + item, 0)
    .toFixed(2);

  return (
    <AppShell
      title="Resident Portal"
      subtitle="Subscription management, pickup planning, laundry progress, billing, and support"
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Subscription" value="Standard" trend={12} footnote="Renews in 9 days" />
        <KpiCard label="Garment Usage" value={`${totalGarments}/60`} trend={8} footnote="Family cycle usage" />
        <KpiCard label="Water Saved" value={`${residentWaterSaved} L`} trend={18} footnote="This month" />
        <KpiCard label="Support SLA" value="6h" trend={-3} footnote={mobileValid ? "OTP profile verified" : "Verification needed"} />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="success">Active Plan</Badge>
            <CardTitle>Subscription Overview</CardTitle>
            <CardDescription>
              Family plan utilization, auto-renewal status, and cycle details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Standard Family Cycle</p>
                  <Badge variant="secondary">Auto-Renew ON</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">INR 2199 monthly | 36h turnaround | 60 garments cap</p>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${Math.min((totalGarments / 60) * 100, 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{totalGarments} garments consumed out of 60</p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Cap</TableHead>
                    <TableHead>Turnaround</TableHead>
                    <TableHead className="text-right">Price (INR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {plan.tier}
                          {plan.mostPopular ? <Badge variant="success">Popular</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell>{plan.garmentCap}</TableCell>
                      <TableCell>{plan.turnaroundHours}h</TableCell>
                      <TableCell className="text-right">{plan.monthlyInr}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Pickup</CardTitle>
            <CardDescription>
              Society slot engine auto-selects next available pickup when preferred window is full.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Preferred Window</span>
                <Input value="Morning" readOnly aria-readonly />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Mobile Number</span>
                <Input value="9876543210" readOnly aria-readonly />
              </label>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Suggested Slot</p>
              <p className="font-semibold text-foreground">
                {suggestedSlot
                  ? `${suggestedSlot.date} ${suggestedSlot.startTime24h}-${suggestedSlot.endTime24h} (${suggestedSlot.window})`
                  : "No slots available"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Confirmation sent via push + SMS + WhatsApp.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="w-full sm:w-auto">Confirm Pickup</Button>
              <Button className="w-full sm:w-auto" variant="outline">Reschedule</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <LifecycleWidget items={orderLifecycle} />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Family Usage</CardTitle>
            <CardDescription>Member-level garment usage in current cycle.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {residentFamilyUsage.map((member) => {
                const percent = Math.min(Math.round((member.garments / member.cap) * 100), 100);
                return (
                  <div key={member.member}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <p className="font-medium">{member.member}</p>
                      <p className="text-muted-foreground">{member.garments}/{member.cap}</p>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing & Invoices</CardTitle>
            <CardDescription>Recent billing cycles and payment status.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((invoice) => (
                  <TableRow key={invoice.cycle}>
                    <TableCell>{invoice.cycle}</TableCell>
                    <TableCell className="text-right">INR {invoice.amountInr}</TableCell>
                    <TableCell>
                      <Badge variant="success">{invoice.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support Desk</CardTitle>
            <CardDescription>Ticket status and guaranteed resolution SLA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{ticket.id}</p>
                  <Badge variant={ticket.status === "Resolved" ? "success" : "secondary"}>{ticket.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{ticket.issue}</p>
                <p className="mt-1 text-xs text-muted-foreground">SLA: {ticket.slaHours} hours</p>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-sm font-medium">Sustainability Promise</p>
              <p className="text-xs text-muted-foreground">{sustainabilityImpact.monthLitersSaved.toLocaleString()} liters saved in your network this month.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>Live garment journey by order.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">{order.id}</p>
                  <p className="font-semibold text-foreground">
                    {order.residentName} ({order.flatNumber})
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant={order.status === "QC Hold" ? "destructive" : "secondary"}>{order.status}</Badge>
                    <span className="text-sm text-muted-foreground">{order.garments} items</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
