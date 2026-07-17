import Link from "next/link";
import { PhoneOtpForm } from "@/components/auth/phone-otp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid w-full gap-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <PhoneOtpForm mode="register" />
        </div>

        <Card className="order-1 lg:order-2">
          <CardHeader>
            <CardTitle>Join WashNPress</CardTitle>
            <CardDescription>
              Water-conscious laundry for your apartment community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Verify your mobile number with a secure one-time password.</p>
            <p>Complete your profile with society and flat details after verification.</p>
            <p>Schedule pickups, track orders, and manage your subscription from one place.</p>
            <p>
              Return to <Link href="/">home</Link>.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
