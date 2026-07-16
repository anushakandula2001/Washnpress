"use client";

import Link from "next/link";
import { ResidentShell } from "@/components/resident/resident-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { residentSubscription } from "@/lib/resident-data";
import { plans } from "@/lib/mock-data";
import { billingHistory } from "@/lib/experience-data";

export default function SubscriptionPage() {
  const usagePercent = Math.round(
    (residentSubscription.garmentsUsed / residentSubscription.garmentCap) * 100,
  );

  return (
    <ResidentShell greeting="Subscription" subtitle="Manage your plan and billing">
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="success">Active</Badge>
            <CardTitle>{residentSubscription.planName}</CardTitle>
            <CardDescription>
              ₹{residentSubscription.monthlyInr}/month · Renews on {residentSubscription.renewsOn}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-1 flex justify-between text-sm">
              <span>{residentSubscription.garmentsUsed} / {residentSubscription.garmentCap} garments used</span>
              <span className="font-medium text-primary">{residentSubscription.daysRemaining} days left</span>
            </div>
            <div className="h-3 rounded-full bg-muted">
              <div className="h-3 rounded-full bg-primary" style={{ width: `${usagePercent}%` }} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm">Upgrade Plan</Button>
              <Button size="sm" variant="outline">Pause Subscription</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
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
                {billingHistory.map((inv) => (
                  <TableRow key={inv.cycle}>
                    <TableCell>{inv.cycle}</TableCell>
                    <TableCell className="text-right">₹{inv.amountInr}</TableCell>
                    <TableCell><Badge variant="success">{inv.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Compare plans and switch anytime</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Garment Cap</TableHead>
                <TableHead>Turnaround</TableHead>
                <TableHead className="text-right">Monthly (₹)</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {plan.tier}
                      {plan.mostPopular && <Badge variant="success">Popular</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{plan.garmentCap}</TableCell>
                  <TableCell>{plan.turnaroundHours}h</TableCell>
                  <TableCell className="text-right">{plan.monthlyInr}</TableCell>
                  <TableCell className="text-right">
                    {plan.tier === "Standard" ? (
                      <Badge>Current</Badge>
                    ) : (
                      <Button size="sm" variant="outline">Switch</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ResidentShell>
  );
}
