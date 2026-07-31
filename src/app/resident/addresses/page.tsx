"use client";

import { useEffect, useState } from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import { api } from "@/frontend/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResidentAddress } from "@/lib/resident-data";

export default function AddressesPage() {
  const { profile } = useResident();
  const [addresses, setAddresses] = useState<ResidentAddress[]>([]);

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

  return (
    <ResidentShell greeting="Addresses" subtitle="Resolved from Operations master data via Flat ID">
      <Card>
        <CardHeader>
          <CardTitle>Primary address</CardTitle>
          <CardDescription>
            {profile?.residentCode ? `Resident ${profile.residentCode}` : "Linked flat reference"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-border p-4">
            <p className="font-medium">{profile?.society || "—"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tower {profile?.tower || "—"} · {profile?.floor || "Floor —"} · Flat{" "}
              {profile?.flatNumber || "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">+91 {profile?.mobile || "—"}</p>
          </div>
          <Button variant="outline" onClick={() => (window.location.href = "/resident/profile")}>
            View profile
          </Button>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Additional addresses</CardTitle>
          <CardDescription>Saved locations linked to your resident account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No additional addresses saved.</p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="rounded-xl border border-border p-4 text-sm">
                <p className="font-semibold">{address.label}</p>
                <p className="mt-1 text-muted-foreground">{address.addressLine}</p>
                <p className="text-muted-foreground">
                  {address.city}{address.state ? `, ${address.state}` : ""}{address.pincode ? ` - ${address.pincode}` : ""}
                </p>
              </div>
            ))
          )}
          <Button variant="outline" onClick={() => (window.location.href = "/resident/profile")}>
            Manage addresses
          </Button>
        </CardContent>
      </Card>
    </ResidentShell>
  );
}
