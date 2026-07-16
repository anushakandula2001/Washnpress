import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivityFeed } from "@/components/widgets/activity-feed";
import { CoverageMap } from "@/components/widgets/coverage-map";
import { ImpactBars } from "@/components/widgets/impact-bars";
import { LifecycleWidget } from "@/components/widgets/lifecycle-widget";
import {
  activityFeed,
  expansionOpportunities,
  orderLifecycle,
  societyCoverage,
  sustainabilityImpact,
  womenLedImpact,
} from "@/lib/experience-data";
import { summarizeWaterLogs } from "@/lib/domain";
import { orders, plans, waterLogs } from "@/lib/mock-data";

export default function AdminPage() {
  const summary = summarizeWaterLogs(waterLogs);

  return (
    <AppShell
      title="Admin Console"
      subtitle="Society growth, women-led performance, sustainability, and expansion intelligence"
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Societies" value="74" trend={18} footnote="Cluster model expansion" />
        <KpiCard label="Active Subscriptions" value="8,412" trend={12} footnote="Monthly recurring plans" />
        <KpiCard label="Subscription Revenue" value="INR 82L" trend={9} footnote="Net MRR" />
        <KpiCard label="Complaints / 1K Orders" value="2.1" trend={-3} footnote="Improving weekly" />
      </section>

      <section className="mt-8">
        <LifecycleWidget items={orderLifecycle} />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pricing Configuration</CardTitle>
            <CardDescription>
              Tier pricing and monthly unit economics configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Garments</TableHead>
                  <TableHead>Annual Discount</TableHead>
                  <TableHead className="text-right">Price (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {plan.tier}
                        {plan.mostPopular ? <Badge variant="success">Popular</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell>{plan.garmentCap}</TableCell>
                    <TableCell>{plan.annualDiscountPercent}%</TableCell>
                    <TableCell className="text-right">{plan.monthlyInr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Sustainability Snapshot</CardTitle>
            <CardDescription>
              ESG-ready water and carbon metrics for investor and CSR reporting.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Total garments processed</p>
              <p className="mt-1 text-xl font-semibold">{summary.totalGarments}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Water saved this month</p>
              <p className="mt-1 text-xl font-semibold">{sustainabilityImpact.monthLitersSaved.toLocaleString()} L</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Carbon reduction</p>
              <p className="mt-1 text-xl font-semibold">{sustainabilityImpact.carbonReductionKg.toLocaleString()} kg</p>
            </div>
            <p className="sm:col-span-3 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              ESG export is investor-ready with network impact, tree equivalent, and baseline comparisons.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="success">Women-Led Network</Badge>
            <CardTitle>Community Impact</CardTitle>
            <CardDescription>Micro-unit livelihoods and revenue sharing outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-background p-3">Active units: {womenLedImpact.activeUnits}</div>
            <div className="rounded-lg border border-border bg-background p-3">Operators trained: {womenLedImpact.operatorsTrained}</div>
            <div className="rounded-lg border border-border bg-background p-3">Communities served: {womenLedImpact.communitiesServed}</div>
            <div className="rounded-lg border border-border bg-background p-3">Operator satisfaction: {womenLedImpact.operatorSatisfaction}/5</div>
            <div className="rounded-lg border border-border bg-background p-3">Revenue shared: INR {womenLedImpact.revenueSharedInr.toLocaleString()}</div>
          </CardContent>
        </Card>

        <ImpactBars
          title="Sustainability Trend"
          data={[
            { label: "Today", value: sustainabilityImpact.todayLitersSaved, unit: "L" },
            { label: "Month", value: sustainabilityImpact.monthLitersSaved, unit: "L" },
            { label: "Network", value: sustainabilityImpact.networkLitersSaved, unit: "L" },
            { label: "Trees Equivalent", value: sustainabilityImpact.treesEquivalent, unit: "trees" },
          ]}
        />

        <ActivityFeed items={activityFeed} />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CoverageMap points={societyCoverage} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expansion Opportunities</CardTitle>
            <CardDescription>Demand-qualified societies by revenue potential.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {expansionOpportunities.map((zone) => (
              <div key={zone.society} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{zone.society}</p>
                  <Badge variant={zone.confidence === "High" ? "success" : "secondary"}>{zone.confidence}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{zone.households} households</p>
                <p className="mt-1 text-sm font-semibold">Potential MRR: INR {zone.potentialMrrInr.toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Quality & Complaints Overview</CardTitle>
            <CardDescription>
              Live QC hold watchlist and resident dispute intelligence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">{order.id}</p>
                  <p className="font-medium">{order.residentName}</p>
                  <p className="text-sm text-muted-foreground">{order.flatNumber}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant={order.status === "QC Hold" ? "destructive" : "secondary"}>{order.status}</Badge>
                    <span className="text-xs text-muted-foreground">{order.garments} garments</span>
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
