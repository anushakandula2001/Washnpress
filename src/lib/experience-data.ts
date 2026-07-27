import type { Order, OrderStatus } from "@/lib/types";
import { orders } from "@/lib/mock-data";

export const orderLifecycle: Array<{ status: OrderStatus; label: string; count: number; delta: number }> = [
  { status: "Scheduled", label: "Scheduled", count: 14, delta: 12 },
  { status: "Picked Up", label: "Picked Up", count: 11, delta: 8 },
  { status: "In Wash", label: "Washing", count: 9, delta: 18 },
  { status: "Dry", label: "Drying", count: 7, delta: 4 },
  { status: "Iron", label: "Ironing", count: 6, delta: 5 },
  { status: "QC Hold", label: "QC", count: 2, delta: -3 },
  { status: "Out for Delivery", label: "Out For Delivery", count: 8, delta: 9 },
  { status: "Delivered", label: "Delivered", count: 26, delta: 14 },
];

export const sustainabilityImpact = {
  todayLitersSaved: 1284,
  monthLitersSaved: 28940,
  networkLitersSaved: 312000,
  treesEquivalent: 412,
  carbonReductionKg: 1840,
};

export const womenLedImpact = {
  activeUnits: 52,
  operatorsTrained: 118,
  communitiesServed: 74,
  operatorSatisfaction: 4.6,
  revenueSharedInr: 1250000,
};

export const societyCoverage = [
  { name: "Green Heights", x: 18, y: 38, radius: 18, status: "Active" },
  { name: "Lotus Enclave", x: 44, y: 54, radius: 22, status: "Active" },
  { name: "Skyline Residency", x: 68, y: 35, radius: 20, status: "High Demand" },
  { name: "Palm Meadows", x: 80, y: 68, radius: 16, status: "Expansion" },
];

export const expansionOpportunities = [
  { society: "Aster Towers", households: 620, confidence: "High", potentialMrrInr: 820000 },
  { society: "Riverfront Habitat", households: 410, confidence: "Medium", potentialMrrInr: 510000 },
  { society: "Nova County", households: 350, confidence: "Medium", potentialMrrInr: 430000 },
];

export const residentFamilyUsage = [
  { member: "Parents", garments: 26, cap: 60 },
  { member: "Kids", garments: 20, cap: 60 },
  { member: "Guests", garments: 9, cap: 60 },
];

export const billingHistory = [
  { cycle: "Jun 2026", amountInr: 2199, status: "Paid" },
  { cycle: "May 2026", amountInr: 2199, status: "Paid" },
  { cycle: "Apr 2026", amountInr: 2199, status: "Paid" },
];

export const supportTickets = [
  { id: "SUP-201", issue: "Stain not removed", status: "Resolved", slaHours: 14 },
  { id: "SUP-225", issue: "Pickup delay", status: "In Progress", slaHours: 6 },
];

export const operatorQueues = {
  scheduled: ["WNP-10211", "WNP-10214", "WNP-10215"],
  pickedUp: ["WNP-10201", "WNP-10202", "WNP-10203"],
  processing: ["WNP-10021", "WNP-10207", "WNP-10208"],
  qc: ["WNP-10022", "WNP-10209"],
  delivery: ["WNP-10023", "WNP-10210"],
};

export const operatorPerformanceByHour = [
  { hour: "08:00", value: 6 },
  { hour: "10:00", value: 11 },
  { hour: "12:00", value: 13 },
  { hour: "14:00", value: 9 },
  { hour: "16:00", value: 15 },
  { hour: "18:00", value: 8 },
];

export const activityFeed = [
  { time: "2 min", text: "Pickup completed at Green Heights B-805", type: "success" },
  { time: "8 min", text: "QC hold raised for WNP-10022", type: "warning" },
  { time: "15 min", text: "New society demo request from Aster Towers", type: "info" },
  { time: "21 min", text: "Operator payout batch processed", type: "success" },
];

export const notificationCenter = [
  { title: "Route Updated", body: "Delivery route 4 reordered for traffic", unread: true },
  { title: "Low Detergent", body: "Unit GH-02 requires replenishment", unread: true },
  { title: "Monthly ESG report", body: "Sustainability report is ready to export", unread: false },
];

export function countByStatus(orderList: Order[]) {
  const base: Record<OrderStatus, number> = {
    Scheduled: 0,
    "Picked Up": 0,
    "In Wash": 0,
    Dry: 0,
    Iron: 0,
    "QC Hold": 0,
    "Out for Delivery": 0,
    Delivered: 0,
    Cancelled: 0,
  };

  for (const order of orderList) {
    base[order.status] += 1;
  }

  return base;
}

export const liveOrderStatusCounts = countByStatus(orders);
