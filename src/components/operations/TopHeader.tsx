"use client";

import { Bell, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export function TopHeader() {
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white/80 px-8 backdrop-blur-md border-b border-slate-200">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Operations Dashboard
        </h1>
        <p className="text-xs font-medium text-slate-500">Live Laundry Operations</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
          <input
            type="text"
            placeholder="Search orders, customers..."
            className="h-10 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
          />
        </div>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="hidden flex-col items-end sm:flex mr-2">
            <span className="text-sm font-semibold text-slate-900">{currentDate}</span>
          </div>

          <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          <div className="h-9 w-9 rounded-full bg-teal-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-500 hover:ring-offset-2 transition-all">
            <span className="text-sm font-bold text-teal-700">AD</span>
          </div>
        </div>
      </div>
    </header>
  );
}
