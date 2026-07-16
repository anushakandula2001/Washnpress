import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid w-full gap-6 lg:grid-cols-2">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Sign in to WashNPress</CardTitle>
            <CardDescription>
              Role-aware login is required for resident privacy, operator accountability,
              and admin-level configuration security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Mobile Number</span>
              <Input type="tel" placeholder="Enter 10-digit mobile number" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">One-Time Password</span>
              <Input type="password" placeholder="Enter 6-digit OTP" />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="w-full sm:w-auto">Sign In</Button>
              <Button className="w-full sm:w-auto" variant="outline">
                Resend OTP
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              MVP note: This is UI scaffolding. Existing business logic and API behavior are unchanged.
            </p>
          </CardContent>
        </Card>

        <Card className="order-1 lg:order-2">
          <CardHeader>
            <CardTitle>What this secures</CardTitle>
            <CardDescription>
              Why login should exist before production rollout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Resident data privacy with OTP-based access.</p>
            <p>Operator action audit trail for pickup, QC, and delivery confirmation.</p>
            <p>Admin-only control over pricing, contracts, and support overrides.</p>
            <p>
              Return to <Link href="/">dashboard</Link>.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
