"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Mail,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Bell,
  Settings,
  Users,
  ExternalLink,
} from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { adminNav } from "@/lib/portal-nav";

const faqs = [
  {
    category: "Account & Roles",
    icon: ShieldCheck,
    items: [
      {
        q: "How do I change my account password?",
        a: "Navigate to Account Settings → Change Password, or click your profile avatar in the top-right header and select 'Change Password'. Enter your current password, then set a new one meeting the security requirements.",
      },
      {
        q: "How do I update my profile information?",
        a: "Click your profile avatar in the top-right corner and select 'My Profile'. You can edit your Full Name, Email, Phone Number, and Department. Click 'Save Changes' when done.",
      },
      {
        q: "How do I assign roles to other users?",
        a: "Go to Admin Portal → Users → Roles & Permissions. From there you can assign or revoke roles for any registered user in the system.",
      },
    ],
  },
  {
    category: "Notifications",
    icon: Bell,
    items: [
      {
        q: "How do I manage notification preferences?",
        a: "Click your profile avatar and select 'Notification Preferences', or navigate to Settings → Notification Preferences. Toggle Email, SMS, Push, and Marketing notifications on or off, then click Save.",
      },
      {
        q: "How do I send a broadcast notification to all residents?",
        a: "Go to Admin Portal → Notifications → Broadcast. Compose your message, select the audience (all residents, specific society, or individual), and click 'Send Broadcast'.",
      },
    ],
  },
  {
    category: "System Configuration",
    icon: Settings,
    items: [
      {
        q: "How do I configure platform settings?",
        a: "Navigate to Admin Portal → Settings. You can update working hours, OTP configuration, notifications settings, and platform commerce configuration from JSON editors.",
      },
      {
        q: "How do I switch between light and dark mode?",
        a: "Click your profile avatar in the top-right header and toggle the Theme switch, or click the Moon/Sun icon button in the header bar. Your preference is saved automatically for future sessions.",
      },
      {
        q: "How do I view system health and performance metrics?",
        a: "Navigate to Admin Portal → System Health for real-time infrastructure monitoring, or Admin Portal → Performance for business analytics dashboards.",
      },
    ],
  },
  {
    category: "Users & Operators",
    icon: Users,
    items: [
      {
        q: "How do I onboard a new operator?",
        a: "Go to Admin Portal → Operators → Add New Operator. Fill in their contact details, assign societies, and set their status. They'll receive an OTP invite to complete their setup.",
      },
      {
        q: "How do I view resident subscription details?",
        a: "Navigate to Admin Portal → Residents, search or filter by name/phone, then click on a resident to view their subscription plan, billing history, and service usage.",
      },
    ],
  },
];

const quickContacts = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get detailed help via email within 24 hours",
    action: "support@washnpress.com",
    href: "mailto:support@washnpress.com",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: MessageSquare,
    title: "Live Support",
    description: "Chat with our team during business hours",
    action: "Start Chat",
    href: "#",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Browse the full platform documentation",
    action: "View Docs",
    href: "#",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

const systemStatus = [
  { service: "Platform API", status: "Operational" },
  { service: "Database", status: "Operational" },
  { service: "Authentication", status: "Operational" },
  { service: "Notifications", status: "Operational" },
  { service: "Payment Gateway", status: "Operational" },
];

export default function AdminHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFaqs = faqs
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          !searchQuery ||
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
      greeting="Help & Support"
      subtitle="Find answers, contact support, and check system status"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero Search */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <HelpCircle className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">How can we help you?</h2>
          <p className="mt-2 text-muted-foreground">
            Search the FAQ or browse by category below.
          </p>
          <div className="relative mx-auto mt-6 max-w-lg">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles..."
              className="w-full rounded-xl border border-input bg-background py-3 pl-12 pr-4 text-sm text-foreground shadow-sm outline-none ring-primary transition focus:ring-2"
              aria-label="Search help articles"
            />
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div>
          <h3 className="mb-4 text-base font-bold text-foreground">Contact Support</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickContacts.map((contact) => {
              const Icon = contact.icon;
              return (
                <a
                  key={contact.title}
                  href={contact.href}
                  className={`flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${contact.border} ${contact.bg}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-sm ${contact.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`font-semibold ${contact.color}`}>{contact.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{contact.description}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${contact.color}`}>
                    {contact.action}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div>
          <h3 className="mb-4 text-base font-bold text-foreground">
            Frequently Asked Questions
            {searchQuery && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                — {filteredFaqs.reduce((acc, c) => acc + c.items.length, 0)} results for &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </h3>

          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="font-medium text-foreground">No articles found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or browse all categories below.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((category) => {
                const CatIcon = category.icon;
                return (
                  <div
                    key={category.category}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                  >
                    <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
                      <CatIcon className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-foreground">{category.category}</h4>
                    </div>
                    <div className="divide-y divide-border">
                      {category.items.map((item, idx) => {
                        const key = `${category.category}-${idx}`;
                        const isOpen = openItems[key];
                        return (
                          <div key={key}>
                            <button
                              type="button"
                              onClick={() => toggleItem(key)}
                              aria-expanded={isOpen}
                              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                            >
                              <span className="text-sm font-medium text-foreground">{item.q}</span>
                              <ChevronDown
                                className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {isOpen && (
                              <div className="border-t border-border/50 bg-muted/10 px-5 py-4">
                                <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">System Status</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                All Systems Operational
              </span>
            </div>
          </div>
          <div className="divide-y divide-border">
            {systemStatus.map((item) => (
              <div key={item.service} className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-foreground">{item.service}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
