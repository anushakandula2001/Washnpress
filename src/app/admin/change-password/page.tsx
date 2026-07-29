"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { adminNav } from "@/lib/portal-nav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function checkStrength(password: string): PasswordStrength {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

function strengthScore(s: PasswordStrength): number {
  return Object.values(s).filter(Boolean).length;
}

const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColors = [
  "",
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-emerald-600",
];

function RuleRow({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
      {met ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
      {label}
    </li>
  );
}

export default function ChangePasswordPage() {
  const { toast } = useToast();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = checkStrength(form.newPassword);
  const score = strengthScore(strength);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.currentPassword.trim()) errs.currentPassword = "Current password is required";
    if (!form.newPassword) errs.newPassword = "New password is required";
    else if (score < 5) errs.newPassword = "Password must meet all requirements";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your new password";
    else if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to change password");

      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast("Password changed successfully!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error changing password", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Change Password"
      subtitle="Update your administrator account password"
    >
      <div className="mx-auto max-w-xl">
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Password changed successfully!</p>
              <p className="text-sm opacity-80 mt-0.5">
                Your new password is now active. Use it on your next login.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Update Your Password
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a strong password with at least 8 characters.
            </p>
          </div>

          <div className="space-y-5 p-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="currentPassword">
                Current Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={show.current ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) => handleChange("currentPassword", e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className={`w-full rounded-xl border bg-background py-2.5 pl-4 pr-11 text-sm text-foreground outline-none ring-primary transition focus:ring-2 ${
                    errors.currentPassword ? "border-destructive" : "border-input"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle current password visibility"
                >
                  {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-destructive">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="newPassword">
                New Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={show.new ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className={`w-full rounded-xl border bg-background py-2.5 pl-4 pr-11 text-sm text-foreground outline-none ring-primary transition focus:ring-2 ${
                    errors.newPassword ? "border-destructive" : "border-input"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, new: !s.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle new password visibility"
                >
                  {show.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword}</p>
              )}

              {/* Strength Meter */}
              {form.newPassword && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= score ? strengthColors[score] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${score >= 4 ? "text-emerald-600 dark:text-emerald-400" : score >= 3 ? "text-amber-600" : "text-red-500"}`}>
                    {strengthLabels[score] || ""}
                  </p>
                  <ul className="space-y-1">
                    <RuleRow met={strength.minLength} label="At least 8 characters" />
                    <RuleRow met={strength.hasUppercase} label="At least one uppercase letter (A-Z)" />
                    <RuleRow met={strength.hasLowercase} label="At least one lowercase letter (a-z)" />
                    <RuleRow met={strength.hasNumber} label="At least one number (0-9)" />
                    <RuleRow met={strength.hasSpecial} label="At least one special character (!@#$%...)" />
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
                Confirm New Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={show.confirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className={`w-full rounded-xl border bg-background py-2.5 pl-4 pr-11 text-sm text-foreground outline-none ring-primary transition focus:ring-2 ${
                    errors.confirmPassword ? "border-destructive" : "border-input"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle confirm password visibility"
                >
                  {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
              {form.confirmPassword && !errors.confirmPassword && form.newPassword === form.confirmPassword && (
                <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-border px-6 py-5">
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PortalShell>
  );
}
