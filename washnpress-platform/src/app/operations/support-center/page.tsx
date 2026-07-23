"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, Ticket, Headphones, BarChart3, TrendingUp, Users } from "lucide-react";
import type { SupportDashboardStats } from "@/backend/repositories/support";

export default function SupportDashboardPage() {
  const [stats, setStats] = useState<SupportDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/support/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">Loading dashboard metrics...</div>;
  }

  if (!stats) {
    return <div className="py-12 text-center text-sm text-destructive">Failed to load dashboard metrics.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 shadow-sm bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalOpen}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/80 shadow-sm bg-gradient-to-br from-destructive/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SLA Breached</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.totalBreached}</div>
            <p className="text-xs text-muted-foreground mt-1 text-destructive/80 font-medium">Critical attention needed</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.avgResolutionHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm bg-gradient-to-br from-success/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CSAT Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.csatScore.toFixed(1)} / 5.0</div>
            <p className="text-xs text-muted-foreground mt-1">Average customer satisfaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2 border-b border-border">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tickets by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {stats.byCategory.map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-muted-foreground">{cat.count} tickets</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.max(2, (cat.count / stats.totalOpen) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
              {stats.byCategory.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No open tickets to categorize.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Priority & Team Breakdown */}
        <div className="space-y-6">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Open Tickets by Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
               <div className="grid grid-cols-4 gap-2 text-center">
                 {stats.byPriority.map((p, i) => (
                   <div key={i} className="bg-muted/30 rounded-xl p-3 border border-border">
                     <div className={`text-2xl font-bold ${
                       p.priority === 'Critical' ? 'text-destructive' :
                       p.priority === 'High' ? 'text-amber-500' :
                       p.priority === 'Medium' ? 'text-blue-500' : 'text-emerald-500'
                     }`}>
                       {p.count}
                     </div>
                     <div className="text-xs font-medium text-muted-foreground uppercase mt-1">{p.priority}</div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Workload by Team
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {stats.byTeam.map((team, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{team.assigned_team}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                        {team.count} tickets
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
