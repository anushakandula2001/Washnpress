"use client";

import { cn } from "@/lib/utils/cn";
import { 
  ArrowDown, 
  Inbox, 
  ListFilter, 
  Droplets, 
  Wind, 
  Sun, 
  Shirt, 
  SearchCheck, 
  Package, 
  CheckCircle,
  Truck,
  Factory
} from "lucide-react";
import { useRouter } from "next/navigation";

type PipelineData = Record<string, number>;

const STAGES = [
  { id: "RECEIVING", name: "Receiving", icon: Inbox, color: "text-slate-500", bg: "bg-slate-100", time: "15 min", route: "/operations/processing-center?stage=receiving" },
  { id: "SORTING", name: "Sorting", icon: ListFilter, color: "text-indigo-500", bg: "bg-indigo-100", time: "30 min", route: "/operations/processing-center?stage=sorting" },
  { id: "WASHING", name: "Washing", icon: Droplets, color: "text-blue-500", bg: "bg-blue-100", time: "1 hr 12 min", route: "/operations/washing" },
  { id: "DRY_CLEANING", name: "Dry Cleaning", icon: Wind, color: "text-cyan-500", bg: "bg-cyan-100", time: "2 hr 45 min", route: "/operations/processing-center?stage=dry-cleaning" },
  { id: "DRYING", name: "Drying", icon: Sun, color: "text-amber-500", bg: "bg-amber-100", time: "45 min", route: "/operations/drying" },
  { id: "IRONING", name: "Ironing", icon: Shirt, color: "text-purple-500", bg: "bg-purple-100", time: "1 hr 30 min", route: "/operations/ironing" },
  { id: "QUALITY_CHECK", name: "Quality Check", icon: SearchCheck, color: "text-rose-500", bg: "bg-rose-100", time: "20 min", route: "/operations/qc" },
  { id: "PACKING", name: "Packing", icon: Package, color: "text-emerald-500", bg: "bg-emerald-100", time: "25 min", route: "/operations/packing" },
  { id: "READY_FOR_DELIVERY", name: "Ready For Delivery", icon: Truck, color: "text-teal-500", bg: "bg-teal-100", time: "Waiting", route: "/operations/ready-delivery" },
  { id: "DELIVERED", name: "Delivered", icon: CheckCircle, color: "text-slate-700", bg: "bg-slate-200", time: "Done", route: "/operations/delivered-orders" },
];

export function ProcessingPipeline({ data }: { data: PipelineData | null }) {
  const router = useRouter();
  const totalProcessing = data ? Object.entries(data).reduce((acc, [k, v]) => k !== 'DELIVERED' ? acc + v : acc, 0) : 0;

  if (!data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 p-8 shadow-sm text-center">
        <div className="rounded-full bg-slate-100 p-4 mb-4">
          <Factory className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No garments currently in processing</h3>
        <p className="text-sm text-slate-500">Wait for pickups to arrive at the facility.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
      <div className="flex-1 p-6 border-r border-slate-100">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Laundry Processing Pipeline</h2>
          <p className="text-sm text-slate-500">Live order flow through the facility</p>
        </div>

        <div className="space-y-2 relative">
          <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-slate-100 z-0 hidden sm:block"></div>
          
          <div className="flex items-center gap-4 relative z-10 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 shadow-sm shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Today's Pickup</p>
              <p className="text-xs text-slate-400">Arriving from hubs</p>
            </div>
          </div>
          
          <div className="pl-6 py-1 text-slate-300 hidden sm:block"><ArrowDown className="h-4 w-4" /></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {STAGES.map((stage, idx) => {
              const count = data[stage.id] || 0;
              const percentage = totalProcessing > 0 ? Math.round((count / totalProcessing) * 100) : 0;
              
              return (
                <div 
                  key={stage.id}
                  onClick={() => router.push(stage.route)}
                  className="group flex flex-col rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:shadow-md hover:bg-slate-50 transition-all cursor-pointer relative overflow-hidden bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg transition-colors", stage.bg, stage.color)}>
                        <stage.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{stage.name}</h4>
                        <p className="text-xs text-slate-500">{stage.time}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-slate-900">{count}</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Orders</span>
                    </div>
                  </div>
                  
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-auto">
                    <div 
                      className={cn("h-full transition-all duration-1000 ease-out", stage.id === 'DELIVERED' ? 'bg-slate-400' : 'bg-teal-500')} 
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-50 p-6 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Live Queue Status</h3>
        
        <div className="space-y-6 flex-1">
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm text-center">
            <p className="text-sm font-medium text-slate-500 mb-1">Current Pipeline Count</p>
            <p className="text-4xl font-bold text-teal-600">{totalProcessing}</p>
            <p className="text-xs text-slate-400 mt-2">Active orders in facility</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Orders Waiting</span>
              <span className="text-sm font-semibold text-slate-900">{data['RECEIVING'] || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Delayed Orders</span>
              <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Avg. Processing Time</span>
              <span className="text-sm font-semibold text-slate-900">8h 45m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">SLA Health</span>
              <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">98.5%</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => router.push('/operations/processing-center')}
          className="mt-6 w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
        >
          Open Processing Center
        </button>
      </div>
    </div>
  );
}

