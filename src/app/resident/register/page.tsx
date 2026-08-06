"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { api, type AuthUser } from "@/frontend/api-client";

const ResidentRegistrationForm = dynamic(() => import("./ResidentRegistrationForm"), {
  ssr: false,
});

const RoleDialog = dynamic(() => import("./RoleDialog"), {
  ssr: false,
});

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const OTP_DIGITS = /^\d{6}$/;

type Step = "phone" | "otp" | "existing" | "form" | "success";

export default function RegisterPage() {
  const router = useRouter();
  
  // View State
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session State (lazy checked)
  const [existingUser, setExistingUser] = useState<AuthUser | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  // Auth State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

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
      // Lazy session check ONLY when trying to send OTP
      let user: AuthUser | null = null;
      try {
        const me = await api.me();
        if (me?.user) {
          user = me.user as unknown as AuthUser;
        }
      } catch (e) {
        // Not logged in
      }

      if (user) {
        if (user.roles.includes("admin") || user.roles.includes("operator")) {
          setExistingUser(user);
          setShowRoleDialog(true);
          setLoading(false);
          return;
        } else {
          // If they are a Resident, send them to dashboard immediately
          router.push("/resident/dashboard");
          return;
        }
      }

      const check = await api.auth.checkPhone(phone);
      if (check.exists && check.hasProfile) {
        setStep("existing");
        return;
      }
      
      await api.auth.sendOtp(phone, "register");
      setStep("otp");
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
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
      await api.auth.verifyOtp(phone, otp);
      setStep("form");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOutAndContinue() {
    try {
      await api.auth.logout();
      setExistingUser(null);
      setShowRoleDialog(false);
      // Proceed with sending OTP since they signed out
      await handleSendOtp(); 
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  function handleCancelRoleDialog() {
    if (existingUser?.roles.includes("admin")) {
      router.push("/admin/dashboard");
    } else if (existingUser?.roles.includes("operator")) {
      router.push("/operations/dashboard");
    } else {
      router.push("/");
    }
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 bg-white overflow-y-auto">
      {/* Background Soft Aqua Gradient & Wave Pattern */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-white via-[#F5FFFE] to-[#DDFBF9] opacity-70" />
      
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] blur-[1px]">
        <Image 
          src="/logo.png" 
          alt="Watermark" 
          width={800} 
          height={800}
          className="w-[80vw] max-w-[800px] object-contain grayscale" 
          priority={false}
          loading="lazy"
        />
      </div>

      <div className={`w-full relative z-10 my-8 ${step === "form" ? "max-w-[700px]" : "max-w-[460px]"}`}>
        
        {/* Back Button */}
        {step !== "success" && (
          <Link 
            href={step === "form" ? "#" : "/login"} 
            onClick={(e) => {
              if (step === "form") {
                e.preventDefault();
                setStep("phone");
              }
            }}
            className="group inline-flex items-center text-[#14C8C4] font-medium mb-6 bg-transparent border-none transition-all hover:text-[#0FA8A4]"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            {step === "form" ? "Cancel Registration" : "Back to Login"}
          </Link>
        )}

        {/* Main Card */}
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
          {error && step !== "form" && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center">
              {error}
            </div>
          )}

          {step === "phone" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#163A4A] mb-2">Create Account</h1>
                <p className="text-[#6A7B88] text-sm">Step 1: Verify your mobile number</p>
              </div>
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
                  autoFocus
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading || phone.length !== 10}
                className="w-full h-12 rounded-xl text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_12px_25px_rgba(20,200,196,0.25)] hover:-translate-y-0.5"
                style={{ background: "linear-gradient(90deg, #14C8C4, #0FA8A4)" }}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#163A4A] mb-2">Enter OTP</h1>
                <p className="text-[#6A7B88] text-sm">Sent to +91 {phone}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#163A4A]">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full h-12 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-[#D7F5F4] bg-white focus:outline-none focus:border-[#14C8C4] focus:ring-4 focus:ring-[#14C8C4]/20 transition-all text-[#163A4A]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) handleVerifyOtp();
                  }}
                  autoFocus
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full h-12 rounded-xl text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_12px_25px_rgba(20,200,196,0.25)] hover:-translate-y-0.5"
                style={{ background: "linear-gradient(90deg, #14C8C4, #0FA8A4)" }}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          {step === "existing" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-[#F2FFFE] rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#14C8C4]" />
                </div>
                <h1 className="text-2xl font-bold text-[#163A4A] mb-2">Resident already exists</h1>
                <p className="text-[#6A7B88] text-sm">
                  An account is already registered with +91 {phone}. Please log in instead.
                </p>
              </div>
              <div className="space-y-4 pt-4">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full h-12 rounded-xl text-white font-bold transition-all duration-300 hover:shadow-[0_12px_25px_rgba(20,200,196,0.25)] hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(90deg, #14C8C4, #0FA8A4)" }}
                >
                  Login
                </button>
                <button 
                  onClick={() => { setStep("phone"); setError(null); }}
                  className="w-full h-12 rounded-xl bg-white border border-[#D7F5F4] text-[#6A7B88] font-bold transition-all hover:bg-[#F5FFFE] hover:text-[#14C8C4]"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === "form" && (
            <ResidentRegistrationForm 
              phone={phone}
              onCancel={() => setStep("phone")}
              onSuccess={() => {
                setStep("success");
                setTimeout(() => {
                  router.push("/login");
                }, 3000);
              }}
            />
          )}

          {step === "success" && (
            <div className="text-center space-y-4 animate-in zoom-in-95 duration-500 py-8">
              <div className="mx-auto w-20 h-20 bg-[#F2FFFE] rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#14C8C4]" />
              </div>
              <h1 className="text-3xl font-bold text-[#163A4A]">Account Created!</h1>
              <p className="text-[#6A7B88]">
                Your resident profile has been set up successfully.
              </p>
              <p className="text-sm text-[#0FA8A4] font-medium pt-4 animate-pulse">
                Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>

      {showRoleDialog && (
        <RoleDialog 
          open={showRoleDialog}
          existingUser={existingUser}
          onCancel={handleCancelRoleDialog}
          onSignOutAndContinue={handleSignOutAndContinue}
        />
      )}
    </main>
  );
}
