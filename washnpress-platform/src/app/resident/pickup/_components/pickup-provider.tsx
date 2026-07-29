"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useResident } from "@/components/resident/resident-provider";
import {
  buildDateOptions,
  GARMENT_OPTIONS,
  PICKUP_STEPS,
  SERVICE_OPTIONS,
  STEP_ORDER,
  totalGarmentCount,
} from "../_data/pickup-constants";
import type {
  GarmentOption,
  PickupBookingState,
  PickupDateOption,
  PickupSlotOption,
  PickupStepId,
  ServiceOption,
} from "../_types/pickup.types";
import { confirmPickupBooking, fetchPickupSlots } from "../services/pickup.services";

type PickupContextValue = PickupBookingState & {
  dates: PickupDateOption[];
  slots: PickupSlotOption[];
  selectedSlot: PickupSlotOption | null;
  garmentOptions: GarmentOption[];
  serviceOptions: ServiceOption[];
  taxRate: number;
  deliveryFee: number;
  canContinue: boolean;
  bookingError: string | null;
  setDate: (iso: string) => void;
  setSlot: (id: string) => void;
  setGarmentQty: (id: string, qty: number) => void;
  addCustomGarment: (name: string, qty: number) => void;
  toggleService: (id: string) => void;
  setAllocationQty: (garmentId: string, serviceId: string, qty: number) => void;
  setInstructions: (value: string) => void;
  goNext: () => void;
  goBack: () => void;
  resetBooking: () => void;
  confirmBooking: () => Promise<void>;
};

const PickupContext = createContext<PickupContextValue | null>(null);

const initialGarments = Object.fromEntries(
  ["shirts", "trousers", "dresses", "bedding", "towels", "others"].map((id) => [id, 0]),
);

function buildDefaultGarments(options: GarmentOption[]) {
  return Object.fromEntries(options.map((option) => [option.id, 0]));
}

function createInitialState(): PickupBookingState {
  const dates = buildDateOptions();
  return {
    step: "slot",
    selectedDate: dates[0]?.iso ?? null,
    selectedSlotId: null,
    garments: { ...initialGarments },
    selectedServiceIds: ["wash-fold"],
    allocations: Object.fromEntries(Object.keys(initialGarments).map((k) => [k, []])),
    instructions: "",
    bookingId: null,
    submitting: false,
    slotsLoading: true,
    direction: 1,
  };
}

