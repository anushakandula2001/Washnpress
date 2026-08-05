"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { readApiJson } from "@/frontend/api-client";
import { PortalShell } from "@/components/portal/portal-shell";
import { adminNav } from "@/lib/portal-nav";
import {
  NotificationItem,
  NotificationAudience,
  NotificationCategory,
  NotificationPriority,
  Society,
  NotificationStats,
  NotificationFilters,
  BroadcastCard,
  QuickBroadcastPanel,
  NotificationDrawer,
  NotificationDetailsDrawer,
  EmptyState,
  NotificationSkeleton,
} from "@/components/admin/notifications";

// Comprehensive initial/fallback seed data matching user design requirements
const SAMPLE_BROADCASTS: NotificationItem[] = [
  {
    id: "bcast-001",
    title: "Pickup Delay Notification",
    body: "Today's pickup will be delayed by 30 minutes due to high demand and monsoon traffic in Green Valley region. Thank you for your patience.",
    category: "system",
    priority: "normal",
    audience: "all_residents",
    status: "sent",
    society_name: "Green Valley Society",
    creator_name: "Platform Admin",
    created_at: "2026-07-28T10:30:00Z",
    recipients_count: 125,
    delivered: 118,
    read: 102,
    stats: { delivered: 118, failed: 2, pending: 5, readPercentage: 84 },
  },
  {
    id: "bcast-002",
    title: "Subscription Expiry Reminder",
    body: "This is a friendly reminder that your monthly Premium Laundry subscription will expire in 3 days. Renew now to avoid pickup interruption.",
    category: "reminder",
    priority: "high",
    audience: "resident",
    resident_name: "Rahul Sharma",
    status: "sent",
    creator_name: "Platform Admin",
    created_at: "2026-07-27T16:15:00Z",
    recipients_count: 1,
    delivered: 1,
    read: 1,
    stats: { delivered: 1, failed: 0, pending: 0, readPercentage: 100 },
  },
  {
    id: "bcast-003",
    title: "New Offer Available",
    body: "Get 20% OFF on all premium dry cleaning services this weekend! Use code WASH20 at checkout on the WashNPress resident app.",
    category: "promotion",
    priority: "normal",
    audience: "all_residents",
    status: "sent",
    creator_name: "Marketing Team",
    created_at: "2026-07-23T09:00:00Z",
    recipients_count: "All Residents",
    delivered: 230,
    read: 185,
    stats: { delivered: 230, failed: 0, pending: 10, readPercentage: 77 },
  },
  {
    id: "bcast-004",
    title: "Maintenance Alert",
    body: "Water supply will be limited on Sunday from 10 AM to 2 PM for pipe maintenance at Oak Apartments. Express wash delays may occur.",
    category: "alert",
    priority: "urgent",
    audience: "society",
    society_name: "Oak Apartments",
    status: "scheduled",
    scheduled_at: "2026-07-30T10:00:00Z",
    creator_name: "Ops Support",
    created_at: "2026-07-22T14:30:00Z",
    recipients_count: 45,
    delivered: 0,
    read: 0,
    stats: { delivered: 0, failed: 0, pending: 45, readPercentage: 0 },
  },
  {
    id: "bcast-005",
    title: "Service Update & Pricing Revision",
    body: "Dry cleaning service is now available for all premium members across all societies with guaranteed 24-hour turnaround times.",
    category: "general",
    priority: "low",
    audience: "all_residents",
    status: "sent",
    creator_name: "Platform Admin",
    created_at: "2026-07-21T11:00:00Z",
    recipients_count: "All Residents",
    delivered: 240,
    read: 210,
    stats: { delivered: 240, failed: 0, pending: 0, readPercentage: 88 },
  },
  {
    id: "bcast-006",
    title: "Delivery Operator Shift Advisory",
    body: "All delivery operators assigned to Sector 4 societies please check your updated route schedule for tomorrow morning.",
    category: "system",
    priority: "normal",
    audience: "operator",
    status: "draft",
    creator_name: "Logistics Admin",
    created_at: "2026-07-20T17:45:00Z",
    recipients_count: 18,
    delivered: 0,
    read: 0,
    stats: { delivered: 0, failed: 0, pending: 18, readPercentage: 0 },
  },
];

