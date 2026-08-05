"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import {
  Search,
  RefreshCw,
  ChevronDown,
  Truck,
  Package,
  Shirt,
  Wind,
  Droplets,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  User,
  Filter,
  X,
  ArrowRight,
  Sparkles,
  Scissors
} from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { operationsNav } from "@/lib/portal-nav";
import { api } from "@/frontend/api-client";
import { cn } from "@/lib/utils/cn";

// ─── Pipeline stages ────────────────────────────────────────────────────────

export const PIPELINE_STAGES = [
  {
    id: "receiving",
    label: "Receiving",
    icon: Package,
    color: "#f59e0b",
    bgLight: "rgba(245,158,11,0.12)",
    statuses: ["Picked Up"],
    nextStatus: "In Wash",
    nextAction: "Start Washing →",
  },
  {
    id: "washing",
    label: "Washing",
    icon: Droplets,
    color: "#00a8a8",
    bgLight: "rgba(0,168,168,0.12)",
    statuses: ["In Wash"],
    nextStatus: "Dry",
    nextAction: "Start Drying →",
  },
  {
    id: "drying",
    label: "Drying",
    icon: Wind,
    color: "#0ea5e9",
    bgLight: "rgba(14,165,233,0.12)",
    statuses: ["Dry"],
    nextStatus: "Iron",
    nextAction: "Start Ironing →",
  },
  {
    id: "ironing",
    label: "Ironing",
    icon: Shirt,
    color: "#a855f7",
    bgLight: "rgba(168,85,247,0.12)",
    statuses: ["Iron"],
    nextStatus: "QC Hold",
    nextAction: "Start QC →",
  },
  {
    id: "qc_hold",
    label: "QC Hold",
    icon: AlertTriangle,
    color: "#ef4444",
    bgLight: "rgba(239,68,68,0.12)",
    statuses: ["QC Hold"],
    nextStatus: "In Wash",
    nextAction: "Complete QC →",
  },
] as const;

type StageId = string;

export type StageData = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  statuses: readonly string[];
  nextStatus: string;
  nextAction: string;
  date?: string;
  time?: string;
  operator?: string;
};

// ─── Types ───────────────────────────────────────────────────────────────────

type Priority = "urgent" | "express" | "normal";

type ProcessingOrder = {
  id: string;
  resident: string;
  flat: string;
  garments: number;
  priority: Priority;
  services: string[];
  currentStatus: string;
  stageId: StageId | null;
  stageIndex: number;
  nextStatus: string | null;
  nextAction: string | null;
  estimatedCompletion: string;
  assignedOperator: string;
  updatedAt: string;
  startedTime: string;
  elapsedTime: string;
  pipelineStages: StageData[];
};

