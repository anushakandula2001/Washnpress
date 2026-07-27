import type { OrderStatus } from "@/lib/types";

export type ResidentProfile = {
  name: string;
  flatNumber: string;
  tower: string;
  floor?: string | null;
  mobile: string;
  society: string;
  residentCode?: string | null;
  email?: string | null;
  gender?: string | null;
};

export type ResidentSubscription = {
  planName: string;
  garmentsUsed: number;
  garmentCap: number;
  daysRemaining: number;
  renewsOn: string;
  monthlyInr: number;
};

export type ResidentPickup = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  window: string;
  status: "scheduled" | "completed" | "cancelled";
};

export type OrderStage = "Pickup" | "Wash" | "Ironing" | "QC" | "Delivery";

export type ResidentOrder = {
  id: string;
  placedDate: string;
  pickupDate: string;
  pickupTime: string;
  garments: number;
  addons: string[];
  status: OrderStatus;
  displayStatus: string;
  badgeVariant: "default" | "secondary" | "success";
  stages: OrderStage[];
  currentStage: OrderStage;
};

export type TrackingEvent = {
  stage: string;
  label: string;
  timestamp: string | null;
  completed: boolean;
  active: boolean;
};

export type WalletTransaction = {
  id: string;
  type: "credit" | "debit";
  description: string;
  date: string;
  amountInr: number;
};

export type AddonService = {
  id: string;
  name: string;
  description: string;
  priceInr: number;
  icon: string;
};

export const residentProfile: ResidentProfile = {
  name: "Ananya",
  flatNumber: "B-805",
  tower: "Tower B",
  mobile: "9876543210",
  society: "Green Heights",
};

export const residentSubscription: ResidentSubscription = {
  planName: "Standard Plan",
  garmentsUsed: 25,
  garmentCap: 60,
  daysRemaining: 15,
  renewsOn: "2026-08-01",
  monthlyInr: 2199,
};

export const nextPickup: ResidentPickup = {
  id: "pickup-1",
  date: "2026-07-17",
  startTime: "10:00",
  endTime: "12:00",
  window: "Morning",
  status: "scheduled",
};

export const residentOrders: ResidentOrder[] = [
  {
    id: "WNP12345",
    placedDate: "2026-05-16",
    pickupDate: "2026-07-15",
    pickupTime: "10:00 AM – 12:00 PM",
    garments: 12,
    addons: ["Dry Cleaning"],
    status: "In Wash",
    displayStatus: "In Progress",
    badgeVariant: "default",
    stages: ["Pickup", "Wash", "Ironing", "QC", "Delivery"],
    currentStage: "Wash",
  },
  {
    id: "WNP12340",
    placedDate: "2026-07-10",
    pickupDate: "2026-07-12",
    pickupTime: "6:00 PM – 8:00 PM",
    garments: 8,
    addons: ["Shoe Cleaning"],
    status: "Out for Delivery",
    displayStatus: "Out for Delivery",
    badgeVariant: "secondary",
    stages: ["Pickup", "Wash", "Ironing", "QC", "Delivery"],
    currentStage: "Delivery",
  },
  {
    id: "WNP12335",
    placedDate: "2026-07-05",
    pickupDate: "2026-07-07",
    pickupTime: "9:00 AM – 11:00 AM",
    garments: 15,
    addons: [],
    status: "Delivered",
    displayStatus: "Delivered",
    badgeVariant: "success",
    stages: ["Pickup", "Wash", "Ironing", "QC", "Delivery"],
    currentStage: "Delivery",
  },
];

export const orderTrackingEvents: Record<string, TrackingEvent[]> = {
  WNP12345: [
    { stage: "Pickup", label: "Pickup Completed", timestamp: "16 May, 10:30 AM", completed: true, active: false },
    { stage: "Wash", label: "In Wash / Ironing", timestamp: "16 May, 2:00 PM", completed: false, active: true },
    { stage: "Ironing", label: "Ironing", timestamp: null, completed: false, active: false },
    { stage: "QC", label: "Quality Check", timestamp: null, completed: false, active: false },
    { stage: "Delivery", label: "Out for Delivery", timestamp: null, completed: false, active: false },
  ],
};

