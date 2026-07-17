"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface BenefitCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export function BenefitCard({
  title,
  description,
  icon,
}: BenefitCardProps) {
  return (
    <Card className="transition-all hover:-translate-y-1 hover:shadow-md">
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold">
            {title}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}