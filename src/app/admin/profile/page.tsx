"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  BadgeCheck,
  Calendar,
  Clock,
  ShieldCheck,
  Upload,
  Save,
  RotateCcw,
  Loader2,
  Camera,
} from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { adminNav } from "@/lib/portal-nav";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/admin/ProfileAvatar";
import { useToast } from "@/components/ui/toast";


interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  employeeId: string;
  department: string;
  dateJoined: string;
  lastLogin: string;
  accountStatus: string;
  avatarUrl?: string | null;
}

const initialProfile: ProfileData = {
  fullName: "Platform Admin",
  email: "admin@washnpress.com",
  phone: "+91 98765 43210",
  role: "Platform Admin",
  employeeId: "EMP-1001",
  department: "Platform Operations / Administration",
  dateJoined: "2024-01-15",
  lastLogin: "Just now",
  accountStatus: "Active",
  avatarUrl: null,
};

export default function AdminProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileData>(initialProfile);
  const [savedData, setSavedData] = useState<ProfileData>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profile", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          const fetched: ProfileData = {
            fullName: data.profile.fullName || initialProfile.fullName,
            email: data.profile.email || initialProfile.email,
            phone: data.profile.phone || initialProfile.phone,
            role: data.profile.role || initialProfile.role,
            employeeId: data.profile.employeeId || initialProfile.employeeId,
            department: data.profile.department || initialProfile.department,
            dateJoined: data.profile.dateJoined || initialProfile.dateJoined,
            lastLogin: data.profile.lastLogin || initialProfile.lastLogin,
            accountStatus: data.profile.accountStatus || initialProfile.accountStatus,
            avatarUrl: data.profile.avatarUrl || null,
          };
          setFormData(fetched);
          setSavedData(fetched);
        }
      }
    } catch {
      // Use initial state if API fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number (min 10 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast("Image file size should be less than 5MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        toast("Profile picture updated preview", "info");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast("Please fix errors before saving", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          avatarUrl: formData.avatarUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: "Update failed" }));
        throw new Error(errData.message || "Failed to save profile");
      }

      setSavedData(formData);
      toast("Profile changes saved successfully!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error saving profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(savedData);
    setErrors({});
    toast("Form changes cancelled", "info");
  };

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="My Profile"
      subtitle="Manage your platform administrator account information and settings"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Profile Summary Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <div className="relative group">
                  <ProfileAvatar
                    name={formData.fullName}
                    src={formData.avatarUrl}
                    size="xl"
                    status="online"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Upload profile picture"
                  >
                    <Camera className="h-6 w-6" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h2 className="text-2xl font-bold text-foreground">{formData.fullName}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {formData.role}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {formData.accountStatus}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formData.email}</p>
                  <p className="text-xs text-muted-foreground">Employee ID: {formData.employeeId}</p>
                </div>

                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Change Picture
                  </Button>
                </div>
              </div>
            </div>

            {/* Editable Profile Information Form */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal & Account Details
              </h3>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition ring-primary focus:ring-2 ${
                      errors.fullName ? "border-destructive ring-destructive" : "border-input"
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition ring-primary focus:ring-2 ${
                      errors.email ? "border-destructive ring-destructive" : "border-input"
                    }`}
                    placeholder="admin@washnpress.com"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition ring-primary focus:ring-2 ${
                      errors.phone ? "border-destructive ring-destructive" : "border-input"
                    }`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none transition ring-primary focus:ring-2"
                    placeholder="Platform Operations / Administration"
                  />
                </div>
              </div>
            </div>

            {/* Read-Only System Metrics */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                Administrative Metadata
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Employee ID</span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-foreground">{formData.employeeId}</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Date Joined</span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-foreground">{formData.dateJoined}</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Last Login</span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-foreground">{formData.lastLogin}</p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="gap-2 min-w-[140px]">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </PortalShell>
  );
}
