"use client";

import { useEffect, useState } from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import { api } from "@/frontend/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ResidentProfile } from "@/lib/resident-data";

export default function ProfilePage() {
  const { profile: ctxProfile, refresh } = useResident();
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
      await api.profile.update({
        fullName: profile.name,
      });
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
    <ResidentShell greeting="Profile" subtitle="Your account — address comes from Operations master data">
      <form onSubmit={(e) => void handleSave(e)} className="grid gap-4 lg:grid-cols-2">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive lg:col-span-2">
            {error}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>
              {profile.residentCode ? `Resident ID ${profile.residentCode}` : "Resident account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm">
              <span className="text-muted-foreground">Full Name</span>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Mobile Number</span>
              <Input value={profile.mobile} readOnly className="mt-1" />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Email</span>
              <Input value={profile.email ?? ""} readOnly className="mt-1" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address (master data)</CardTitle>
            <CardDescription>
              Linked by Flat ID — updates when Operations changes the catalog
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border border-border p-4 space-y-2">
              <p>
                <span className="text-muted-foreground">Society:</span> {profile.society || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Tower:</span> {profile.tower || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Floor:</span> {profile.floor || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Flat:</span> {profile.flatNumber || "—"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              To change flat, contact Operations. Residents cannot free-type society addresses.
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved!" : "Save Name"}
          </Button>
        </div>
      </form>
    </ResidentShell>
  );
}
