export type NotificationCategory =
  | "general"
  | "system"
  | "reminder"
  | "promotion"
  | "maintenance"
  | "alert"
  | "emergency"
  | "orders"
  | "pickup"
  | "delivery"
  | "subscription"
  | "payments";

export type NotificationPriority =
  | "low"
  | "normal"
  | "medium"
  | "high"
  | "urgent"
  | "critical";

export type NotificationAudience =
  | "all_residents"
  | "society"
  | "resident"
  | "all_operators"
  | "operator";

export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "sent"
  | "delivered"
  | "failed"
  | "read";

export interface Society {
  id: string;
  name: string;
}

export interface DeliveryStats {
  delivered: number;
  failed: number;
  pending: number;
  readPercentage: number;
}

export interface TimelineStep {
  label: string;
  timestamp: string;
  author?: string;
  status: "completed" | "active" | "pending" | "failed";
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  audience: NotificationAudience;
  status: NotificationStatus;
  society_name?: string | null;
  societyId?: string | null;
  resident_name?: string | null;
  residentId?: string | null;
  operator_name?: string | null;
  operatorUserId?: string | null;
  creator_name?: string | null;
  created_at: string;
  scheduled_at?: string | null;
  recipients_count?: number | string;
  delivered?: number;
  read?: number;
  stats?: DeliveryStats;
  timeline?: TimelineStep[];
  attachments?: string[];
}