"use client";

import { Check } from "lucide-react";

interface FeatureListProps {
  features: string[];
  className?: string;
}

export function FeatureList({
  features,
  className = "",
}: FeatureListProps) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {features.map((feature) => (
        <li
          key={feature}
          className="flex items-start gap-3 text-sm text-muted-foreground"
        >
          <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-3.5 w-3.5" />
          </div>

          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}