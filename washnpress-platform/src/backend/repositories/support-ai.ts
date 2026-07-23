export type TicketCategory =
  | "Pickup Delay"
  | "Pickup Executive Behaviour"
  | "Delivery Delay"
  | "Wrong Delivery"
  | "Missing Garments"
  | "Damaged Clothes"
  | "Poor Washing Quality"
  | "Poor Ironing Quality"
  | "Dry Cleaning Issue"
  | "Payment Issue"
  | "Refund Request"
  | "Subscription Issue"
  | "Account/Login Issue"
  | "App Bug"
  | "General Query"
  | "Other";

export type AssignedTeam =
  | "Pickup Manager"
  | "Delivery Manager"
  | "Laundry Operations"
  | "Finance"
  | "Technical Team"
  | "Customer Support";

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

export const CATEGORY_TEAM_MAP: Record<TicketCategory, AssignedTeam> = {
  "Pickup Delay": "Pickup Manager",
  "Pickup Executive Behaviour": "Pickup Manager",
  "Delivery Delay": "Delivery Manager",
  "Wrong Delivery": "Delivery Manager",
  "Missing Garments": "Laundry Operations",
  "Damaged Clothes": "Laundry Operations",
  "Poor Washing Quality": "Laundry Operations",
  "Poor Ironing Quality": "Laundry Operations",
  "Dry Cleaning Issue": "Laundry Operations",
  "Payment Issue": "Finance",
  "Refund Request": "Finance",
  "Subscription Issue": "Customer Support",
  "Account/Login Issue": "Technical Team",
  "App Bug": "Technical Team",
  "General Query": "Customer Support",
  Other: "Customer Support",
};

export const CATEGORY_SLA_MAP: Record<
  TicketCategory,
  { responseMinutes: number; resolutionMinutes: number; defaultPriority: TicketPriority }
> = {
  "Pickup Delay": { responseMinutes: 15, resolutionMinutes: 60, defaultPriority: "High" },
  "Pickup Executive Behaviour": { responseMinutes: 30, resolutionMinutes: 240, defaultPriority: "Medium" },
  "Delivery Delay": { responseMinutes: 15, resolutionMinutes: 120, defaultPriority: "High" },
  "Wrong Delivery": { responseMinutes: 30, resolutionMinutes: 360, defaultPriority: "High" },
  "Missing Garments": { responseMinutes: 30, resolutionMinutes: 1440, defaultPriority: "Critical" },
  "Damaged Clothes": { responseMinutes: 30, resolutionMinutes: 2880, defaultPriority: "Critical" },
  "Poor Washing Quality": { responseMinutes: 60, resolutionMinutes: 1440, defaultPriority: "Medium" },
  "Poor Ironing Quality": { responseMinutes: 60, resolutionMinutes: 1440, defaultPriority: "Medium" },
  "Dry Cleaning Issue": { responseMinutes: 60, resolutionMinutes: 1440, defaultPriority: "Medium" },
  "Payment Issue": { responseMinutes: 30, resolutionMinutes: 1440, defaultPriority: "High" },
  "Refund Request": { responseMinutes: 30, resolutionMinutes: 1440, defaultPriority: "High" },
  "Subscription Issue": { responseMinutes: 60, resolutionMinutes: 1440, defaultPriority: "Medium" },
  "Account/Login Issue": { responseMinutes: 120, resolutionMinutes: 2880, defaultPriority: "Medium" },
  "App Bug": { responseMinutes: 120, resolutionMinutes: 2880, defaultPriority: "Low" },
  "General Query": { responseMinutes: 120, resolutionMinutes: 1440, defaultPriority: "Low" },
  Other: { responseMinutes: 120, resolutionMinutes: 1440, defaultPriority: "Low" },
};

/**
  * AI Categorization & Priority Suggestion Helper
  * Analyzes issue text to detect best category, team, priority, and SLA deadlines.
  */
