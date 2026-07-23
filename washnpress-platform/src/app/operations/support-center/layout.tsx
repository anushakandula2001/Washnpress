import { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Headphones, CheckCircle2, Clock, AlertTriangle, LayoutDashboard, UserCheck, BookOpen, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Support Center | WashNPress Operations",
  description: "Enterprise Help Desk & Ticket Management",
};

export default async function SupportCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "/operations/support-center";

  const tabs = [
    { name: "Dashboard", href: "/operations/support-center", icon: LayoutDashboard },
    { name: "Open Tickets", href: "/operations/support-center/open", icon: Clock },
    { name: "Assigned To Me", href: "/operations/support-center/my-tickets", icon: UserCheck },
    { name: "Escalated", href: "/operations/support-center/escalated", icon: AlertTriangle },
    { name: "Resolved", href: "/operations/support-center/resolved", icon: CheckCircle2 },
    { name: "Knowledge Base", href: "/operations/support-center/kb", icon: BookOpen },
    { name: "Reports", href: "/operations/support-center/reports", icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Headphones className="h-8 w-8 text-primary" />
            Support Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Enterprise Help Desk & Customer Support Management
          </p>
        </div>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
