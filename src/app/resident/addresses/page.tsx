"use client";

import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddressesPage() {
  const { profile } = useResident();

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
    </ResidentShell>
  );
}