function mapRawOrder(row: Record<string, unknown>): ProcessingOrder {
  const status = String(row.status ?? "");
  const code = String(row.order_code ?? "");
  
  // Deterministic mock generation based on order code
  const isUrgent = code.includes("5") || code.includes("1");
  const isExpress = code.includes("2") || code.includes("4");
  const priority: Priority = isUrgent ? "urgent" : isExpress ? "express" : "normal";

  const hasStain = code.includes("3") || code.includes("6");
  const hasAlteration = code.includes("7");
  const hasFolding = code.includes("8") || code.includes("9");

  const pipeline: StageData[] = [...PIPELINE_STAGES];

  if (hasStain) {
    pipeline.push({
      id: "stain_removal", label: "Stain Removal", icon: Sparkles, color: "#ec4899", bgLight: "rgba(236,72,153,0.12)", statuses: ["Stain Removal"], nextStatus: "In Wash", nextAction: "Complete Stain Removal →"
    });
  }
  if (hasAlteration) {
    pipeline.push({
      id: "alteration", label: "Alteration", icon: Scissors, color: "#f43f5e", bgLight: "rgba(244,63,94,0.12)", statuses: ["Alteration"], nextStatus: "Packing", nextAction: "Complete Alteration →"
    });
  }
  if (hasFolding) {
    pipeline.push({
      id: "folding", label: "Folding", icon: Package, color: "#3b82f6", bgLight: "rgba(59,130,246,0.12)", statuses: ["Folding"], nextStatus: "Packing", nextAction: "Pack Order →"
    });
  }
  
  if (hasAlteration || hasFolding) {
      pipeline.push({
        id: "packing", label: "Packing", icon: Package, color: "#10b981", bgLight: "rgba(16,185,129,0.12)", statuses: ["Packing"], nextStatus: "Ready for Dispatch", nextAction: "Ready for Dispatch →"
      });
  }

  const flatParts = [row.tower_block, row.unit_number].filter(Boolean);

  let stageIndex = pipeline.findIndex((s) => s.statuses.includes(status));
  if (stageIndex === -1 && status === "Delivered") {
      stageIndex = pipeline.length;
  } else if (stageIndex === -1) {
      stageIndex = 0;
  }
  const stage = pipeline[stageIndex];
  
  let statusHistory: Array<{status: string, time: string}> = [];
  try {
    if (Array.isArray(row.status_history)) {
      statusHistory = row.status_history;
    } else if (typeof row.status_history === "string") {
      statusHistory = JSON.parse(row.status_history);
    }
  } catch (e) {
    // Ignore
  }

  const enrichedPipeline = pipeline.map((s, idx) => {
    let stageTimestamp = "";
    for (const st of statusHistory) {
      if (s.statuses.includes(st.status) && st.time) {
        stageTimestamp = st.time;
        break;
      }
    }
    
    if (idx === stageIndex && !stageTimestamp && row.updated_at) {
      stageTimestamp = String(row.updated_at);
    }

    if (!stageTimestamp) {
      return {
        ...s,
        date: "—",
        time: "—",
        operator: "—",
      };
    }

    const dt = new Date(stageTimestamp);
    if (isNaN(dt.getTime())) {
      return {
        ...s,
        date: "—",
        time: "—",
        operator: "—",
      };
    }

    return {
      ...s,
      date: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      time: dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase(),
      operator: "Operator",
    };
  });

  const servicesList: string[] = [];
  if (hasStain) servicesList.push("Stain Removal");
  if (hasAlteration) servicesList.push("Alteration");
  if (hasFolding) servicesList.push("Folding");

  let elapsedTime = "—";
  let estimatedCompletion = "—";
  let startedTime = "—";
  let activeStageRawTime = "";

  if (stage) {
    for (const st of statusHistory) {
      if (stage.statuses.includes(st.status) && st.time) {
        activeStageRawTime = st.time;
        break;
      }
    }
  }
  if (!activeStageRawTime && row.updated_at) {
    activeStageRawTime = String(row.updated_at);
  }

  if (activeStageRawTime) {
    const activeDt = new Date(activeStageRawTime);
    if (!isNaN(activeDt.getTime())) {
      startedTime = activeDt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
      
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - activeDt.getTime());
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        elapsedTime = `${diffMins} Minutes`;
      } else {
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        elapsedTime = `${hrs} hr ${mins} min`;
      }
      
      const etaDt = new Date(activeDt.getTime() + 4 * 60 * 60 * 1000);
      estimatedCompletion = etaDt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
    }
  }

  return {
    id: code,
    resident: String(row.resident_name ?? "Resident"),
    flat: flatParts.length ? flatParts.join("-") : "—",
    garments: Number(row.pickup_garment_count ?? 0),
    priority,
    services: servicesList,
    currentStatus: status,
    stageId: stage?.id ?? null,
    stageIndex,
    nextStatus: stage?.nextStatus ?? null,
    nextAction: stage?.nextAction ?? null,
    estimatedCompletion,
    assignedOperator: enrichedPipeline[stageIndex]?.operator || "Operator",
    updatedAt: String(row.updated_at ?? ""),
    startedTime,
    elapsedTime,
    pipelineStages: enrichedPipeline,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const config = {
    urgent: { label: "Urgent", icon: AlertTriangle, cls: "bg-amber-500/15 text-amber-600 border-amber-400/30 dark:text-amber-400" },
    express: { label: "Express", icon: Zap, cls: "bg-purple-500/15 text-purple-600 border-purple-400/30 dark:text-purple-400" },
    normal: { label: "Normal", icon: null, cls: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700" },
  }[priority];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", config.cls)}>
      {Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}

function ServiceChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
  );
}

