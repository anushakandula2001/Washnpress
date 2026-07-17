"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-border/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        className,
      )}
    >
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <h3 className="text-2xl font-bold tracking-tight">
            {value}
          </h3>

          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}