export const walletBalance = 250;

export const walletTransactions: WalletTransaction[] = [
  { id: "txn-1", type: "credit", description: "Added to Wallet", date: "14 Jul 2026", amountInr: 500 },
  { id: "txn-2", type: "debit", description: "Payment - Order #WNP12330", date: "10 Jul 2026", amountInr: 150 },
  { id: "txn-3", type: "credit", description: "Referral Bonus", date: "5 Jul 2026", amountInr: 100 },
  { id: "txn-4", type: "debit", description: "Add-on: Dry Cleaning", date: "1 Jul 2026", amountInr: 200 },
];

export const addonServices: AddonService[] = [
  { id: "addon-1", name: "Dry Cleaning", description: "Premium dry clean for suits & sarees", priceInr: 80, icon: "shirt" },
  { id: "addon-2", name: "Shoe Cleaning", description: "Deep clean for leather & canvas shoes", priceInr: 150, icon: "footprints" },
  { id: "addon-3", name: "Stain Treatment", description: "Targeted stain removal treatment", priceInr: 50, icon: "sparkles" },
  { id: "addon-4", name: "Express Delivery", description: "Same-day delivery within 12 hours", priceInr: 199, icon: "zap" },
  { id: "addon-5", name: "Fabric Softener", description: "Premium softener for all garments", priceInr: 30, icon: "droplets" },
];

export const residentImpact = {
  waterSavedLiters: 2450,
  co2ReducedKg: 12.5,
  garmentsProcessed: 156,
  treesEquivalent: 3.2,
};

export const residentNotifications = [
  { id: "n1", title: "Pickup Tomorrow", body: "Your pickup is scheduled for tomorrow 10:00 AM – 12:00 PM", unread: true },
  { id: "n2", title: "Order In Progress", body: "Order #WNP12345 is now in wash", unread: true },
  { id: "n3", title: "Wallet Credit", body: "₹100 referral bonus added to your wallet", unread: false },
];

export type Society = {
  id: string;
  name: string;
  address: string;
  city: string;
  residents: number;
  distanceKm: number;
  status: "Active" | "Coming Soon";
};

export const societies: Society[] = [
  {
    id: "soc-green-meadows",
    name: "Green Meadows Apartments",
    address: "12 Lotus Avenue, Sector 45",
    city: "Gurugram",
    residents: 842,
    distanceKm: 0.8,
    status: "Active",
  },
  {
    id: "soc-orchid-heights",
    name: "Orchid Heights",
    address: "88 Orchid Road, Whitefield",
    city: "Bengaluru",
    residents: 1204,
    distanceKm: 1.2,
    status: "Active",
  },
  {
    id: "soc-green-heights",
    name: "Green Heights",
    address: "5 Palm Street, Sector 62",
    city: "Gurugram",
    residents: 680,
    distanceKm: 1.5,
    status: "Active",
  },
  {
    id: "soc-lotus-enclave",
    name: "Lotus Enclave",
    address: "22 Lake View Road",
    city: "Noida",
    residents: 956,
    distanceKm: 2.1,
    status: "Active",
  },
];

export function formatPickupDisplay(pickup: ResidentPickup): string {
  if (!pickup.date || !pickup.startTime || !pickup.endTime) {
    return "No pickup scheduled";
  }

  const pickupDate = new Date(`${pickup.date}T${pickup.startTime}:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pickupDay = new Date(pickupDate);
  pickupDay.setHours(0, 0, 0, 0);

  let dayLabel: string;
  if (pickupDay.getTime() === tomorrow.getTime()) {
    dayLabel = "Tomorrow";
  } else if (pickupDay.getTime() === today.getTime()) {
    dayLabel = "Today";
  } else {
    dayLabel = pickupDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  return `${dayLabel}, ${formatTime(pickup.startTime)} – ${formatTime(pickup.endTime)}`;
}

export function getStageIndex(stage: OrderStage, stages: OrderStage[]): number {
  return stages.indexOf(stage);
}