function PipelineTimeline({ stages, stageIndex, stageId }: { stages: StageData[]; stageIndex: number; stageId: string | null }) {
  return (
    <div className="relative flex items-start gap-0 overflow-x-auto py-1 scrollbar-thin">
      {stages.map((stage, idx) => {
        const isDone = idx < stageIndex;
        const isActive = idx === stageIndex && stage.id === stageId;
        const isPending = idx > stageIndex;
        const Icon = stage.icon;
        const isLast = idx === stages.length - 1;

        return (
          <div key={stage.id} className="flex min-w-0 flex-1 items-start">
            {/* Node */}
            <div className="flex flex-col items-center gap-1 min-w-[72px] shrink-0">
              <div
                className={cn(
                  "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isDone && "border-transparent bg-emerald-500",
                  isActive && "border-2 shadow-lg",
                  isPending && "border-border bg-muted/40",
                )}
                style={
                  isActive
                    ? {
                        borderColor: stage.color,
                        background: stage.bgLight,
                        boxShadow: `0 0 0 3px ${stage.color}22`,
                      }
                    : undefined
                }
              >
                {isDone ? (
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 text-white" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: isActive ? stage.color : isPending ? "var(--muted-foreground)" : "white" }}
                  />
                )}
                {isActive && (
                  <span
                    className="absolute -inset-1.5 animate-ping rounded-full opacity-30"
                    style={{ background: stage.color }}
                  />
                )}
              </div>
              
              <span
                className={cn(
                  "w-16 text-center text-[9px] font-medium leading-tight whitespace-normal",
                  isDone && "text-emerald-600 dark:text-emerald-400",
                  isActive && "font-bold",
                  isPending && "text-muted-foreground",
                )}
                style={isActive ? { color: stage.color } : undefined}
              >
                {stage.label}
              </span>

              {/* Timestamp and Operator */}
              <div className="flex flex-col items-center text-center mt-0.5 space-y-1">
                {isDone || isActive ? (
                  <>
                    <div className="flex flex-col text-[10px] text-muted-foreground font-medium leading-tight">
                      <span>{stage.date}</span>
                      <span>{stage.time}</span>
                    </div>
                    
                  </>
                ) : (
                  <span className="text-muted-foreground text-xs mt-1">--</span>
                )}
              </div>
            </div>
            
            {/* Connector line */}
            {!isLast && (
              <div className="mt-3.5 h-0.5 flex-1 min-w-[12px]" style={{
                background: isDone
                  ? "linear-gradient(to right, #10b981, #10b981)"
                  : isActive
                  ? `linear-gradient(to right, ${stage.color}, var(--border))`
                  : "var(--border)",
                opacity: isPending && !isActive ? 0.4 : 1,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-28 rounded" />
          <div className="skeleton-shimmer h-3 w-44 rounded" />
        </div>
        <div className="skeleton-shimmer h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton-shimmer h-10 w-full rounded-lg" />
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="skeleton-shimmer h-3 w-32 rounded" />
        <div className="skeleton-shimmer h-8 w-28 rounded-lg" />
      </div>
    </div>
  );
}

const OrderCard = memo(function OrderCard({
  order,
  isBusy,
  onAdvance,
}: {
  order: ProcessingOrder;
  isBusy: boolean;
  onAdvance: (id: string) => void;
}) {
  const stage = order.stageId ? order.pipelineStages.find((s) => s.id === order.stageId) : null;

  return (
    <div
      className={cn(
        "fade-up group overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        isBusy && "opacity-60 pointer-events-none",
      )}
      style={stage ? { borderColor: `${stage.color}33` } : undefined}
    >
      {/* Top accent bar */}
      {stage && (
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(to right, ${stage.color}, transparent)` }} />
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold text-foreground">{order.id}</span>
              <PriorityBadge priority={order.priority} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {order.resident}
              {order.flat !== "—" && ` · Flat ${order.flat}`}
              {" · "}
              <span className="font-medium">{order.garments} garments</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {order.services.map((s) => (
              <ServiceChip key={s} label={s} />
            ))}
          </div>
        </div>

        {/* Pipeline timeline */}
        <div className="mt-5 mb-2">
          <PipelineTimeline stages={order.pipelineStages} stageIndex={order.stageIndex} stageId={order.stageId} />
        </div>

        {/* Footer row */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          
          <div className="flex flex-wrap items-center gap-6 text-xs">
            {stage && (
              <div className="flex flex-col">
                <span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider font-bold mb-0.5">Current Stage</span>
                <span className="font-semibold text-sm" style={{ color: stage.color }}>
                  {stage.label}
                </span>
              </div>
            )}
            
            <div className="w-px h-8 bg-border hidden sm:block" />
            
            <div className="flex flex-col">
              <span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider font-bold mb-0.5">Started</span>
              <span className="font-medium text-foreground text-sm">{order.startedTime}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider font-bold mb-0.5">ETA</span>
              <span className="font-medium text-foreground text-sm">{order.estimatedCompletion}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider font-bold mb-0.5">Elapsed</span>
              <span className="font-medium text-foreground text-sm">{order.elapsedTime}</span>
            </div>
            
          </div>

          {/* Action button */}
          {order.nextAction ? (
            <button
              type="button"
              onClick={() => onAdvance(order.id)}
              disabled={isBusy}
              className={cn(
                "inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 mt-2 lg:mt-0",
                "hover:brightness-110 hover:shadow-md active:scale-95",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              style={stage ? { background: `linear-gradient(135deg, ${stage.color}, ${stage.color}cc)` } : { background: "var(--primary)" }}
            >
              {isBusy ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {isBusy ? "Updating…" : order.nextAction}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-2 lg:mt-0">
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </span>
          )}
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  return prev.order.id === next.order.id 
    && prev.order.currentStatus === next.order.currentStatus
    && prev.order.updatedAt === next.order.updatedAt
    && prev.isBusy === next.isBusy;
});

// ─── Main page ───────────────────────────────────────────────────────────────

const ALL_STAGES_FILTER = "all";

type StageFilter = typeof ALL_STAGES_FILTER | StageId;

const PRIORITY_OPTIONS: { value: Priority | "all"; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "express", label: "Express" },
  { value: "normal", label: "Normal" },
];

export default function ProcessingCenterPage({ initialStage }: { initialStage?: string }) {
  const [orders, setOrders] = useState<ProcessingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [stageFilter, setStageFilter] = useState<StageFilter>(
    (initialStage as StageFilter | undefined) ?? ALL_STAGES_FILTER,
  );
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isPulsing, setIsPulsing] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const loadQueue = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.operations.queue();
      const mapped = data.queue
        .map(mapRawOrder)
        .filter((order) => order.stageId !== null);
      setOrders(mapped);
      setLastRefresh(new Date());
      if (silent) {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 800);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load queue", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadQueue();
    autoRefreshRef.current = setInterval(() => void loadQueue(true), 30_000);
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [loadQueue]);

  async function advance(id: string) {
    const order = orders.find((o) => o.id === id);
    if (!order || !order.nextStatus || !order.nextAction) return;
    setBusyId(id);
    try {
      await api.operations.updateStatus(order.id, order.nextStatus);
      // Optimistic update: Just reload the queue rather than complex state mutation so mock data regenerates nicely.
      // Doing this silently preserves scroll position thanks to React.memo filtering re-renders
      await loadQueue(true);
      showToast(`✓ ${order.id}: Advanced to next stage`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Status update failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (stageFilter !== ALL_STAGES_FILTER && o.stageId !== stageFilter) return false;
      if (priorityFilter !== "all" && o.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.id.toLowerCase().includes(q) && !o.resident.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [orders, stageFilter, priorityFilter, search]);

  // Stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const o of orders) {
      if (o.stageId) counts[o.stageId] = (counts[o.stageId] ?? 0) + 1;
    }
    return counts;
  }, [orders]);

  const lastRefreshStr = lastRefresh.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <PortalShell
      navItems={operationsNav}
      portalLabel="Operations Portal"
      greeting="Processing Center"
      subtitle="Unified laundry lifecycle — all orders, one view"
    >
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fade-up fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-medium shadow-xl backdrop-blur-xl",
            toast.type === "success"
              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "border-red-400/30 bg-red-500/15 text-red-700 dark:text-red-300",
          )}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Control bar */}
      <div className="mb-6 space-y-4">
        {/* Search + filters row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="processing-center-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID or resident…"
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-9 text-sm shadow-sm transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Priority filter */}
          <div className="relative">
            <button
              id="priority-filter-btn"
              type="button"
              onClick={() => setShowPriorityMenu((v) => !v)}
              className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted"
            >
              <Filter className="h-4 w-4" />
              {PRIORITY_OPTIONS.find((p) => p.value === priorityFilter)?.label}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {showPriorityMenu && (
              <div className="absolute right-0 top-12 z-20 min-w-[160px] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setPriorityFilter(opt.value as Priority | "all");
                      setShowPriorityMenu(false);
                    }}
                    className={cn(
                      "flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-muted",
                      priorityFilter === opt.value && "bg-primary/10 font-semibold text-primary",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh button + live indicator */}
          <div className="flex items-center gap-2">
            <button
              id="processing-center-refresh"
              type="button"
              onClick={() => void loadQueue()}
              disabled={loading}
              className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
            <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <span
                className={cn(
                  "h-2 w-2 rounded-full bg-emerald-500 transition-all",
                  isPulsing && "scale-150 opacity-50",
                )}
              />
              {lastRefreshStr}
            </div>
          </div>
        </div>

        {/* Stage filter tabs */}
        <div className="flex flex-wrap gap-2">
          {/* All tab */}
          <button
            id="stage-filter-all"
            type="button"
            onClick={() => setStageFilter(ALL_STAGES_FILTER)}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-all",
              stageFilter === ALL_STAGES_FILTER
                ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            All
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[11px] font-bold text-primary">
              {stageCounts.all ?? 0}
            </span>
          </button>

          {PIPELINE_STAGES.slice(0, -1).map((stage) => {
            const Icon = stage.icon;
            const count = stageCounts[stage.id] ?? 0;
            const isActive = stageFilter === stage.id;
            return (
              <button
                key={stage.id}
                id={`stage-filter-${stage.id}`}
                type="button"
                onClick={() => setStageFilter(stage.id)}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-all",
                  isActive
                    ? "border-transparent text-white shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
                style={
                  isActive
                    ? { background: `linear-gradient(135deg, ${stage.color}, ${stage.color}cc)`, borderColor: `${stage.color}44` }
                    : undefined
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {stage.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary strip */}
      <div className="mb-5 flex flex-wrap gap-3">
        {[
          { label: "Total in pipeline", value: orders.length, color: "var(--primary)" },
          { label: "Filtered results", value: filteredOrders.length, color: "#6366f1" },
          { label: "Urgent / Express", value: orders.filter((o) => o.priority !== "normal").length, color: "#f59e0b" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm shadow-sm"
          >
            <span
              className="text-lg font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
            <span className="text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Order list */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 py-20 text-center">
            <CheckCircle2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-base font-semibold text-muted-foreground">
              {orders.length === 0 ? "Queue is clear" : "No orders match your filters"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {orders.length === 0
                ? "New orders will appear here automatically every 30 seconds."
                : "Try adjusting the stage or priority filter."}
            </p>
            {(stageFilter !== ALL_STAGES_FILTER || priorityFilter !== "all" || search) && (
              <button
                type="button"
                onClick={() => { setStageFilter(ALL_STAGES_FILTER); setPriorityFilter("all"); setSearch(""); }}
                className="mt-4 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isBusy={busyId === order.id}
              onAdvance={(id) => void advance(id)}
            />
          ))
        )}
      </div>
    </PortalShell>
  );
}
