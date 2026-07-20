"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2 } from "lucide-react";
import { useResident } from "@/components/resident/resident-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/frontend/api-client";
import type { Society } from "@/lib/resident-data";

export default function SocietyPage() {
  const router = useRouter();
  const { selectedSociety, selectSociety } = useResident();
  const [query, setQuery] = useState("");
  const [selecting, setSelecting] = useState<string | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedSociety) {
      router.replace("/resident/dashboard");
    }
  }, [selectedSociety, router]);

  useEffect(() => {
    void api.societies()
      .then((data) => {
        setSocieties(
          data.societies.map((s) => ({
            id: String(s.id),
            name: String(s.name),
            address: String(s.address ?? s.address_line_1 ?? ""),
            city: String(s.city ?? ""),
            residents: Number(s.residents ?? 0),
            distanceKm: Number(s.distanceKm ?? 0),
            status: (s.status as Society["status"]) || "Active",
          })),
        );
      })
      .catch(() => setSocieties([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return societies;
    return societies.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q),
    );
  }, [query, societies]);

  function handleSelect(society: Society) {
    setSelecting(society.id);
    selectSociety(society);
    router.push("/resident/dashboard");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Wash N Press
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Choose Your Society</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find your apartment community to continue.
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name or city"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Loading societies…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No societies found.</p>
        ) : (
          filtered.map((society) => (
            <button
              key={society.id}
              onClick={() => handleSelect(society)}
              disabled={selecting === society.id}
              className="w-full rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{society.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {society.address || society.city}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{society.status}</Badge>
              </div>
              <div className="mt-3">
                <Button size="sm" variant="outline" disabled={selecting === society.id}>
                  {selecting === society.id ? "Selecting…" : "Select"}
                </Button>
              </div>
            </button>
          ))
        )}
      </div>
    </main>
  );
}
