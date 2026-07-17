"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, needsOnboarding, type AuthUser } from "@/frontend/api-client";

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const OTP_DIGITS = /^\d{6}$/;
const RESEND_COOLDOWN_SEC = 30;

type Step = "phone" | "otp";

type PhoneOtpFormProps = {
  mode: "login" | "register";
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function PhoneOtpForm({ mode }: PhoneOtpFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const redirectAfterAuth = useCallback(
    (user: AuthUser) => {
      if (needsOnboarding(user)) {
        router.push("/onboarding");
      } else {
        router.push("/resident");
      }
    },
    [router],
  );

  async function handleSendOtp() {
    setError(null);
    if (!INDIAN_MOBILE.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const check = await api.auth.checkPhone(phone);
        if (!check.exists) {
          setError("No account found for this number. Please register first.");
          return;
        }
      }

      await api.auth.sendOtp(phone);
      setStep("otp");
      setOtp("");
      setResendIn(RESEND_COOLDOWN_SEC);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    if (!OTP_DIGITS.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await api.auth.verifyOtp(phone, otp);
      redirectAfterAuth(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (resendIn > 0) return;
    setError(null);
    setLoading(true);
    try {
      await api.auth.sendOtp(phone);
      setResendIn(RESEND_COOLDOWN_SEC);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "login" ? "Sign in to WashNPress" : "Create your account";
  const description =
    mode === "login"
      ? "Enter your mobile number to receive a one-time password."
      : "Register with your mobile number. We will send a one-time password to verify you.";
  const alternateHref = mode === "login" ? "/register" : "/login";
  const alternateLabel =
    mode === "login" ? "New here? Create an account" : "Already have an account? Sign in";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {step === "phone" ? (
          <>
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Mobile Number</span>
              <Input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(normalizePhone(e.target.value))}
                disabled={loading}
              />
            </label>
            <Button className="w-full" onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending…" : "Send OTP"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              OTP sent to <span className="font-medium text-foreground">+91 {phone}</span>
              {" · "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError(null);
                }}
              >
                Change
              </button>
            </p>
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">One-Time Password</span>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={loading}
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="w-full sm:flex-1" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying…" : mode === "login" ? "Sign In" : "Verify & Continue"}
              </Button>
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                onClick={handleResendOtp}
                disabled={loading || resendIn > 0}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
              </Button>
            </div>
            {process.env.NODE_ENV === "development" ? (
              <p className="text-xs text-muted-foreground">
                Dev tip: OTP is printed in the terminal where you ran <code>npm run dev</code>.
              </p>
            ) : null}
          </>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href={alternateHref} className="font-medium text-primary hover:underline">
            {alternateLabel}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