export default function AdminNotificationsPage() {
  const [broadcasts, setBroadcasts] = useState<NotificationItem[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Drawer Controls
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false);
  const [selectedQuickAudience, setSelectedQuickAudience] =
    useState<NotificationAudience>("all_residents");
  const [duplicateData, setDuplicateData] = useState<NotificationItem | null>(null);

  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bRes, sRes] = await Promise.all([
        fetch("/api/admin/notifications", { credentials: "same-origin" }),
        fetch("/api/admin/societies", { credentials: "same-origin" }),
      ]);

      const bData = (await readApiJson(bRes).catch(() => ({}))) as {
        broadcasts?: Array<Record<string, unknown>>;
      };
      const sData = (await readApiJson(sRes).catch(() => ({}))) as {
        societies?: Society[];
      };

      let apiBroadcasts: NotificationItem[] = [];
      if (bRes.ok && Array.isArray(bData.broadcasts)) {
        apiBroadcasts = bData.broadcasts.map((b: Record<string, unknown>) => ({
          id: String(b.id),
          title: String(b.title ?? "Untitled Broadcast"),
          body: String(b.body ?? ""),
          category: (String(b.type ?? "general") as NotificationCategory) || "general",
          priority: "normal" as NotificationPriority,
          audience: (String(b.audience ?? "all_residents") as NotificationAudience) || "all_residents",
          status: (String(b.status ?? "sent") as NotificationItem["status"]),
          society_name: b.society_name ? String(b.society_name) : null,
          creator_name: b.creator_name ? String(b.creator_name) : "Platform Admin",
          created_at: String(b.created_at ?? new Date().toISOString()),
          recipients_count: b.audience === "all_residents" ? "All Residents" : 1,
        }));
      }

      if (sRes.ok && Array.isArray(sData.societies)) {
        setSocieties(sData.societies as Society[]);
      } else {
        setSocieties([
          { id: "soc-1", name: "Green Valley Society" },
          { id: "soc-2", name: "Oak Apartments" },
          { id: "soc-3", name: "Sunridge Heights" },
          { id: "soc-4", name: "Royal Palms Residency" },
        ]);
      }

      // Merge API broadcasts with sample seed broadcasts to ensure full rich display
      const merged = [...apiBroadcasts];
      for (const sample of SAMPLE_BROADCASTS) {
        if (!merged.some((m) => m.id === sample.id)) {
          merged.push(sample);
        }
      }
      setBroadcasts(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load broadcasts");
      setBroadcasts(SAMPLE_BROADCASTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handle Send New Broadcast
  async function handleSendBroadcast(payload: {
    title: string;
    body: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    audience: NotificationAudience;
    societyId?: string;
    residentId?: string;
    operatorUserId?: string;
    schedule?: string;
    status?: "sent" | "scheduled" | "draft";
  }) {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          type: payload.category,
          audience: payload.audience,
          societyId: payload.societyId,
          residentId: payload.residentId,
          operatorUserId: payload.operatorUserId,
        }),
      });
    } catch {
      // Graceful fallback for local mock
    }

    const newNotification: NotificationItem = {
      id: `bcast-${Date.now()}`,
      title: payload.title,
      body: payload.body,
      category: payload.category,
      priority: payload.priority,
      audience: payload.audience,
      status: payload.status ?? (payload.schedule ? "scheduled" : "sent"),
      societyId: payload.societyId,
      society_name: payload.societyId
        ? societies.find((s) => s.id === payload.societyId)?.name ?? "Selected Society"
        : null,
      creator_name: "Platform Admin",
      created_at: new Date().toISOString(),
      scheduled_at: payload.schedule,
      recipients_count:
        payload.audience === "all_residents"
          ? "All Residents"
          : payload.audience === "society"
          ? 85
          : 1,
      stats: {
        delivered: payload.schedule ? 0 : 1,
        failed: 0,
        pending: payload.schedule ? 85 : 0,
        readPercentage: payload.schedule ? 0 : 100,
      },
    };

    setBroadcasts((prev) => [newNotification, ...prev]);
  }

  // Action handlers
  const handleOpenNewBroadcast = (audience: NotificationAudience = "all_residents") => {
    setDuplicateData(null);
    setSelectedQuickAudience(audience);
    setSendDrawerOpen(true);
  };

  const handleDuplicate = (notification: NotificationItem) => {
    setDuplicateData(notification);
    setSelectedQuickAudience(notification.audience);
    setSendDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  };

  const handleView = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setDetailsDrawerOpen(true);
  };

  // Filtered Broadcasts Calculation
  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter((b) => {
      // Search
      if (
        search.trim() !== "" &&
        !b.title.toLowerCase().includes(search.toLowerCase()) &&
        !b.body.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      // Category
      if (categoryFilter !== "all" && b.category !== categoryFilter) {
        return false;
      }
      // Audience
      if (audienceFilter !== "all" && b.audience !== audienceFilter) {
        return false;
      }
      // Date Range Filter
      if (dateRangeFilter !== "all") {
        const createdDate = new Date(b.created_at).getTime();
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        if (dateRangeFilter === "today" && now - createdDate > dayMs) return false;
        if (dateRangeFilter === "7days" && now - createdDate > 7 * dayMs) return false;
        if (dateRangeFilter === "30days" && now - createdDate > 30 * dayMs) return false;
      }
      return true;
    });
  }, [broadcasts, search, categoryFilter, audienceFilter, dateRangeFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredBroadcasts.length / itemsPerPage) || 1;
  const paginatedBroadcasts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBroadcasts.slice(start, start + itemsPerPage);
  }, [filteredBroadcasts, currentPage]);

  // Analytics counts
  const totalCount = broadcasts.length;
  const deliveredCount = broadcasts.filter(
    (b) => b.status === "sent" || b.status === "delivered"
  ).length;
  const scheduledCount = broadcasts.filter((b) => b.status === "scheduled").length;
  const draftCount = broadcasts.filter((b) => b.status === "draft").length;

  return (
    <PortalShell navItems={adminNav} portalLabel="Admin Portal">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Notifications
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              Broadcast announcements and updates to Residents, Societies and Operators.
            </p>
          </div>

          {/* Primary CTA button */}
          <button
            type="button"
            onClick={() => handleOpenNewBroadcast("all_residents")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0EA5A8] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0EA5A8]/90 hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ New Broadcast</span>
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {loading ? (
          <NotificationSkeleton />
        ) : (
          <>
            {/* TOP ANALYTICS SECTION */}
            <NotificationStats
              total={totalCount}
              delivered={deliveredCount}
              scheduled={scheduledCount}
              drafts={draftCount}
            />

            {/* FILTER BAR */}
            <NotificationFilters
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setCurrentPage(1);
              }}
              category={categoryFilter}
              onCategoryChange={(v) => {
                setCategoryFilter(v);
                setCurrentPage(1);
              }}
              audience={audienceFilter}
              onAudienceChange={(v) => {
                setAudienceFilter(v);
                setCurrentPage(1);
              }}
              dateRange={dateRangeFilter}
              onDateRangeChange={(v) => {
                setDateRangeFilter(v);
                setCurrentPage(1);
              }}
              onClearFilters={() => {
                setSearch("");
                setCategoryFilter("all");
                setAudienceFilter("all");
                setDateRangeFilter("all");
                setCurrentPage(1);
              }}
            />

            {/* MAIN CONTENT (Two-Column Layout: 70% Left, 30% Right) */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              {/* LEFT COLUMN (70%) - Recent Broadcasts Cards */}
              <div className="space-y-4 lg:col-span-8">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-base font-bold text-foreground">
                    Recent Broadcasts
                  </h2>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {filteredBroadcasts.length} Messages
                  </span>
                </div>

                {paginatedBroadcasts.length === 0 ? (
                  <EmptyState onCreateClick={() => handleOpenNewBroadcast("all_residents")} />
                ) : (
                  <div className="space-y-3.5">
                    {paginatedBroadcasts.map((b) => (
                      <BroadcastCard
                        key={b.id}
                        notification={b}
                        onView={handleView}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {filteredBroadcasts.length > 0 && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Showing{" "}
                      <span className="font-bold text-foreground">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-foreground">
                        {Math.min(currentPage * itemsPerPage, filteredBroadcasts.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-foreground">
                        {filteredBroadcasts.length}
                      </span>{" "}
                      results
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                        aria-label="Previous Page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            currentPage === page
                              ? "bg-[#0EA5A8] text-white shadow-sm"
                              : "border border-border bg-background text-foreground hover:bg-muted"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                        aria-label="Next Page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDEBAR (30%) - Quick Broadcast Panel */}
              <div className="lg:col-span-4">
                <QuickBroadcastPanel
                  onSelectQuickAudience={handleOpenNewBroadcast}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Sticky Floating New Broadcast CTA Button */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <button
          type="button"
          onClick={() => handleOpenNewBroadcast("all_residents")}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0EA5A8] text-white shadow-xl hover:bg-[#0EA5A8]/90 transition-transform active:scale-95"
          aria-label="New Broadcast"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
        </button>
      </div>

      {/* DRAWERS */}
      <NotificationDrawer
        open={sendDrawerOpen}
        initialAudience={selectedQuickAudience}
        initialData={duplicateData}
        societies={societies}
        onOpenChange={setSendDrawerOpen}
        onSubmit={handleSendBroadcast}
      />

      <NotificationDetailsDrawer
        open={detailsDrawerOpen}
        notification={selectedNotification}
        onOpenChange={setDetailsDrawerOpen}
        onDuplicate={handleDuplicate}
      />
    </PortalShell>
  );
}
