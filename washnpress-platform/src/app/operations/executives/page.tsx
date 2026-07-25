"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, MapPin } from "lucide-react";

type ExecutiveAssignment = {
  id: string;
  society_id: string;
  society_name: string;
  full_name: string;
  phone: string;
  status: string;
};

export default function ExecutivesPage() {
  const [executives, setExecutives] = useState<ExecutiveAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/operations/executives", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setExecutives(d.assignments || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Field Executives"
      subtitle="View executives assigned to your societies"
    >
      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading executives...</div>
      ) : executives.length === 0 ? (
        <div className="py-20 text-center border rounded-xl border-dashed">
          <User className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Executives Found</h3>
          <p className="text-sm text-muted-foreground">There are no executives assigned to your active societies.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {executives.map((ex) => (
            <Card key={ex.id} className="hover:border-primary/50 transition">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-bold">{ex.full_name}</CardTitle>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ex.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                    {ex.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {ex.phone}
                </div>
                <div className="flex items-start gap-2 text-sm border-t pt-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Assigned Society</p>
                    <p className="text-xs text-muted-foreground">{ex.society_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
