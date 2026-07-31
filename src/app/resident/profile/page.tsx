"use client";

import { useEffect, useState } from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import { api } from "@/frontend/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ResidentAddress, ResidentProfile } from "@/lib/resident-data";

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
    alternateContact: null,
  });
  const [addresses, setAddresses] = useState<ResidentAddress[]>([]);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [editing, setEditing] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ctxProfile) setProfile(ctxProfile);
  }, [ctxProfile]);

  useEffect(() => {
    void api.residentAddresses.list().then((result) => {
      setAddresses(result.addresses.map((address) => ({
        id: String(address.id),
        label: String(address.label),
        addressLine: String(address.address_line),
        city: String(address.city),
        state: address.state ? String(address.state) : null,
        pincode: address.pincode ? String(address.pincode) : null,
      })));
    }).catch(() => undefined);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.profile.update({
        fullName: profile.name,
        email: profile.email ?? "",
        alternateContact: profile.alternateContact ?? undefined,
      });
      await refresh();
      setSaved(true);
      setEditing(false);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddingAddress(true);
    setAddressError(null);
    try {
      const result = await api.residentAddresses.create(addressForm);
      const address = result.address;
      setAddresses((current) => [{
        id: String(address.id),
        label: String(address.label),
        addressLine: String(address.address_line),
        city: String(address.city),
        state: address.state ? String(address.state) : null,
        pincode: address.pincode ? String(address.pincode) : null,
      }, ...current]);
      setAddressForm({ label: "Home", addressLine: "", city: "", state: "", pincode: "" });
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : "Failed to add address");
    } finally {
      setAddingAddress(false);
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>
                  {profile.residentCode ? `Resident ID ${profile.residentCode}` : "Resident account"}
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={() => setEditing((value) => !value)}>
                {editing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm">
              <span className="text-muted-foreground">Full Name</span>
              <Input
                value={profile.name}
                disabled={!editing}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Mobile Number</span>
              <Input value={profile.mobile} readOnly className="mt-1 bg-muted/40" />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Email</span>
              <Input
                value={profile.email ?? ""}
                disabled={!editing}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-1"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Alternate Contact</span>
              <Input
                value={profile.alternateContact ?? ""}
                disabled={!editing}
                onChange={(e) => setProfile({ ...profile, alternateContact: e.target.value })}
                className="mt-1"
                placeholder="10-digit mobile number"
              />
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

        <div className="lg:col-span-2 flex items-center gap-3">
          <Button type="submit" disabled={saving || !editing}>
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </form>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Additional Addresses</CardTitle>
            <CardDescription>Save another delivery or pickup location for your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.length === 0 && <p className="text-sm text-muted-foreground">No additional addresses saved.</p>}
            {addresses.map((address) => (
              <div key={address.id} className="rounded-xl border border-border p-4 text-sm">
                <p className="font-semibold">{address.label}</p>
                <p className="mt-1 text-muted-foreground">{address.addressLine}</p>
                <p className="text-muted-foreground">{address.city}{address.state ? `, ${address.state}` : ""}{address.pincode ? ` - ${address.pincode}` : ""}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Address</CardTitle>
            <CardDescription>This does not change your Operations-managed primary address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleAddAddress(e)} className="space-y-3">
              {addressError && <p className="text-sm text-destructive">{addressError}</p>}
              {(["label", "addressLine", "city", "state", "pincode"] as const).map((field) => (
                <Input
                  key={field}
                  required={field === "label" || field === "addressLine" || field === "city"}
                  value={addressForm[field]}
                  onChange={(e) => setAddressForm({ ...addressForm, [field]: e.target.value })}
                  placeholder={{ label: "Label", addressLine: "Address", city: "City", state: "State", pincode: "Pincode" }[field]}
                />
              ))}
              <Button type="submit" disabled={addingAddress}>{addingAddress ? "Adding…" : "Add Address"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ResidentShell>
  );
}
