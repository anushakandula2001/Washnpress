"use client";

import { useState } from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { residentProfile } from "@/lib/resident-data";

export default function ProfilePage() {
  const [profile, setProfile] = useState(residentProfile);
  const [notifications, setNotifications] = useState({
    pickup: true,
    delivery: true,
    billing: false,
    promotions: true,
  });
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <ResidentShell greeting="Profile" subtitle="Manage your account settings">
      <form onSubmit={handleSave} className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your contact information</CardDescription>
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
              <Input
                value={profile.mobile}
                onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                className="mt-1"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Society</span>
              <Input value={profile.society} readOnly className="mt-1" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-muted-foreground">Tower</span>
                <Input
                  value={profile.tower}
                  onChange={(e) => setProfile({ ...profile, tower: e.target.value })}
                  className="mt-1"
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Flat Number</span>
                <Input
                  value={profile.flatNumber}
                  onChange={(e) => setProfile({ ...profile, flatNumber: e.target.value })}
                  className="mt-1"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                ["pickup", "Pickup reminders"],
                ["delivery", "Delivery updates"],
                ["billing", "Billing & invoices"],
                ["promotions", "Promotions & offers"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3"
              >
                <span className="text-sm font-medium">{label}</span>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [key]: e.target.checked })
                  }
                  className="h-4 w-4 accent-primary"
                />
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Button type="submit">
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </form>
    </ResidentShell>
  );
}
