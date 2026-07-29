"use client";

import {
  Megaphone,
  Bell,
  Sparkles,
  Wrench,
  AlertTriangle,
  Clock,
  Users,
  Copy,
  Trash2,
  Calendar,
  MoreVertical,
  CheckCircle2,
  FileText,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { NotificationItem } from "./types";

type Props = {
  notification: NotificationItem;
  onView: (notification: NotificationItem) => void;
  onDuplicate: (notification: NotificationItem) => void;
  onDelete: (id: string) => void;
};

export function getCategoryStyle(category: string) {
  switch (category.toLowerCase()) {
    case "promotion":
    case "offer":
      return {
        icon: Sparkles,
        bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
        label: "Promotion",
      };
    case "maintenance":
      return {
        icon: Wrench,
        bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
        label: "Maintenance",
      };
    case "alert":
    case "emergency":
      return {
        icon: AlertTriangle,
        bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
        label: "Alert",
      };
    case "reminder":
      return {
        icon: Bell,
        bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
        label: "Reminder",
      };
    default:
      return {
        icon: Megaphone,
        bg: "bg-[#0EA5A8]/10 text-[#0EA5A8]",
        badge: "bg-[#0EA5A8]/10 text-[#0EA5A8] border-[#0EA5A8]/20",
        label: category.charAt(0).toUpperCase() + category.slice(1),
      };
  }
}

export function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "sent":
    case "delivered":
      return {
        label: "Sent",
        icon: CheckCircle2,
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
      };
    case "scheduled":
      return {
        label: "Scheduled",
        icon: Clock,
        badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
      };
    case "draft":
      return {
        label: "Draft",
        icon: FileText,
        badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      };
    case "failed":
      return {
        label: "Failed",
        icon: AlertCircle,
        badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
      };
    default:
      return {
        label: status,
        icon: CheckCircle2,
        badge: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

export function BroadcastCard({
  notification,
  onView,
  onDuplicate,
  onDelete,
}: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const catStyle = getCategoryStyle(notification.category);
  const statusStyle = getStatusStyle(notification.status);
  const CategoryIcon = catStyle.icon;
  const StatusIcon = statusStyle.icon;

  const formattedAudience =
    notification.audience === "all_residents"
      ? "All Residents"
      : notification.audience === "society"
      ? `Society${notification.society_name ? `: ${notification.society_name}` : ""}`
      : notification.audience === "operator" || notification.audience === "all_operators"
      ? "Operators"
      : `Individual${notification.resident_name ? `: ${notification.resident_name}` : ""}`;

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0EA5A8]/40 hover:shadow-md sm:flex-row sm:items-start sm:justify-between">
      {/* Left side: Icon + Content */}
      <div className="flex gap-4 min-w-0 flex-1">
        {/* Large Category Icon */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${catStyle.bg} transition-transform duration-200 group-hover:scale-105`}>
          <CategoryIcon className="h-6 w-6" />
        </div>

        {/* Info */}
        <div className="space-y-1.5 min-w-0 flex-1">
          {/* Header row: Title + Category Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-foreground text-base leading-snug truncate">
              {notification.title}
            </h3>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${catStyle.badge}`}>
              {catStyle.label}
            </span>
          </div>

          {/* Message Preview (max 2 lines) */}
          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {notification.body}
          </p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">
              Audience: <span className="font-normal text-muted-foreground">{formattedAudience}</span>
            </span>

            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {new Date(notification.created_at).toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {notification.recipients_count && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {notification.recipients_count} Recipients
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Status Badge + Action Buttons */}
      <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3 sm:border-t-0 sm:pt-0 sm:flex-col sm:items-end">
        {/* Status Badge */}
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusStyle.badge}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusStyle.label}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onView(notification)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground hover:bg-muted hover:text-[#0EA5A8] transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View</span>
          </button>

          <button
            type="button"
            onClick={() => onDuplicate(notification)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            title="Duplicate broadcast"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Duplicate</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="More actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 z-20 mt-1 w-36 rounded-xl border border-border bg-card p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    onDuplicate(notification);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Duplicate</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDelete(notification.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
