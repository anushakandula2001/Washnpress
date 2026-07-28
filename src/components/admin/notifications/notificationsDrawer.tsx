"use client";

import { useEffect, useState } from "react";
import {
  X,
  Paperclip,
  Send,
  Clock,
  UploadCloud,
  Megaphone,
  Check,
  Eye,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  NotificationAudience,
  NotificationCategory,
  NotificationItem,
  NotificationPriority,
  Society,
} from "./types";
import { getCategoryStyle } from "./BroadcastCard";

type Props = {
  open: boolean;
  initialAudience?: NotificationAudience;
  initialData?: NotificationItem | null;
  societies: Society[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
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
  }) => Promise<void>;
};

const CATEGORIES: { label: string; value: NotificationCategory }[] = [
  { label: "General", value: "general" },
  { label: "System", value: "system" },
  { label: "Reminder", value: "reminder" },
  { label: "Promotion", value: "promotion" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Alert", value: "alert" },
  { label: "Emergency", value: "emergency" },
];

const PRIORITIES: { label: string; value: NotificationPriority }[] = [
  { label: "Low", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const AUDIENCES: { label: string; value: NotificationAudience; desc: string }[] = [
  { label: "All Residents", value: "all_residents", desc: "Broadcast to all societies" },
  { label: "Specific Society", value: "society", desc: "Target a selected society" },
  { label: "Operators", value: "operator", desc: "All delivery personnel" },
  { label: "Individual Resident", value: "resident", desc: "Single user target" },
];

export function NotificationDrawer({
  open,
  initialAudience = "all_residents",
  initialData = null,
  societies,
  onOpenChange,
  onSubmit,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<NotificationCategory>("general");
  const [priority, setPriority] = useState<NotificationPriority>("normal");
  const [audience, setAudience] = useState<NotificationAudience>(initialAudience);
  const [societyId, setSocietyId] = useState("");
  const [residentId, setResidentId] = useState("");
  const [operatorUserId, setOperatorUserId] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setBody(initialData.body);
      setCategory(initialData.category ?? "general");
      setPriority(initialData.priority ?? "normal");
      setAudience(initialData.audience ?? "all_residents");
      setSocietyId(initialData.societyId ?? "");
      setResidentId(initialData.residentId ?? "");
      setOperatorUserId(initialData.operatorUserId ?? "");
    } else {
      setAudience(initialAudience);
    }
  }, [initialData, initialAudience, open]);

  if (!open) return null;

  async function handleSend(isDraft = false) {
    if (!title.trim() || !body.trim()) {
      setError("Please fill in both title and message body.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        title: title.trim(),
        body: body.trim(),
        category,
        priority,
        audience,
        societyId: societyId || undefined,
        residentId: residentId || undefined,
        operatorUserId: operatorUserId || undefined,
        schedule: scheduleMode === "later" ? scheduleDateTime : undefined,
        status: isDraft
          ? "draft"
          : scheduleMode === "later" && scheduleDateTime
          ? "scheduled"
          : "sent",
      });

      // Reset
      setTitle("");
      setBody("");
      setCategory("general");
      setPriority("normal");
      setAudience("all_residents");
      setSocietyId("");
      setResidentId("");
      setOperatorUserId("");
      setScheduleMode("now");
      setScheduleDateTime("");
      setAttachments([]);

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification.");
    } finally {
      setLoading(false);
    }
  }

  const catStyle = getCategoryStyle(category);
  const CategoryIcon = catStyle.icon;

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
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>{initialData ? "Duplicate Broadcast" : "New Broadcast"}</span>
              <span className="rounded-full bg-[#0EA5A8]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0EA5A8]">
                Enterprise
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Broadcast announcements and updates to Residents, Societies and Operators.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Notification Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled Water Maintenance Alert"
              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#0EA5A8] focus:outline-none focus:ring-1 focus:ring-[#0EA5A8] transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                    category === c.value
                      ? "border-[#0EA5A8] bg-[#0EA5A8]/10 text-[#0EA5A8]"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`rounded-xl border py-2 text-center text-xs font-semibold capitalize transition-all ${
                    priority === p.value
                      ? p.value === "urgent" || p.value === "critical"
                        ? "border-rose-500 bg-rose-500/10 text-rose-600"
                        : p.value === "high"
                        ? "border-orange-500 bg-orange-500/10 text-orange-600"
                        : "border-[#0EA5A8] bg-[#0EA5A8]/10 text-[#0EA5A8]"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audience Radio Cards */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Audience Target
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAudience(a.value)}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                    audience === a.value
                      ? "border-[#0EA5A8] bg-[#0EA5A8]/5 text-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{a.label}</span>
                    {audience === a.value && <Check className="h-3.5 w-3.5 text-[#0EA5A8]" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Scope Selectors */}
          {audience === "society" && (
            <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3">
              <label className="text-xs font-bold text-foreground">Select Target Society</label>
              <select
                value={societyId}
                onChange={(e) => setSocietyId(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-[#0EA5A8] focus:outline-none"
              >
                <option value="">Choose Society...</option>
                {societies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {audience === "resident" && (
            <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3">
              <label className="text-xs font-bold text-foreground">Resident ID or Code</label>
              <input
                type="text"
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
                placeholder="Enter Resident UUID or Code"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-[#0EA5A8] focus:outline-none"
              />
            </div>
          )}

          {audience === "operator" && (
            <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3">
              <label className="text-xs font-bold text-foreground">Operator User ID (Optional)</label>
              <input
                type="text"
                value={operatorUserId}
                onChange={(e) => setOperatorUserId(e.target.value)}
                placeholder="Leave blank for All Operators, or enter User ID"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-[#0EA5A8] focus:outline-none"
              />
            </div>
          )}

          {/* Message Text Area + Character Counter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                Message Body <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-muted-foreground">
                {body.length} / 500 characters
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your announcement or alert message clearly..."
              className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#0EA5A8] focus:outline-none focus:ring-1 focus:ring-[#0EA5A8] transition-colors"
            />
          </div>

          {/* Attachments (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Attachments (Optional)
            </label>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-4 text-center hover:bg-muted/30 transition-colors">
              <UploadCloud className="h-6 w-6 text-muted-foreground mb-1" />
              <p className="text-xs font-medium text-foreground">
                Click to attach image or announcement PDF
              </p>
              <p className="text-[10px] text-muted-foreground">PNG, JPG or PDF up to 5MB</p>
            </div>
          </div>

          {/* Schedule Options */}
          <div className="space-y-2 rounded-xl border border-border bg-card p-3.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Schedule Delivery
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScheduleMode("now")}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-semibold transition-all ${
                  scheduleMode === "now"
                    ? "border-[#0EA5A8] bg-[#0EA5A8]/10 text-[#0EA5A8]"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Now</span>
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode("later")}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-semibold transition-all ${
                  scheduleMode === "later"
                    ? "border-[#0EA5A8] bg-[#0EA5A8]/10 text-[#0EA5A8]"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Schedule Later</span>
              </button>
            </div>

            {scheduleMode === "later" && (
              <div className="pt-2">
                <input
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-[#0EA5A8] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Live Preview Card */}
          <div className="space-y-2 rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-[#0EA5A8]" />
                Live Recipient Preview
              </span>
              <span className="text-[10px] text-muted-foreground">Mobile & In-App View</span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${catStyle.bg}`}>
                    <CategoryIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {title || "Broadcast Title"}
                  </span>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${catStyle.badge}`}>
                  {catStyle.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {body || "Your broadcast message text will appear here..."}
              </p>
              <div className="text-[10px] text-muted-foreground pt-1 flex items-center justify-between border-t border-border/40">
                <span>WashNPress App</span>
                <span>Just now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sticky Footer */}
        <div className="flex items-center justify-between border-t border-border bg-card p-4">
          <button
            type="button"
            onClick={() => handleSend(true)}
            disabled={loading || !title.trim()}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSend(false)}
              disabled={loading || !title.trim() || !body.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-[#0EA5A8] px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0EA5A8]/90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? "Sending..." : scheduleMode === "later" ? "Schedule Broadcast" : "Send Notification"}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}