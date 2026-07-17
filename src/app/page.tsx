import Link from "next/link";
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
import { orders, waterLogs } from "@/lib/mock-data";

export default function Home() {
  const waterSummary = summarizeWaterLogs(waterLogs);

  return (
    <AppShell
      title="WashNPress Control Center"
      subtitle="Modern Laundry Operations Platform for society subscriptions, women-led units, and sustainability impact"
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active Orders"
          value={String(orders.length)}
          trend={12}
          footnote="Across all active societies"
        />
        <KpiCard
          label="Water Saved Today"
          value={waterSummary.totalSavedLiters.toFixed(2)}
          trend={18}
          footnote="Liters saved vs conventional baseline"
        />
        <KpiCard
          label="Subscription Revenue"
          value="INR 8.2L"
          trend={9}
          footnote="MRR from active subscription plans"
        />
        <KpiCard
          label="Resident Satisfaction"
          value="4.7/5"
          trend={2}
          footnote="Rolling 30-day CSAT"
        />
      </section>

      <section className="mt-8">
        <LifecycleWidget items={orderLifecycle} />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        <ImpactBars
          title="ESG Impact Dashboard"
          data={[
            { label: "Water Saved Today", value: sustainabilityImpact.todayLitersSaved, unit: "L" },
            { label: "Water Saved This Month", value: sustainabilityImpact.monthLitersSaved, unit: "L" },
            { label: "Network Impact", value: sustainabilityImpact.networkLitersSaved, unit: "L" },
            { label: "Trees Equivalent", value: sustainabilityImpact.treesEquivalent, unit: "trees" },
            { label: "Carbon Reduction", value: sustainabilityImpact.carbonReductionKg, unit: "kg" },
          ]}
        />

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="success">
              Women-Led Operations
            </Badge>
            <CardTitle>Community Impact</CardTitle>
            <CardDescription>
              Women operators run society-level micro-units with revenue sharing and mentorship.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Active Women Units</p>
              <p className="text-xl font-semibold">{womenLedImpact.activeUnits}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Operators Trained</p>
              <p className="text-xl font-semibold">{womenLedImpact.operatorsTrained}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Communities Served</p>
              <p className="text-xl font-semibold">{womenLedImpact.communitiesServed}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Operator Satisfaction</p>
              <p className="text-xl font-semibold">{womenLedImpact.operatorSatisfaction}/5</p>
            </div>
          </CardContent>
        </Card>

        <ActivityFeed items={activityFeed} />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CoverageMap points={societyCoverage} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expansion Opportunities</CardTitle>
            <CardDescription>
              Society-level demand and expansion potential from lead pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {expansionOpportunities.map((zone) => (
              <div key={zone.society} className="rounded-lg border border-border bg-background p-3">
                <p className="font-medium">{zone.society}</p>
                <p className="text-xs text-muted-foreground">{zone.households} households</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <Badge variant={zone.confidence === "High" ? "success" : "secondary"}>
                    {zone.confidence} confidence
                  </Badge>
                  <span className="font-medium">INR {zone.potentialMrrInr.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Resident App
            </Badge>
            <CardTitle>Resident Experience</CardTitle>
            <CardDescription>
              Subscription controls, pickup schedule, garment journey, billing, and support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/resident"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
            >
              Open Resident Portal
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Operator App
            </Badge>
            <CardTitle>Operator Experience</CardTitle>
            <CardDescription>
              Pickups, deliveries, processing queue, QC hold resolution, and earnings dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/operations"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
            >
              Open Operator Portal
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Admin Console
            </Badge>
            <CardTitle>Admin Experience</CardTitle>
            <CardDescription>
              Society growth, complaint trends, women-led unit performance, and expansion planning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
            >
              Open Admin Console
            </Link>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Platform Scope</CardTitle>
          <CardDescription>
            Core workflows implemented: OTP-safe access, slot fallback scheduling,
            QR-backed discrepancy safety, order lifecycle visibility, women-led operations impact,
            sustainability reporting, and society expansion intelligence.
          </CardDescription>
        </CardHeader>
      </Card>
    </AppShell>
  );
}
