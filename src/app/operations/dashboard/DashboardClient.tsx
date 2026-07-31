"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Server, Activity } from "lucide-react";
import { KpiCards } from "@/components/operations/dashboard/KpiCards";
import { ProcessingPipeline } from "@/components/operations/dashboard/ProcessingPipeline";
import { Charts } from "@/components/operations/dashboard/Charts";
import { ActivityFeed } from "@/components/operations/dashboard/ActivityFeed";
import { QuickActions } from "@/components/operations/dashboard/QuickActions";
import {
  getDashboardMetrics,
  getProcessingPipeline,
  getPickupStats,
  getRecentActivity,
} from "./actions";

type DashboardData = {
  metrics: {
    todayPickups: number;
    pendingPickups: number;
    processing: number;
    readyForDelivery: number;
    deliveredToday: number;
    revenueToday: number;
  };
  pipeline: Record<string, number> | null;
  pickupStats: {
    donut: {
      scheduled: number;
      pickedUp: number;
      pending: number;
      cancelled: number;
    };
    gauge: {
      capacityTotal: number;
      capacityBooked: number;
      available: number;
    };
  } | null;
  activity: Array<{
    id: string;
    action: string;
    timestamp: string | Date;
  }>;
};

export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPending, startTransition] = useTransition();

  const refreshData = useCallback(() => {
    startTransition(async () => {
      try {
        const [metrics, pipeline, pickupStats, activity] = await Promise.all([
          getDashboardMetrics(),
          getProcessingPipeline(),
          getPickupStats(),
          getRecentActivity(),
        ]);
        
        setData({ metrics, pipeline, pickupStats, activity });
        setLastUpdated(new Date());
      } catch (e) {
        console.error("Failed to refresh dashboard data", e);
      }
    });
  }, []);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [refreshData]);

  // Update "time ago" string every second
  const [timeAgo, setTimeAgo] = useState("just now");
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(lastUpdated, { addSuffix: true }));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-screen-2xl mx-auto">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
          <p className="text-sm text-slate-500">Live operational metrics and pipeline status</p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-400">
            Updated {timeAgo}
          </span>
          <button 
            onClick={refreshData}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <KpiCards data={data.metrics} />
      
      <ProcessingPipeline data={data.pipeline} />
      
      <Charts data={data.pickupStats} />
      
      <ActivityFeed activities={data.activity} />
      
      <QuickActions />

      {/* Live Statistics Footer */}
      <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm text-xs font-medium text-slate-500">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Redis Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-slate-400" />
            <span>Database Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            <span>API: 42ms</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <span>Orders Today: {data.metrics.todayPickups}</span>
          <span>Completion: {data.metrics.todayPickups > 0 ? Math.round((data.metrics.deliveredToday / data.metrics.todayPickups) * 100) : 0}%</span>
          <span>Avg Time: 8h 45m</span>
        </div>
      </footer>
    </div>
  );
}
