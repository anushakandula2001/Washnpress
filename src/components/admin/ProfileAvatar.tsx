"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ProfileAvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  status?: "online" | "offline" | "busy" | "away";
  className?: string;
  onClick?: () => void;
  alt?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-xl font-bold",
};

const statusSizeClasses = {
  sm: "h-2 w-2 ring-1",
  md: "h-2.5 w-2.5 ring-2",
  lg: "h-3 w-3 ring-2",
  xl: "h-4 w-4 ring-2",
};

const statusBgClasses = {
  online: "bg-emerald-500",
  offline: "bg-muted-foreground",
  busy: "bg-rose-500",
  away: "bg-amber-500",
};

export function ProfileAvatar({
  src,
  name = "Platform Admin",
  size = "md",
  showStatus = true,
  status = "online",
  className,
  onClick,
  alt,
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (str: string) => {
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0] ? parts[0].slice(0, 2).toUpperCase() : "PA";
  };

  const initials = getInitials(name);

  return (
    <div className="relative inline-block shrink-0">
      <button
        type="button"
        onClick={onClick}
        tabIndex={onClick ? 0 : -1}
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 font-semibold text-primary transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          sizeClasses[size],
          onClick ? "cursor-pointer hover:opacity-90 hover:scale-105" : "cursor-default",
          className,
        )}
        aria-label={alt ?? `${name} profile picture`}
      >
        {src && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="inline-flex items-center justify-center">
            {initials ? initials : <User className="h-1/2 w-1/2" />}
          </span>
        )}
      </button>

      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-background",
            statusSizeClasses[size],
            statusBgClasses[status],
          )}
          title={`Status: ${status}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
