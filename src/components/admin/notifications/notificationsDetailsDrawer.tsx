"use client";

import {
  X,
  Calendar,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Copy,
  TrendingUp,
} from "lucide-react";
import { NotificationItem } from "./types";
import { getCategoryStyle, getStatusStyle } from "./BroadcastCard";

type Props = {
  open: boolean;
  notification: NotificationItem | null;
  onOpenChange: (open: boolean) => void;
  onDuplicate?: (notification: NotificationItem) => void;
};

export function NotificationDetailsDrawer({
  open,
  notification,
  onOpenChange,
  onDuplicate,
}: Props) {
  if (!open || !notification) return null;

  const catStyle = getCategoryStyle(notification.category);
  const statusStyle = getStatusStyle(notification.status);
  const CategoryIcon = catStyle.icon;
  const StatusIcon = statusStyle.icon;

  // Calculate default or custom delivery statistics
  const totalRecipients = typeof notification.recipients_count === "number"
    ? notification.recipients_count
    : notification.audience === "all_residents"
    ? 240
    : notification.audience === "society"
    ? 85
    : notification.audience === "operator"
    ? 18
    : 1;

  const stats = notification.stats ?? {
    delivered: notification.status === "sent" || notification.status === "delivered" ? Math.floor(totalRecipients * 0.94) : 0,
    failed: notification.status === "failed" ? 3 : 0,
    pending: notification.status === "scheduled" ? totalRecipients : 0,
    readPercentage: notification.status === "sent" || notification.status === "delivered" ? 82 : 0,
  };

  const timeline = notification.timeline ?? [
    {
      label: "Broadcast Created",
      timestamp: new Date(notification.created_at).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      author: notification.creator_name ?? "Platform Admin",
      status: "completed" as const,
    },
    {
      label: notification.scheduled_at ? "Scheduled Delivery" : "Immediate Dispatch",
      timestamp: notification.scheduled_at
        ? new Date(notification.scheduled_at).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Processed instantly",
      status: notification.status === "scheduled" ? ("active" as const) : ("completed" as const),
    },
    {
      label: "Delivered to Audience",
      timestamp: notification.status === "sent" || notification.status === "delivered"
        ? new Date(notification.created_at).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Pending completion",
      status: notification.status === "sent" || notification.status === "delivered"
        ? ("completed" as const)
        : notification.status === "failed"
        ? ("failed" as const)
        : ("pending" as const),
    },
  ];

  const formattedAudience =
    notification.audience === "all_residents"
      ? "All Residents"
      : notification.audience === "society"
      ? `Society${notification.society_name ? `: ${notification.society_name}` : ""}`
      : notification.audience === "operator" || notification.audience === "all_operators"
      ? "Operators"
      : `Individual${notification.resident_name ? `: ${notification.resident_name}` : ""}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer Panel: 520px Width */}
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-card shadow-2xl transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${catStyle.bg}`}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground line-clamp-1">
                Notification Details
              </h2>
              <p className="text-xs text-muted-foreground">ID: {notification.id.slice(0, 8)}...</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Header Card: Title, Badges & Meta */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${catStyle.badge}`}>
                {catStyle.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium ${statusStyle.badge}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusStyle.label}
              </span>
            </div>

            <h1 className="text-lg font-extrabold text-foreground leading-snug">
              {notification.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-muted-foreground pt-1 border-t border-border/40">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Created by {notification.creator_name ?? "Platform Admin"}
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
            </div>
          </div>

          {/* Full Message Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Broadcast Message Content
            </label>
            <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {notification.body}
            </div>
          </div>

          {/* Audience & Scope Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase">Target Audience</p>
              <p className="text-xs font-bold text-foreground truncate">{formattedAudience}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase">Recipients Scope</p>
              <p className="text-xs font-bold text-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-[#0EA5A8]" />
                {totalRecipients} Audience Members
              </p>
            </div>
          </div>

          {/* Delivery Statistics Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center justify-between">
              <span>Delivery Statistics</span>
              <span className="text-[11px] font-normal text-[#0EA5A8] flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {stats.readPercentage}% Read Rate
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {stats.delivered}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">Delivered</p>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3 text-center">
                <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  {stats.failed}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">Failed</p>
              </div>

              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-3 text-center">
                <p className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
                  {stats.pending}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">Pending</p>
              </div>
            </div>

            {/* Read Rate Progress Bar */}
            <div className="rounded-2xl border border-border bg-card p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Read Engagement</span>
                <span className="text-foreground">{stats.readPercentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#0EA5A8] transition-all duration-500"
                  style={{ width: `${stats.readPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Visual Lifecycle Timeline */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Broadcast Lifecycle Timeline
            </label>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
              {timeline.map((step, idx) => (
                <div key={`${step.label}-${idx}`} className="relative flex gap-3">
                  {/* Vertical Line */}
                  {idx < timeline.length - 1 && (
                    <div className="absolute left-3.5 top-7 h-full w-0.5 bg-border" />
                  )}

                  {/* Circle Icon */}
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : step.status === "active"
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        : step.status === "failed"
                        ? "bg-rose-500/10 text-rose-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : step.status === "active" ? (
                      <Clock className="h-4 w-4" />
                    ) : step.status === "failed" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    )}
                  </div>

                  {/* Step Text */}
                  <div className="space-y-0.5 pt-0.5">
                    <p className="text-xs font-bold text-foreground">{step.label}</p>
                    <p className="text-[11px] text-muted-foreground">{step.timestamp}</p>
                    {step.author && (
                      <p className="text-[10px] text-muted-foreground">Author: {step.author}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between border-t border-border bg-card p-4">
          {onDuplicate && (
            <button
              type="button"
              onClick={() => {
                onDuplicate(notification);
                onOpenChange(false);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Copy className="h-3.5 w-3.5 text-[#0EA5A8]" />
              <span>Duplicate Broadcast</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-[#0EA5A8] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#0EA5A8]/90 transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}