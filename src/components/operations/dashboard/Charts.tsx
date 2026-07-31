"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Settings } from "lucide-react";

type PickupStats = {
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
};

export function Charts({ data }: { data: PickupStats | null }) {
  const router = useRouter();
  
  if (!data) return null;

  const totalDonut = data.donut.scheduled + data.donut.pickedUp + data.donut.pending + data.donut.cancelled;
  
  // Calculate SVG circle properties for Donut (radius 40, circumference ~251.2)
  const c = 251.2;
  const pickedUpPct = totalDonut ? (data.donut.pickedUp / totalDonut) * c : 0;
  const scheduledPct = totalDonut ? (data.donut.scheduled / totalDonut) * c : 0;
  const cancelledPct = totalDonut ? (data.donut.cancelled / totalDonut) * c : 0;
  // pending is not shown on donut separately from scheduled in this simple viz, or we can just show 4 slices
  const pendingPct = totalDonut ? (data.donut.pending / totalDonut) * c : 0;

  // Calculate Gauge properties (half circle, radius 40, circumference ~125.6)
  const gaugeC = 125.6;
  const capacityPct = data.gauge.capacityTotal ? (data.gauge.capacityBooked / data.gauge.capacityTotal) * gaugeC : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Today's Pickup Donut */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Today's Pickups</h3>
          <p className="text-xs text-slate-500 mb-6">Status breakdown for today's orders</p>
        </div>
        
        <div className="flex items-center gap-6 mb-6">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
              {/* Picked Up (Teal) */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0d9488" strokeWidth="16" strokeDasharray={`${pickedUpPct} ${c}`} strokeDashoffset="0" className="transition-all duration-1000 ease-out" />
              {/* Scheduled (Blue) */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeDasharray={`${scheduledPct} ${c}`} strokeDashoffset={`-${pickedUpPct}`} className="transition-all duration-1000 ease-out" />
              {/* Pending (Amber) */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray={`${pendingPct} ${c}`} strokeDashoffset={`-${pickedUpPct + scheduledPct}`} className="transition-all duration-1000 ease-out" />
              {/* Cancelled (Red) */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="16" strokeDasharray={`${cancelledPct} ${c}`} strokeDashoffset={`-${pickedUpPct + scheduledPct + pendingPct}`} className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{totalDonut}</span>
              <span className="text-[10px] text-slate-500 uppercase">Total</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-teal-600"></span><span className="text-slate-600">Picked Up</span></div>
              <span className="font-semibold text-slate-900">{data.donut.pickedUp}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500"></span><span className="text-slate-600">Scheduled</span></div>
              <span className="font-semibold text-slate-900">{data.donut.scheduled}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500"></span><span className="text-slate-600">Pending</span></div>
              <span className="font-semibold text-slate-900">{data.donut.pending}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500"></span><span className="text-slate-600">Cancelled</span></div>
              <span className="font-semibold text-slate-900">{data.donut.cancelled}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push('/operations/pickups')}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors"
        >
          Open Today's Pickup <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Slot Utilization Gauge */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Pickup Slot Utilization</h3>
          <p className="text-xs text-slate-500 mb-6">Capacity vs Booked for today</p>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative h-32 w-48 shrink-0 overflow-hidden">
            <svg viewBox="0 0 100 50" className="h-full w-full">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="transparent" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" />
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="transparent" 
                stroke={data.gauge.capacityBooked / data.gauge.capacityTotal > 0.9 ? "#ef4444" : "#0d9488"} 
                strokeWidth="16" 
                strokeLinecap="round"
                strokeDasharray={`${gaugeC}`}
                strokeDashoffset={`${gaugeC - capacityPct}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2">
              <span className="text-3xl font-bold text-slate-900">{Math.round((data.gauge.capacityBooked / Math.max(data.gauge.capacityTotal, 1)) * 100)}%</span>
              <span className="text-xs text-slate-500">Utilization</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 w-full gap-4 mt-6 pt-6 border-t border-slate-100 text-center">
            <div>
              <p className="text-xs text-slate-500 mb-1">Capacity</p>
              <p className="text-lg font-bold text-slate-900">{data.gauge.capacityTotal}</p>
            </div>
            <div className="border-l border-r border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Booked</p>
              <p className="text-lg font-bold text-slate-900">{data.gauge.capacityBooked}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Available</p>
              <p className="text-lg font-bold text-emerald-600">{data.gauge.available}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push('/operations/pickup-slots')}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors"
        >
          Manage Slots <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