export function analyzeTicketWithAI(description: string, selectedCategory?: string): {
  category: TicketCategory;
  assignedTeam: AssignedTeam;
  priority: TicketPriority;
  responseMinutes: number;
  resolutionMinutes: number;
  confidenceScore: number;
  reasoning: string;
} {
  const text = description.toLowerCase();

  let detectedCategory: TicketCategory = "General Query";
  let confidence = 0.85;
  let reasoning = "Keyword analysis matched customer inquiry.";

  if (selectedCategory && CATEGORY_TEAM_MAP[selectedCategory as TicketCategory]) {
    detectedCategory = selectedCategory as TicketCategory;
    confidence = 0.95;
    reasoning = `Category directly selected by user (${selectedCategory}).`;
  } else if (text.includes("pickup") || text.includes("collect") || text.includes("boy didn't come")) {
    if (text.includes("rude") || text.includes("behaviour") || text.includes("behavior")) {
      detectedCategory = "Pickup Executive Behaviour";
    } else {
      detectedCategory = "Pickup Delay";
    }
  } else if (text.includes("delivery") || text.includes("deliver") || text.includes("late")) {
    if (text.includes("wrong") || text.includes("someone else")) {
      detectedCategory = "Wrong Delivery";
    } else {
      detectedCategory = "Delivery Delay";
    }
  } else if (text.includes("missing") || text.includes("lost garment") || text.includes("shirt missing")) {
    detectedCategory = "Missing Garments";
  } else if (text.includes("damage") || text.includes("tear") || text.includes("stain") || text.includes("color")) {
    detectedCategory = "Damaged Clothes";
  } else if (text.includes("wash") || text.includes("dirty") || text.includes("smell")) {
    detectedCategory = "Poor Washing Quality";
  } else if (text.includes("iron") || text.includes("wrinkle") || text.includes("press")) {
    detectedCategory = "Poor Ironing Quality";
  } else if (text.includes("payment") || text.includes("charged twice") || text.includes("upi") || text.includes("failed")) {
    detectedCategory = "Payment Issue";
  } else if (text.includes("refund")) {
    detectedCategory = "Refund Request";
  } else if (text.includes("subscription") || text.includes("plan") || text.includes("renew")) {
    detectedCategory = "Subscription Issue";
  } else if (text.includes("login") || text.includes("otp") || text.includes("password")) {
    detectedCategory = "Account/Login Issue";
  } else if (text.includes("bug") || text.includes("app crash") || text.includes("error")) {
    detectedCategory = "App Bug";
  }

  const team = CATEGORY_TEAM_MAP[detectedCategory] || "Customer Support";
  const slaInfo = CATEGORY_SLA_MAP[detectedCategory] || { responseMinutes: 30, resolutionMinutes: 1440, defaultPriority: "Medium" };

  let priority = slaInfo.defaultPriority;
  if (text.includes("urgent") || text.includes("emergency") || text.includes("wedding") || text.includes("flight")) {
    priority = "Critical";
  }

  return {
    category: detectedCategory,
    assignedTeam: team,
    priority,
    responseMinutes: slaInfo.responseMinutes,
    resolutionMinutes: slaInfo.resolutionMinutes,
    confidenceScore: confidence,
    reasoning,
  };
}

/**
  * AI Quick Response Draft Generator for Support Agents
  */
export function generateAIResponseDraft(category: string, residentName: string, ticketCode: string): string {
  const name = residentName || "Valued Customer";
  switch (category) {
    case "Pickup Delay":
      return `Dear ${name}, we sincerely apologize for the delay in picking up your order (${ticketCode}). We have alerted our local Pickup Manager and dispatched an executive to your address immediately.`;
    case "Delivery Delay":
      return `Hello ${name}, thank you for contacting WashNPress. Order ${ticketCode} is currently with our delivery executive and will reach your doorstep within the next 45 minutes.`;
    case "Missing Garments":
      return `Dear ${name}, we understand your concern regarding missing garments in ${ticketCode}. Our Laundry Operations Hub is cross-checking the intake video logs right now. Our manager will call you within 30 minutes.`;
    case "Damaged Clothes":
      return `Dear ${name}, we take fabric care very seriously. A senior QC manager has opened an investigation for ticket ${ticketCode}. We will collect the garment for inspection and initiate appropriate resolution.`;
    case "Payment Issue":
    case "Refund Request":
      return `Hello ${name}, our Finance Team has received your request regarding ticket ${ticketCode}. Any excess charges will be refunded to your WashNPress Wallet within 2 hours.`;
    default:
      return `Hello ${name}, thank you for reaching out to WashNPress Support. We have logged ticket ${ticketCode} and assigned it to our support team. We will resolve this promptly.`;
  }
}
