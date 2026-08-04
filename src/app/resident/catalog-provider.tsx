"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { readApiJson } from "@/frontend/api-client";

export type DbGarment = {
  id: string;
  name: string;
  wash_price_inr: number;
  wash_iron_price_inr: number;
  iron_price_inr: number;
  dry_clean_price_inr: number;
  is_active: boolean;
  sort_order: number;
};

export type DbAddon = {
  id: string;
  code: string;
  name: string;
  description: string;
  price_inr: number;
  icon: string;
  is_active: boolean;
  category: string;
  priority: string;
  display_order: number;
};

export type DbSettings = {
  min_order_amount_inr: number;
  delivery_fee_inr: number;
  free_delivery_threshold_inr: number;
  express_delivery_inr: number;
  late_night_delivery_inr: number;
  gst_percent: number;
  cgst_percent: number;
  sgst_percent: number;
  service_tax_percent: number;
  packaging_fee_inr: number;
  other_charges_inr: number;
};

type CatalogResponse = {
  garments: DbGarment[];
  addons: DbAddon[];
  settings: DbSettings;
  plans: any[]; // Defined elsewhere
};

type CatalogContextValue = {
  loading: boolean;
  error: string | null;
  garments: DbGarment[];
  addons: DbAddon[];
  settings: DbSettings | null;
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [garments, setGarments] = useState<DbGarment[]>([]);
  const [addons, setAddons] = useState<DbAddon[]>([]);
  const [settings, setSettings] = useState<DbSettings | null>(null);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/catalog/pricing", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load catalog");
      const data = await readApiJson<CatalogResponse>(res);
      setGarments(data.garments || []);
      setAddons(data.addons || []);
      setSettings(data.settings || null);
    } catch (err: any) {
      console.error("Failed to fetch catalog:", err);
      setError(err.message || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return (
    <CatalogContext.Provider
      value={{
        loading,
        error,
        garments,
        addons,
        settings,
        refresh: fetchCatalog,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return context;
}
