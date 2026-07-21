"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RotateCcw } from "lucide-react";
import type { ResidentFilters, SocietyOpt } from "./types";

interface TowerOpt {
  id: string;
  name: string;
}

interface FloorOpt {
  id: string;
  floor_number: number;
  label: string;
}

interface PlanOpt {
  id: string;
  tier: string;
}

export function ResidentsFilters({
  filters,
  societies,
  onChange,
  onReset,
}: {
  filters: ResidentFilters;
  societies: SocietyOpt[];
  onChange: (f: Partial<ResidentFilters>) => void;
  onReset: () => void;
}) {
  const [towers, setTowers] = useState<TowerOpt[]>([]);
  const [floors, setFloors] = useState<FloorOpt[]>([]);
  const [plans, setPlans] = useState<PlanOpt[]>([]);
  const [selectedTowerId, setSelectedTowerId] = useState<string>("");

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  // Load plans dynamically
  useEffect(() => {
    fetch("/api/admin/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.plans) {
          setPlans(data.plans);
        }
      })
      .catch((err) => console.error("Error loading subscription plans:", err));
  }, []);

  // Load towers when society changes
  useEffect(() => {
    if (!filters.societyId) {
      setTowers([]);
      setFloors([]);
      setSelectedTowerId("");
      onChange({ tower: "", floor: "" });
      return;
    }

    fetch(`/api/admin/societies/${filters.societyId}/towers`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.towers) {
          setTowers(data.towers);
        }
      })
      .catch((err) => console.error("Error loading towers:", err));
    
    // Clear dependent selections
    setFloors([]);
    setSelectedTowerId("");
    onChange({ tower: "", floor: "" });
  }, [filters.societyId]);

  // Load floors when tower changes
  useEffect(() => {
    if (!selectedTowerId) {
      setFloors([]);
      onChange({ floor: "" });
      return;
    }

    fetch(`/api/admin/towers/${selectedTowerId}/floors`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.floors) {
          setFloors(data.floors);
        }
      })
      .catch((err) => console.error("Error loading floors:", err));

    onChange({ floor: "" });
  }, [selectedTowerId]);

  const handleTowerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selected = towers.find((t) => t.id === val);
    setSelectedTowerId(val);
    onChange({ tower: selected ? selected.name : "" });
  };

  const handleReset = () => {
    setSelectedTowerId("");
    setTowers([]);
    setFloors([]);
    onReset();
  };

  return (
    <Card className="mb-6 border-border/60 shadow-sm bg-card">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 items-end">
          
          {/* Search Bar */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Search ID, name, phone, flat..."
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
            />
          </div>

          {/* Society Dropdown */}
          <div>
            <select
              className={selectClass}
              value={filters.societyId}
              onChange={(e) => onChange({ societyId: e.target.value })}
            >
              <option value="">All Societies</option>
              {societies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tower Dropdown */}
          <div>
            <select
              className={selectClass}
              disabled={!filters.societyId}
              value={selectedTowerId}
              onChange={handleTowerChange}
            >
              <option value="">All Towers</option>
              {towers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Floor Dropdown */}
          <div>
            <select
              className={selectClass}
              disabled={!selectedTowerId}
              value={filters.floor}
              onChange={(e) => onChange({ floor: e.target.value })}
            >
              <option value="">All Floors</option>
              {floors.map((f) => (
                <option key={f.id} value={f.label}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subscription Dropdown */}
          <div>
            <select
              className={selectClass}
              value={filters.subscription}
              onChange={(e) => onChange({ subscription: e.target.value })}
            >
              <option value="">All Subscriptions</option>
              {plans.map((p) => (
                <option key={p.id} value={p.tier}>
                  {p.tier}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              className={selectClass}
              value={filters.status}
              onChange={(e) => onChange({ status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending Verification</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              className={selectClass}
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">A → Z</option>
              <option value="z-a">Z → A</option>
              <option value="orders">Most Orders</option>
              <option value="wallet">Highest Wallet</option>
              <option value="premium">Premium First</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
