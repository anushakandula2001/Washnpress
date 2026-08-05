"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { api, type AuthUser } from "@/frontend/api-client";

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const OTP_DIGITS = /^\d{6}$/;

type Step = "phone" | "otp" | "existing" | "form" | "success";

export default function RegisterPage() {
  const router = useRouter();
  
  // View State
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  const [societyId, setSocietyId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [apartmentId, setApartmentId] = useState("");

  // Data State
  const [societies, setSocieties] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);

  // Derived State
  const selectedApartment = apartments.find(a => a.id === apartmentId);
  const isApartmentAssigned = selectedApartment && selectedApartment.status !== "active";

  const isFormValid = 
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    societyId && blockId && floorId && apartmentId &&
    !isApartmentAssigned;

  function normalizePhone(value: string) {
    return value.replace(/\D/g, "").slice(0, 10);
  }

  // Effect: Load Societies when reaching form step
  useEffect(() => {
    if (step === "form" && societies.length === 0) {
      api.societies().then(res => {
        // Only active societies
        setSocieties(res.societies.filter((s: any) => s.status === "Active" || s.status === "active"));
      }).catch(console.error);
    }
  }, [step]);

  // Effect: Load Blocks when Society changes
  useEffect(() => {
    if (societyId) {
      setBlocks([]);
      setFloors([]);
      setApartments([]);
      setBlockId("");
      setFloorId("");
      setApartmentId("");
      api.master.towers(societyId).then(res => {
        setBlocks(res.towers);
      }).catch(console.error);
    }
  }, [societyId]);

  // Effect: Load Floors when Block changes
  useEffect(() => {
    if (blockId) {
      setFloors([]);
      setApartments([]);
      setFloorId("");
      setApartmentId("");
      api.master.floors(blockId).then(res => {
        setFloors(res.floors);
      }).catch(console.error);
    }
  }, [blockId]);

  // Effect: Load Apartments when Floor changes
  useEffect(() => {
    if (floorId) {
      setApartments([]);
      setApartmentId("");
      api.master.flats(floorId).then(res => {
        setApartments(res.flats);
      }).catch(console.error);
    }
  }, [floorId]);

  async function handleSendOtp() {
    setError(null);
    if (!INDIAN_MOBILE.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
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

  async function handleSave() {
    setError(null);
    if (!isFormValid) return;

    setLoading(true);
    try {
      await api.auth.onboarding({
        societyId,
        flatId: apartmentId,
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim() || undefined,
      });
      setStep("success");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 bg-white overflow-y-auto">
      {/* Background Soft Aqua Gradient & Wave Pattern */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-white via-[#F5FFFE] to-[#DDFBF9] opacity-70" />
      
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] blur-[1px]">
        <img src="/logo.png" alt="Watermark" className="w-[80vw] max-w-[800px] object-contain grayscale" />
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
          {error && (
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
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#163A4A] mb-2">Verify Mobile</h1>
                <p className="text-[#6A7B88] text-sm">Enter the OTP sent to +91 {phone}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#163A4A]">OTP Verification</label>
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
              <button 
                onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
                className="w-full text-sm mt-2 text-[#14C8C4] hover:text-[#0FA8A4] hover:underline"
              >
                Change mobile number
              </button>
            </div>
          )}

          {step === "existing" && (
            <div className="text-center py-4 space-y-6">
              <div className="p-4 bg-[#F2FFFE] rounded-xl border border-[#D7F5F4]">
                <p className="text-[#0FA8A4] font-semibold mb-1">Resident already exists with this mobile number.</p>
                <p className="text-sm text-[#163A4A]">Please sign in to access your account.</p>
              </div>
              <div className="flex flex-col gap-3">
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
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-[#163A4A] mb-2">Resident Registration</h1>
                <p className="text-[#6A7B88] text-sm">Complete your profile to join Wash N Press</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-[#0FA8A4] border-b border-[#D7F5F4] pb-2">Personal Information</h2>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#163A4A]">First Name *</label>
                    <input
                      type="text"
                      className="w-full h-11 px-3 rounded-xl border border-[#D7F5F4] bg-white focus:outline-none focus:border-[#14C8C4] focus:ring-4 focus:ring-[#14C8C4]/20 text-[#163A4A]"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#163A4A]">Last Name *</label>
                    <input
                      type="text"
                      className="w-full h-11 px-3 rounded-xl border border-[#D7F5F4] bg-white focus:outline-none focus:border-[#14C8C4] focus:ring-4 focus:ring-[#14C8C4]/20 text-[#163A4A]"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#163A4A]">Mobile Number</label>
                    <input
                      type="text"
                      className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      value={`+91 ${phone}`}
                      readOnly
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#163A4A]">Email (Optional)</label>
                    <input
                      type="email"
                      className="w-full h-11 px-3 rounded-xl border border-[#D7F5F4] bg-white focus:outline-none focus:border-[#14C8C4] focus:ring-4 focus:ring-[#14C8C4]/20 text-[#163A4A]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Society Information */}
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-[#0FA8A4] border-b border-[#D7F5F4] pb-2">Society Information</h2>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#163A4A]">Society *</label>
                    <select
                      className="w-full h-11 px-3 rounded-xl border border-[#D7F5F4] bg-white focus:outline-none focus:border-[#14C8C4] focus:ring-4 focus:ring-[#14C8C4]/20 text-[#163A4A]"
                      value={societyId}
                      onChange={(e) => setSocietyId(e.target.value)}
                    >
                      <option value="">Select Society</option>
                      {societies.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#163A4A]">Block *</label>
                    <select
                      className="w-full h-11 px-3 rounded-xl border border-[#D7F5F4] bg-white focus:outline-none focus:border-[#14C8C4] focus:ring-4 focus:ring-[#14C8C4]/20 text-[#163A4A] disabled:bg-gray-50 disabled:cursor-not-allowed"
                      value={blockId}
                      onChange={(e) => setBlockId(e.target.value)}
                      disabled={!societyId || blocks.length === 0}
                    >
                      <option value="">Select Block</option>
                      {blocks.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#163A4A]">Floor *</label>
                    <select
                      className="w-full h-11 px-3 rounded-xl border border-[#D7F5F4] bg-white focus:outline-none focus:border-[#14C8C4] focus:ring-4 focus:ring-[#14C8C4]/20 text-[#163A4A] disabled:bg-gray-50 disabled:cursor-not-allowed"
                      value={floorId}
                      onChange={(e) => setFloorId(e.target.value)}
                      disabled={!blockId || floors.length === 0}
                    >
                      <option value="">Select Floor</option>
                      {floors.map(f => (
                        <option key={f.id} value={f.id}>{f.label || `Floor ${f.floorNumber}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-semibold text-[#163A4A]">Apartment *</label>
                    <select
                      className={`w-full h-11 px-3 rounded-xl border ${isApartmentAssigned ? 'border-red-300' : 'border-[#D7F5F4]'} bg-white focus:outline-none focus:border-[#14C8C4] focus:ring-4 focus:ring-[#14C8C4]/20 text-[#163A4A] disabled:bg-gray-50 disabled:cursor-not-allowed`}
                      value={apartmentId}
                      onChange={(e) => setApartmentId(e.target.value)}
                      disabled={!floorId || apartments.length === 0}
                    >
                      <option value="">Select Apartment</option>
                      {apartments.map(a => (
                        <option key={a.id} value={a.id}>{a.flatNumber}</option>
                      ))}
                    </select>
                    {isApartmentAssigned && (
                      <p className="text-red-500 text-xs font-medium mt-1">This apartment already has a registered resident.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#D7F5F4] flex flex-col sm:flex-row gap-4 items-center justify-end">
                <button
                  onClick={() => setStep("phone")}
                  className="w-full sm:w-auto px-6 h-12 rounded-xl bg-white border border-[#D7F5F4] text-[#6A7B88] font-bold transition-all hover:bg-[#F5FFFE] hover:text-[#14C8C4]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !isFormValid}
                  className="w-full sm:w-auto px-10 h-12 rounded-xl text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_12px_25px_rgba(20,200,196,0.25)] hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(90deg, #14C8C4, #0FA8A4)" }}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#14C8C4]/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-[#14C8C4]" />
              </div>
              <h2 className="text-2xl font-bold text-[#163A4A]">Registration Successful!</h2>
              <p className="text-[#6A7B88]">Your resident account has been created successfully.</p>
              <p className="text-sm text-[#0FA8A4] pt-4">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
