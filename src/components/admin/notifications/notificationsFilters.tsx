"use client";

import { Search, Calendar, RotateCcw, ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  audience: string;
  onAudienceChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  onClearFilters: () => void;
};

export function NotificationFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  audience,
  onAudienceChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    audience !== "all" ||
    dateRange !== "all";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm lg:flex-row lg:items-center">
      {/* Large Search Box */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-[#0EA5A8] focus:outline-none focus:ring-1 focus:ring-[#0EA5A8] transition-colors"
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
        {/* Type / Category Dropdown */}
        <div className="relative w-full sm:w-44">
          <select
            className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-3.5 pr-8 text-sm font-medium text-foreground focus:border-[#0EA5A8] focus:outline-none focus:ring-1 focus:ring-[#0EA5A8] transition-colors"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="system">System</option>
            <option value="reminder">Reminder</option>
            <option value="promotion">Promotion</option>
            <option value="maintenance">Maintenance</option>
            <option value="alert">Alert</option>
            <option value="emergency">Emergency</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Audience Dropdown */}
        <div className="relative w-full sm:w-48">
          <select
            className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-3.5 pr-8 text-sm font-medium text-foreground focus:border-[#0EA5A8] focus:outline-none focus:ring-1 focus:ring-[#0EA5A8] transition-colors"
            value={audience}
            onChange={(e) => onAudienceChange(e.target.value)}
          >
            <option value="all">All Audience</option>
            <option value="all_residents">All Residents</option>
            <option value="society">Specific Society</option>
            <option value="operator">Operators</option>
            <option value="resident">Individual Resident</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Date Range Picker Dropdown */}
        <div className="relative w-full sm:w-48">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {dateRange === "all"
                  ? "Select date range"
                  : dateRange === "today"
                  ? "Today"
                  : dateRange === "7days"
                  ? "Last 7 Days"
                  : dateRange === "30days"
                  ? "Last 30 Days"
                  : "This Month"}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 z-30 mt-1 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg">
              {[
                { label: "All Time", value: "all" },
                { label: "Today", value: "today" },
                { label: "Last 7 Days", value: "7days" },
                { label: "Last 30 Days", value: "30days" },
                { label: "This Month", value: "this_month" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onDateRangeChange(opt.value);
                    setShowDatePicker(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    dateRange === opt.value
                      ? "bg-[#0EA5A8]/10 text-[#0EA5A8]"
                      : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}