"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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

type SocietyOption = {
  id: string;
  name: string;
  city: string;
  address: string;
  status: string;
};

const PICKUP_WINDOWS = [
  { id: "morning", label: "Morning (7–11 AM)" },
  { id: "afternoon", label: "Afternoon (12–4 PM)" },
  { id: "evening", label: "Evening (5–9 PM)" },
];

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [societies, setSocieties] = useState<SocietyOption[]>([]);
  const [societyQuery, setSocietyQuery] = useState("");
  const [fullName, setFullName] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [towerBlock, setTowerBlock] = useState("");
  const [alternateContact, setAlternateContact] = useState("");
  const [preferredWindows, setPreferredWindows] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meRes, societiesRes] = await Promise.all([
          api.me(),
          api.societies(),
        ]);

        if (cancelled) return;

        const sessionUser = meRes.user as AuthUser;
        setUser(sessionUser);

        if (!needsOnboarding(sessionUser)) {
          router.replace("/resident");
          return;
        }

        setFullName(sessionUser.fullName ?? "");
        setSocieties(societiesRes.societies as SocietyOption[]);
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const filteredSocieties = useMemo(() => {
    const q = societyQuery.trim().toLowerCase();
    if (!q) return societies;
    return societies.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q),
    );
  }, [societies, societyQuery]);

  function toggleWindow(id: string) {
    setPreferredWindows((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }
    if (!societyId) {
      setError("Please select your society.");
      return;
    }
    if (!unitNumber.trim()) {
      setError("Flat / unit number is required.");
      return;
    }
    if (alternateContact && !INDIAN_MOBILE.test(alternateContact)) {
      setError("Alternate contact must be a valid 10-digit Indian mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      await api.auth.onboarding({
        societyId,
        fullName: fullName.trim(),
        unitNumber: unitNumber.trim(),
        towerBlock: towerBlock.trim() || undefined,
        alternateContact: alternateContact || undefined,
        preferredWindows: preferredWindows.length ? preferredWindows : undefined,
      });
      router.push("/resident");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading your profile…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Wash N Press
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Complete Your Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user?.phone ? `Signed in as +91 ${user.phone}` : "Tell us about your residence."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile setup</CardTitle>
          <CardDescription>
            Society and flat details from registration are saved to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Full Name</span>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                disabled={submitting}
                required
              />
            </label>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Society</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={societyQuery}
                  onChange={(e) => setSocietyQuery(e.target.value)}
                  placeholder="Search societies"
                  className="pl-10"
                  disabled={submitting}
                />
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-2">
                {filteredSocieties.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No societies found.
                  </p>
                ) : (
                  filteredSocieties.map((society) => (
                    <label
                      key={society.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${
                        societyId === society.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="society"
                        value={society.id}
                        checked={societyId === society.id}
                        onChange={() => setSocietyId(society.id)}
                        className="mt-1"
                        disabled={submitting}
                      />
                      <span>
                        <span className="font-medium text-foreground">{society.name}</span>
                        <span className="mt-0.5 block text-muted-foreground">
                          {society.address}, {society.city}
                        </span>
                        <span className="text-xs text-muted-foreground">{society.status}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Flat / Unit Number</span>
              <Input
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="e.g. A-1204"
                disabled={submitting}
                required
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Tower / Block (optional)</span>
              <Input
                value={towerBlock}
                onChange={(e) => setTowerBlock(e.target.value)}
                placeholder="e.g. Tower B"
                disabled={submitting}
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Alternate Contact (optional)</span>
              <Input
                type="tel"
                inputMode="numeric"
                value={alternateContact}
                onChange={(e) =>
                  setAlternateContact(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit mobile number"
                disabled={submitting}
              />
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm text-muted-foreground">
                Preferred Pickup Windows (optional)
              </legend>
              <div className="space-y-2">
                {PICKUP_WINDOWS.map((window) => (
                  <label
                    key={window.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={preferredWindows.includes(window.id)}
                      onChange={() => toggleWindow(window.id)}
                      disabled={submitting}
                    />
                    {window.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Saving…" : "Continue to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
