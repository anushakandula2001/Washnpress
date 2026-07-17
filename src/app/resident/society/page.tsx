"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Users, Building2 } from "lucide-react";
import { useResident } from "@/components/resident/resident-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { societies, type Society } from "@/lib/resident-data";

export default function SocietyPage() {
  const router = useRouter();
  const { selectedSociety, selectSociety } = useResident();
  const [query, setQuery] = useState("");
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSociety) {
      router.replace("/resident");
    }
  }, [selectedSociety, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return societies;
    return societies.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q),
    );
  }, [query]);

  function handleSelect(society: Society) {
    setSelecting(society.id);
    selectSociety(society);
    router.push("/resident");
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

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your society"
          className="h-12 rounded-xl pl-10"
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No societies found. Try a different search.
          </p>
        ) : (
          filtered.map((society) => (
            <article
              key={society.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-foreground">{society.name}</h2>
                <Badge variant="success">{society.status}</Badge>
              </div>

              <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p>{society.address}</p>
                  <p>{society.city}</p>
                </div>
              </div>

              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {society.residents.toLocaleString()} residents
                </span>
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {society.distanceKm} km away
                </span>
              </div>

              <Button
                className="mt-4 w-full rounded-xl"
                onClick={() => handleSelect(society)}
                disabled={selecting === society.id}
              >
                {selecting === society.id ? "Loading..." : "Select"}
              </Button>
            </article>
          ))
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/resident")}
          className="font-medium text-primary hover:underline"
        >
          Go to Dashboard
        </button>
      </p>
    </main>
  );
}
