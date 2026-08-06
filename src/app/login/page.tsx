"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api, needsOnboarding, type AuthUser } from "@/frontend/api-client";
import { homePathForUser, primaryRole } from "@/lib/auth-redirect";

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const OTP_DIGITS = /^\d{6}$/;

type Step = "phone" | "otp" | "unregistered";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prefetch resident register on mount
  useEffect(() => {
    router.prefetch("/resident/register");
  }, [router]);
  
  function normalizePhone(value: string) {
    return value.replace(/\D/g, "").slice(0, 10);
  }

  async function handleSendOtp() {
    setError(null);
    if (!INDIAN_MOBILE.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.sendOtp(phone, "login");
      setStep("otp");
      setOtp("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP.";
      if (msg.toLowerCase().includes("no account found") || msg.toLowerCase().includes("not registered")) {
        setStep("unregistered");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    if (!OTP_DIGITS.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await api.auth.verifyOtp(phone, otp);
      
      const role = primaryRole(user.roles ?? []);
      if (role === "resident" && needsOnboarding(user as unknown as AuthUser)) {
        router.push("/onboarding");
        return;
      }
      router.push(homePathForUser(user as unknown as AuthUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white overflow-hidden">
      {/* Background Soft Aqua Gradient & Wave Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white via-[#F5FFFE] to-[#DDFBF9] opacity-70" />
      
      {/* Large Subtle Logo Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] blur-[1px]">
        <img src="/logo.png" alt="Watermark" className="w-[80vw] max-w-[800px] object-contain grayscale" />
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        
        {/* Back Button */}
        <Link 
          href="/" 
          className="group inline-flex items-center text-[#14C8C4] font-medium mb-6 bg-transparent border-none transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          Back
        </Link>

        {/* Login Card */}
        <div 
          className="p-8 sm:p-10"
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(20, 200, 196, 0.12)"
          }}
        >
          <div className="flex flex-col items-center mb-8 text-center">
            <img src="/logo.png" alt="Wash N Press" className="h-10 w-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#163A4A] mb-2">Login</h1>
            <p className="text-[#6A7B88] text-sm">Sign in to continue to Wash N Press</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center">
                {error}
              </div>
            )}

            {step === "phone" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#163A4A]">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    className="w-full h-12 px-4 rounded-xl border border-[#D7F5F4] bg-white focus:outline-none focus:border-[#14C8C4] focus:ring-4 focus:ring-[#14C8C4]/20 transition-all text-[#163A4A] placeholder-[#6A7B88]"
                    value={phone}
                    onChange={(e) => setPhone(normalizePhone(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) handleSendOtp();
                    }}
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading || phone.length !== 10}
                  className="w-full h-12 rounded-xl text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_12px_25px_rgba(20,200,196,0.25)] hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(90deg, #14C8C4, #0FA8A4)" }}
                >
                  {loading ? "Sending..." : "Login"}
                </button>
              </>
            )}

            {step === "otp" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#163A4A]">OTP Verification</label>
                  <p className="text-xs text-[#6A7B88] mb-2">Sent to +91 {phone}</p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full h-12 px-4 rounded-xl border border-[#D7F5F4] bg-white focus:outline-none focus:border-[#14C8C4] focus:ring-4 focus:ring-[#14C8C4]/20 transition-all text-[#163A4A] tracking-widest text-center text-lg font-bold"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) handleVerifyOtp();
                    }}
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 rounded-xl text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_12px_25px_rgba(20,200,196,0.25)] hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(90deg, #14C8C4, #0FA8A4)" }}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                <button 
                  onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
                  className="w-full text-sm mt-4 text-[#14C8C4] hover:text-[#0FA8A4] hover:underline"
                >
                  Change mobile number
                </button>
              </>
            )}

            {step === "unregistered" && (
              <div className="text-center py-4 space-y-6">
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-red-700 font-semibold mb-1">Account not found.</p>
                  <p className="text-sm text-red-600">Please register to continue.</p>
                </div>
                <button
                  onClick={() => router.push('/resident/register')}
                  className="w-full h-12 rounded-xl text-white font-bold transition-all duration-300 hover:shadow-[0_12px_25px_rgba(20,200,196,0.25)] hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(90deg, #14C8C4, #0FA8A4)" }}
                >
                  Create Account
                </button>
                <button 
                  onClick={() => { setStep("phone"); setError(null); }}
                  className="w-full text-sm text-[#14C8C4] hover:text-[#0FA8A4] hover:underline mt-4"
                >
                  Try a different number
                </button>
              </div>
            )}
          </div>

          {/* Bottom Link */}
          {step !== "unregistered" && (
            <div className="mt-8 pt-6 border-t border-[#D7F5F4] text-center">
              <span className="text-[#6A7B88] text-sm">New Resident? </span>
              <Link 
                href="/resident/register" 
                className="text-sm font-semibold text-[#14C8C4] hover:text-[#0FA8A4] hover:underline transition-colors"
              >
                Create an Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
