"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

type SheetContextValue = { open: boolean; onOpenChange: (open: boolean) => void };
const SheetContext = React.createContext<SheetContextValue | null>(null);

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetContent({
  children,
  className,
  side = "right",
  width = "500px",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "right" | "left";
  width?: string;
}) {
  const ctx = React.useContext(SheetContext);
  if (!ctx?.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        aria-label="Close drawer"
        onClick={() => ctx.onOpenChange(false)}
      />
      <div
        className={cn(
          "relative ml-auto flex h-full flex-col bg-card shadow-2xl transition-transform duration-300 ease-out",
          side === "left" && "mr-auto ml-0",
          className,
        )}
        style={{ width: `min(100vw, ${width})` }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3 z-10 h-8 w-8 p-0"
          onClick={() => ctx.onOpenChange(false)}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-b border-border px-6 py-5 pr-14", className)}>{children}</div>;
}

export function SheetBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)}>{children}</div>;
}