export function PickupProvider({ children }: { children: ReactNode }) {
  const { reschedulePickup, refresh } = useResident();
  const [state, setState] = useState<PickupBookingState>(createInitialState);
  const [slots, setSlots] = useState<PickupSlotOption[]>([]);
  const [garmentOptions, setGarmentOptions] = useState<GarmentOption[]>(GARMENT_OPTIONS);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>(SERVICE_OPTIONS);
  const [taxRate, setTaxRate] = useState(0.05);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const dates = useMemo(() => buildDateOptions(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog/pricing", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const garments = (data.garments as Array<Record<string, unknown>>) ?? [];
        const addons = (data.addons as Array<Record<string, unknown>>) ?? [];
        const settings = data.settings as Record<string, unknown> | undefined;

        if (garments.length) {
          const mapped: GarmentOption[] = garments.map((g) => ({
            id: String(g.id),
            name: String(g.name),
            description: `Wash ₹${g.wash_price_inr} · Iron ₹${g.iron_price_inr} · Dry clean ₹${g.dry_clean_price_inr}`,
            icon: "shirt",
            weightKg: 0.3,
            priceInr: Number(g.wash_price_inr ?? g.price_inr ?? 0),
          }));
          setGarmentOptions(mapped);
          setState((s) => ({
            ...s,
            garments: Object.fromEntries(mapped.map((g) => [g.id, s.garments[g.id] ?? 0])),
            allocations: Object.fromEntries(mapped.map((g) => [g.id, s.allocations?.[g.id] ?? []])),
          }));
        }

        if (addons.length) {
          const mapped: ServiceOption[] = addons.map((a) => ({
            id: String(a.id),
            name: String(a.name),
            description: String(a.description ?? ""),
            priceInr: Number(a.price_inr ?? 0),
            icon: String(a.icon ?? "sparkles"),
          }));
          setServiceOptions(mapped);
          setState((s) => ({
            ...s,
            selectedServiceIds:
              s.selectedServiceIds.filter((id) => mapped.some((m) => m.id === id)).length > 0
                ? s.selectedServiceIds.filter((id) => mapped.some((m) => m.id === id))
                : mapped[0]
                  ? [mapped[0].id]
                  : [],
          }));
        }

        if (settings) {
          const gst = Number(settings.gst_percent ?? 5) / 100;
          setTaxRate(gst);
          const fee = Number(settings.delivery_fee_inr ?? 0);
          const thr = Number(settings.free_delivery_threshold_inr ?? 0);
          setDeliveryFee(fee);
          void thr;
        }
      } catch {
        // Keep fallback constants
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState((s) => ({ ...s, slotsLoading: true }));
      setBookingError(null);
      try {
        const data = await fetchPickupSlots();
        if (cancelled) return;
        setSlots(data);
        const firstAvailable = data.find((s) => s.remainingCapacity > 0);
        setState((s) => ({
          ...s,
          slotsLoading: false,
          selectedDate: firstAvailable?.date ?? s.selectedDate,
        }));
      } catch (err) {
        if (cancelled) return;
        setSlots([]);
        setState((s) => ({ ...s, slotsLoading: false }));
        setBookingError(err instanceof Error ? err.message : "Failed to load pickup slots");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === state.selectedSlotId) ?? null,
    [slots, state.selectedSlotId],
  );

  const canContinue = useMemo(() => {
    switch (state.step) {
      case "slot":
        return Boolean(state.selectedSlotId);
      case "garments":
        return totalGarmentCount(state.garments) > 0;
      case "addons":
        // ensure every garment with a positive count has allocations summing to its count
        return Object.entries(state.garments).every(([id, qty]) => {
          if ((qty ?? 0) <= 0) return true;
          const alloc = state.allocations?.[id] ?? [];
          const totalAllocated = alloc.reduce((s, a) => s + (a.qty ?? 0), 0);
          return totalAllocated === qty;
        });
      case "review":
        return Boolean(state.selectedSlotId) && totalGarmentCount(state.garments) > 0;
      default:
        return false;
    }
  }, [state]);

  const setStep = useCallback((step: PickupStepId, direction: 1 | -1) => {
    setState((s) => ({ ...s, step, direction }));
  }, []);

  const goNext = useCallback(() => {
    if (state.step === "review" || state.step === "success") return;
    const idx = STEP_ORDER.indexOf(state.step);
    const next = STEP_ORDER[idx + 1];
    if (next) setStep(next, 1);
  }, [state.step, setStep]);

  const goBack = useCallback(() => {
    if (state.step === "slot" || state.step === "success") return;
    const idx = STEP_ORDER.indexOf(state.step);
    const prev = STEP_ORDER[idx - 1];
    if (prev) setStep(prev, -1);
  }, [state.step, setStep]);

  const setDate = useCallback((iso: string) => {
    setState((s) => {
      const stillValid = slots.some((slot) => slot.id === s.selectedSlotId && slot.date === iso);
      return {
        ...s,
        selectedDate: iso,
        selectedSlotId: stillValid ? s.selectedSlotId : null,
      };
    });
  }, [slots]);

  const setSlot = useCallback((id: string) => {
    setState((s) => ({ ...s, selectedSlotId: id }));
  }, []);

  const setGarmentQty = useCallback((id: string, qty: number) => {
    setState((s) => ({
      ...s,
      garments: { ...s.garments, [id]: Math.max(0, Math.min(50, qty)) },
      allocations: { ...s.allocations, [id]: (s.allocations?.[id] ?? []).filter((a) => a.qty > 0) },
    }));
  }, []);

  const setAllocationQty = useCallback((garmentId: string, serviceId: string, qty: number) => {
    setState((s) => {
      const totalAvailable = s.garments[garmentId] ?? 0;
      const safeQty = Math.max(0, Math.min(totalAvailable, Math.floor(qty ?? 0)));
      const prev = s.allocations?.[garmentId] ?? [];
      const exists = prev.some((p) => p.serviceId === serviceId);
      let nextAlloc = prev.map((p) => (p.serviceId === serviceId ? { ...p, qty: safeQty } : p));
      if (!exists) nextAlloc = [...nextAlloc, { serviceId, qty: safeQty }];
      // remove zero entries
      nextAlloc = nextAlloc.filter((p) => p.qty > 0);
      return { ...s, allocations: { ...s.allocations, [garmentId]: nextAlloc } };
    });
  }, []);

  const addCustomGarment = useCallback((name: string, qty: number) => {
    const cleaned = name.trim();
    if (!cleaned || qty <= 0) return;
    const slug = `custom-${cleaned.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
    setGarmentOptions((prev) => {
      const exists = prev.some((option) => option.id === slug);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: slug,
          name: cleaned,
          description: "Custom garment",
          icon: "package",
          weightKg: 0.35,
          priceInr: 95,
        },
      ];
    });
    setState((s) => ({
      ...s,
      garments: { ...s.garments, [slug]: Math.max(0, Math.min(50, qty)) },
    }));
  }, []);

  const toggleService = useCallback((id: string) => {
    setState((s) => {
      const exists = s.selectedServiceIds.includes(id);
      const next = exists
        ? s.selectedServiceIds.filter((x) => x !== id)
        : [...s.selectedServiceIds, id];
      if (next.length === 0) return s;
      return { ...s, selectedServiceIds: next };
    });
  }, []);

  const setInstructions = useCallback((value: string) => {
    setState((s) => ({ ...s, instructions: value }));
  }, []);

  const resetBooking = useCallback(() => {
    const next = createInitialState();
    setBookingError(null);
    setState({ ...next, slotsLoading: false });
    setGarmentOptions(GARMENT_OPTIONS);
    setServiceOptions(SERVICE_OPTIONS);
  }, []);

  const confirmBooking = useCallback(async () => {
    if (!selectedSlot) return;
    setState((s) => ({ ...s, submitting: true }));
    setBookingError(null);
    try {
      const result = await confirmPickupBooking({
        slot: selectedSlot,
        specialInstructions: state.instructions,
        allocations: state.allocations,
        garmentCounts: state.garments,
      });
      reschedulePickup(result.pickup);
      await refresh();
      setState((s) => ({
        ...s,
        submitting: false,
        bookingId: result.bookingId,
        step: "success",
        direction: 1,
      }));
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to book pickup");
      setState((s) => ({ ...s, submitting: false }));
    }
  }, [
    selectedSlot,
    state.instructions,
    state.allocations,
    state.garments,
    reschedulePickup,
    refresh,
  ]);

  const value = useMemo<PickupContextValue>(
    () => ({
      ...state,
      dates,
      slots,
      selectedSlot,
      garmentOptions,
      serviceOptions,
      taxRate,
      deliveryFee,
      canContinue,
      bookingError,
      setDate,
      setSlot,
      setGarmentQty,
      addCustomGarment,
      toggleService,
      setAllocationQty,
      setInstructions,
      goNext,
      goBack,
      resetBooking,
      confirmBooking,
    }),
    [
      state,
      dates,
      slots,
      selectedSlot,
      garmentOptions,
      serviceOptions,
      taxRate,
      deliveryFee,
      canContinue,
      bookingError,
      setDate,
      setSlot,
      setGarmentQty,
      addCustomGarment,
      toggleService,
      setInstructions,
      goNext,
      goBack,
      resetBooking,
      confirmBooking,
    ],
  );

  return <PickupContext.Provider value={value}>{children}</PickupContext.Provider>;
}

export function usePickup() {
  const ctx = useContext(PickupContext);
  if (!ctx) throw new Error("usePickup must be used within PickupProvider");
  return ctx;
}

export function usePickupStepLabel(step: PickupStepId) {
  return PICKUP_STEPS.find((s) => s.id === step)?.label ?? "Complete";
}
