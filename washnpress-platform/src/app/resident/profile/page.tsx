"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Camera, Lock, BellRing, Languages, ShieldCheck } from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import { api } from "@/frontend/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ResidentProfile } from "@/lib/resident-data";

export default function ProfilePage() {
  const { profile: ctxProfile, refresh, subscription } = useResident();
  const [profile, setProfile] = useState<ResidentProfile>({
    name: "",
    flatNumber: "",
    tower: "",
    floor: null,
    mobile: "",
    society: "",
    residentCode: null,
    email: null,
    gender: null,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ctxProfile) setProfile(ctxProfile);
  }, [ctxProfile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.profile.update({ fullName: profile.name });
      await refresh();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ResidentShell greeting="Profile" subtitle="Your resident account, address details, and preferences in one place">
      <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
        {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resident ID</p>
                <p className="text-lg font-semibold">{profile.residentCode ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{profile.name || "Resident"}</p>
              </div>
            </div>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? "Saving…" : saved ? "Saved!" : "Edit profile"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>Your contact details and resident identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block text-sm">
                <span className="text-muted-foreground">Full name</span>
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1" />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Mobile number</span>
                <Input value={profile.mobile} readOnly className="mt-1" />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Alternate mobile number</span>
                <Input value="" placeholder="Optional" className="mt-1" />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Email</span>
                <Input value={profile.email ?? ""} readOnly className="mt-1" />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Residence information</CardTitle>
              <CardDescription>Apartment level details linked to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-2xl border border-border p-4 space-y-2">
                <p><span className="text-muted-foreground">Apartment / Society:</span> {profile.society || "—"}</p>
                <p><span className="text-muted-foreground">Tower:</span> {profile.tower || "—"}</p>
                <p><span className="text-muted-foreground">Flat number:</span> {profile.flatNumber || "—"}</p>
                <p><span className="text-muted-foreground">Floor:</span> {profile.floor || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Keep your delivery and pickup address details current.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Address line 1" />
              <Input placeholder="Address line 2" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="City" />
                <Input placeholder="State" />
              </div>
              <Input placeholder="Pincode" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account settings</CardTitle>
              <CardDescription>Security, notifications, and future-ready preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Link href="/resident/profile" className="flex items-center gap-3 rounded-2xl border border-border p-3 hover:bg-muted/40">
                <Lock className="h-4 w-4 text-primary" />
                <span>Change password</span>
              </Link>
              <Link href="/resident/profile" className="flex items-center gap-3 rounded-2xl border border-border p-3 hover:bg-muted/40">
                <BellRing className="h-4 w-4 text-primary" />
                <span>Notification preferences</span>
              </Link>
              <div className="flex items-center gap-3 rounded-2xl border border-border p-3 text-muted-foreground">
                <Languages className="h-4 w-4 text-primary" />
                <span>Language (coming soon)</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border p-3 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Privacy settings (coming soon)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </ResidentShell>
  );
}
