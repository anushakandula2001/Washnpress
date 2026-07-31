"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertCircle, AlertTriangle, Clock, Info, ExternalLink, Headset } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type ActivityItem = {
  id: string;
  action: string;
  timestamp: string | Date;
};

// Mocking Notifications for now as per requirements
const NOTIFICATIONS = [
  { id: "1", type: "high", title: "QC Failed", desc: "Order #ORD-991 failed quality check", time: new Date(Date.now() - 1000 * 60 * 5) },
  { id: "2", type: "warning", title: "Delayed Pickup", desc: "Driver stuck in traffic for Society A", time: new Date(Date.now() - 1000 * 60 * 25) },
  { id: "3", type: "info", title: "Resident Complaint", desc: "Missing item reported in ORD-812", time: new Date(Date.now() - 1000 * 60 * 120) },
  { id: "4", type: "warning", title: "Delivery Delayed", desc: "2 orders missed SLA window", time: new Date(Date.now() - 1000 * 60 * 240) },
];

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const router = useRouter();

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case "high": return <AlertCircle className="h-4 w-4 text-rose-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch(type) {
      case "high": return "bg-rose-100";
      case "warning": return "bg-amber-100";
      default: return "bg-blue-100";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Notifications Panel */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Alerts & Notifications</h3>
            <p className="text-xs text-slate-500">Requires attention</p>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
            {NOTIFICATIONS.length}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="space-y-1">
            {NOTIFICATIONS.map((notif) => (
              <div 
                key={notif.id}
                className="group flex gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => router.push('/operations/support-center')}
              >
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5", getNotificationBg(notif.type))}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDistanceToNow(notif.time, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 pr-4">{notif.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => router.push('/operations/support-center')}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Open Support Center <Headset className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
          <p className="text-xs text-slate-500">Live operational updates</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">
          {activities.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <Clock className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:w-0.5 before:-translate-x-px before:bg-slate-200">
              {activities.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="absolute left-0 h-5 w-5 rounded-full border-4 border-white bg-teal-500 ring-1 ring-slate-200"></div>
                  <div className="pl-8 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            Order {item.id.slice(0, 8)} moved to <span className="font-bold text-teal-700">{item.action.replace(/_/g, ' ')}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">System automated</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
