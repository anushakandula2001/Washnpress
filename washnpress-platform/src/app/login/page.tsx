import Link from "next/link";
import { PhoneOtpForm } from "@/components/auth/phone-otp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid w-full gap-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <PhoneOtpForm mode="login" />
        </div>

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
