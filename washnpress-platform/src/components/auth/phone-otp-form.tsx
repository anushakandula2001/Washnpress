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
import { homePathForUser, primaryRole } from "@/lib/auth-redirect";

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const OTP_DIGITS = /^\d{6}$/;
const RESEND_COOLDOWN_SEC = 30;
const MAX_RESENDS = 5;

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
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const redirectAfterAuth = useCallback(
    (user: AuthUser) => {
      const role = primaryRole(user.roles ?? []);
      if (role === "resident" && needsOnboarding(user)) {
        router.push("/onboarding");
        return;
      }
      router.push(homePathForUser(user));
    },
    [router],
  );

  async function handleSendOtp() {
    setError(null);
    setSuccess(null);
    if (!INDIAN_MOBILE.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      // Server validates existence + generates OTP into Redis (single source of truth)
      await api.auth.sendOtp(phone, mode === "register" ? "register" : "login");
      setStep("otp");
      setOtp("");
      setResendIn(RESEND_COOLDOWN_SEC);
      setResendCount(0);
      setSuccess("OTP sent successfully. Check your phone (or the server terminal in development).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    setSuccess(null);
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
    if (resendCount >= MAX_RESENDS) {
      setError("Maximum resend attempts reached. Please wait and try again later.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api.auth.sendOtp(phone, mode === "register" ? "register" : "login");
      setResendIn(RESEND_COOLDOWN_SEC);
      setResendCount((c) => c + 1);
      setOtp("");
      setSuccess("A new OTP has been sent successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "login" ? "Sign in to WashNPress" : "Create your account";
  const description =
    mode === "login"
      ? "Enter your mobile number to receive a one-time password."
      : "Residents only. Operators and admins are provisioned by Admin and must sign in.";
  const alternateHref = mode === "login" ? "/register" : "/login";
  const alternateLabel =
    mode === "login" ? "New resident? Create an account" : "Already have an account? Sign in";

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
        {success ? (
          <Alert>
            <AlertDescription className="text-emerald-700">{success}</AlertDescription>
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
            <Button className="w-full" onClick={() => void handleSendOtp()} disabled={loading}>
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
                  setSuccess(null);
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
              <Button
                className="w-full sm:flex-1"
                onClick={() => void handleVerifyOtp()}
                disabled={loading}
              >
                {loading ? "Verifying…" : mode === "login" ? "Sign In" : "Verify & Continue"}
              </Button>
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                onClick={() => void handleResendOtp()}
                disabled={loading || resendIn > 0 || resendCount >= MAX_RESENDS}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Dev tip: OTP is printed in the terminal where you ran <code>npm run dev</code>.
            </p>
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
