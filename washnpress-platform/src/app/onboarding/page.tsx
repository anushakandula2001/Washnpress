"use client";

import { useEffect, useState } from "react";
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

type SocietyOption = { id: string; name: string; city: string; address: string; status: string };
type TowerOption = { id: string; name: string };
type FloorOption = { id: string; label: string; floorNumber: number };
type FlatOption = { id: string; flatNumber: string; status: string };

const GENDERS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
  { id: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [societies, setSocieties] = useState<SocietyOption[]>([]);
  const [towers, setTowers] = useState<TowerOption[]>([]);
  const [floors, setFloors] = useState<FloorOption[]>([]);
  const [flats, setFlats] = useState<FlatOption[]>([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [towerId, setTowerId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [flatId, setFlatId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meRes, societiesRes] = await Promise.all([api.me(), api.societies()]);
        if (cancelled) return;
        const sessionUser = meRes.user as AuthUser;
        setUser(sessionUser);
        if (!needsOnboarding(sessionUser)) {
          router.replace("/resident/dashboard");
          return;
        }
        setFullName(sessionUser.fullName ?? "");
        setSocieties(
          (societiesRes.societies as SocietyOption[]).filter(
            (s) => s.status === "Active" || s.status === "active",
          ),
        );
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!societyId) {
      setTowers([]);
      setTowerId("");
      setFloors([]);
      setFloorId("");
      setFlats([]);
      setFlatId("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api.master.towers(societyId);
        if (cancelled) return;
        setTowers(data.towers);
        setTowerId("");
        setFloors([]);
        setFloorId("");
        setFlats([]);
        setFlatId("");
      } catch {
        if (!cancelled) setTowers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [societyId]);

  useEffect(() => {
    if (!towerId) {
      setFloors([]);
      setFloorId("");
      setFlats([]);
      setFlatId("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api.master.floors(towerId);
        if (cancelled) return;
        setFloors(data.floors);
        setFloorId("");
        setFlats([]);
        setFlatId("");
      } catch {
        if (!cancelled) setFloors([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [towerId]);

  useEffect(() => {
    if (!floorId) {
      setFlats([]);
      setFlatId("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api.master.flats(floorId);
        if (cancelled) return;
        setFlats(data.flats.filter((f) => f.status !== "occupied"));
        setFlatId("");
      } catch {
        if (!cancelled) setFlats([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [floorId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !societyId || !flatId) {
      setError("Full name, society, and flat are required.");
      return;
    }
    setSubmitting(true);
    try {
      await api.auth.onboarding({
        societyId,
        flatId,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
      });
      router.replace("/resident/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading profile setup…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-10">
      <Card className="w-full border-border/80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>
            Welcome{user?.phone ? `, +91 ${user.phone}` : ""}. Select your society address from
            Operations master data — typing society or flat is not allowed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="text-muted-foreground">Full Name *</span>
                <Input
                  className="mt-1"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Email (optional)</span>
                <Input
                  className="mt-1"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Gender (optional)</span>
                <select
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select</option>
                  {GENDERS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="text-muted-foreground">Date of Birth (optional)</span>
                <Input
                  className="mt-1"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </label>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">Address (master data)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="text-muted-foreground">Society *</span>
                  <select
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={societyId}
                    onChange={(e) => setSocietyId(e.target.value)}
                    required
                  >
                    <option value="">Select society</option>
                    {societies.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.city}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-muted-foreground">Tower / Block *</span>
                  <select
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={towerId}
                    onChange={(e) => setTowerId(e.target.value)}
                    disabled={!societyId}
                    required
                  >
                    <option value="">Select tower</option>
                    {towers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-muted-foreground">Floor *</span>
                  <select
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={floorId}
                    onChange={(e) => setFloorId(e.target.value)}
                    disabled={!towerId}
                    required
                  >
                    <option value="">Select floor</option>
                    {floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-muted-foreground">Flat *</span>
                  <select
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={flatId}
                    onChange={(e) => setFlatId(e.target.value)}
                    disabled={!floorId}
                    required
                  >
                    <option value="">Select flat</option>
                    {flats.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.flatNumber}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {societyId && towers.length === 0 && (
                <p className="mt-3 text-xs text-amber-700">
                  No towers configured for this society yet. Ask Operations to add master data.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting || !flatId}>
              {submitting ? "Saving…" : "Save & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
