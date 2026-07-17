import { ReactNode } from "react";
import {
  Calendar,
  Droplets,
  Leaf,
  ShieldCheck,
  Shirt,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  garmentsPerMonth: number | "Unlimited";
  turnaround: string;
  pickup: string;
  ironing?: string;
  support: string;
  rollover: string;
  badge?: string;
  current?: boolean;
  features: string[];
}

export interface CurrentSubscription {
  planId: string;
  name: string;
  monthlyPrice: number;
  renewalDate: string;
  usedGarments: number;
  totalGarments: number;
  daysLeft: number;
}

export interface UsageStat {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface BillingHistory {
  id: string;
  month: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

/* -------------------------------------------------------------------------- */
/*                           Current Subscription                             */
/* -------------------------------------------------------------------------- */

export const currentSubscription: CurrentSubscription = {
  planId: "premium",
  name: "Premium Plan",
  monthlyPrice: 999,
  renewalDate: "28 July 2026",
  usedGarments: 31,
  totalGarments: 50,
  daysLeft: 14,
};

/* -------------------------------------------------------------------------- */
/*                                Plans                                       */
/* -------------------------------------------------------------------------- */

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "premium",
    name: "Premium",
    price: 999,
    garmentsPerMonth: 50,
    turnaround: "24h",
    pickup: "Free",
    support: "Priority",
    rollover: "10 Garments",
    current: true,
    badge: "Current Plan",
    features: [
      "50 Garments / month",
      "24h Turnaround",
      "Free Pickup & Delivery",
      "Priority Support",
      "Rollover up to 10 garments",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 1499,
    garmentsPerMonth: 100,
    turnaround: "24h",
    pickup: "Free",
    ironing: "10 pcs",
    support: "Priority",
    rollover: "25 Garments",
    features: [
      "100 Garments / month",
      "24h Turnaround",
      "Free Pickup & Delivery",
      "Priority Support",
      "Rollover up to 25 garments",
      "Free Ironing (10 pcs)",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 1999,
    garmentsPerMonth: "Unlimited",
    turnaround: "12h Express",
    pickup: "Free",
    ironing: "Unlimited",
    support: "Dedicated",
    rollover: "Unlimited",
    features: [
      "Unlimited Garments",
      "12h Express Turnaround",
      "Free Pickup & Delivery",
      "Priority Support",
      "Unlimited Rollover",
      "Unlimited Ironing",
      "Dedicated Support",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                              Usage Overview                                */
/* -------------------------------------------------------------------------- */

export const usageStats: UsageStat[] = [
  {
    id: "used",
    title: "Garments Used",
    value: "31",
    subtitle: "of 50",
    icon: <Shirt className="h-5 w-5" />,
  },
  {
    id: "remaining",
    title: "Garments Left",
    value: "19",
    subtitle: "remaining",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "saved",
    title: "Amount Saved",
    value: "₹420",
    subtitle: "this month",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    id: "water",
    title: "Water Saved",
    value: "180 L",
    subtitle: "this month",
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    id: "carbon",
    title: "Carbon Reduced",
    value: "5.2 kg",
    subtitle: "this month",
    icon: <Leaf className="h-5 w-5" />,
  },
];

/* -------------------------------------------------------------------------- */
/*                             Payment Methods                                */
/* -------------------------------------------------------------------------- */

export const paymentMethods: PaymentMethod[] = [
  {
    id: "visa-3245",
    brand: "Visa",
    last4: "3245",
    expiry: "12/28",
    isDefault: true,
  },
];

/* -------------------------------------------------------------------------- */
/*                              Billing History                               */
/* -------------------------------------------------------------------------- */

export const billingHistory: BillingHistory[] = [
  {
    id: "jul",
    month: "July 2026",
    date: "28 Jun 2026",
    amount: 999,
    status: "Paid",
  },
  {
    id: "jun",
    month: "June 2026",
    date: "28 May 2026",
    amount: 999,
    status: "Paid",
  },
  {
    id: "may",
    month: "May 2026",
    date: "28 Apr 2026",
    amount: 999,
    status: "Paid",
  },
];

/* -------------------------------------------------------------------------- */
/*                                Benefits                                    */
/* -------------------------------------------------------------------------- */

export const subscriptionBenefits: Benefit[] = [
  {
    id: "pickup",
    title: "Free Pickup",
    description: "At your doorstep",
    icon: <Truck className="h-5 w-5" />,
  },
  {
    id: "eco",
    title: "Eco-friendly Wash",
    description: "Saving water & energy",
    icon: <Leaf className="h-5 w-5" />,
  },
  {
    id: "priority",
    title: "Priority Service",
    description: "Faster processing",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "rewash",
    title: "Free Rewash",
    description: "If not satisfied",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    id: "renewal",
    title: "Auto Renewal",
    description: "Never miss a pickup",
    icon: <Calendar className="h-5 w-5" />,
  },
];

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

export function getUsagePercentage(
  used: number,
  total: number,
): number {
  if (!total) return 0;

  return Math.round((used / total) * 100);
}

export function getRemainingGarments(
  used: number,
  total: number,
): number {
  return Math.max(total - used, 0);
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}