"use client";

import { useState, useEffect } from "react";
import { api } from "@/frontend/api-client";

interface ResidentRegistrationFormProps {
  phone: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ResidentRegistrationForm({ phone, onCancel, onSuccess }: ResidentRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  const [societyId, setSocietyId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [apartmentId, setApartmentId] = useState("");

  const [societies, setSocieties] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);

  const selectedApartment = apartments.find(a => a.id === apartmentId);
  const isApartmentAssigned = selectedApartment && selectedApartment.status !== "active";

  const isFormValid = 
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    societyId && blockId && floorId && apartmentId &&
    !isApartmentAssigned;

  useEffect(() => {
    api.societies().then(res => {
      setSocieties(res.societies.filter((s: any) => s.status === "Active" || s.status === "active"));
    }).catch(console.error);
  }, []);

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

  useEffect(() => {
    if (floorId) {
      setApartments([]);
      setApartmentId("");
      api.master.flats(floorId).then(res => {
        setApartments(res.flats);
      }).catch(console.error);
    }
  }, [floorId]);

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
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center">
          {error}
        </div>
      )}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#163A4A] mb-2">Resident Registration</h1>
        <p className="text-[#6A7B88] text-sm">Complete your profile to join Wash N Press</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
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
          onClick={onCancel}
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
  );
}
