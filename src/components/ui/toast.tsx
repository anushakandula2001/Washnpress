"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; message: string; type: ToastType };

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "error" | "info";
};

type ToastContextValue = {
  toast: (messageOrOptions: string | ToastOptions, type?: ToastType) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const toast = React.useCallback((messageOrOptions: string | ToastOptions, type: ToastType = "info") => {
    let message = "";
    let finalType: ToastType = type;
    
    if (typeof messageOrOptions === "string") {
      message = messageOrOptions;
    } else {
      message = messageOrOptions.description || messageOrOptions.title || "";
      if (messageOrOptions.variant === "destructive") finalType = "error";
      else if (messageOrOptions.variant === "success") finalType = "success";
      else if (messageOrOptions.variant === "default") finalType = "info";
      else if (messageOrOptions.variant === "error") finalType = "error";
    }

    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type: finalType }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex min-w-[280px] max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm",
              t.type === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
              t.type === "error" && "border-destructive/30 bg-destructive/10 text-destructive",
              t.type === "info" && "border-border bg-card text-foreground",
            )}
            role="status"
          >
            {t.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : t.type === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : null}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              className="shrink-0 opacity-60 hover:opacity-100"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const fallbackCtx: ToastContextValue = {
  toast: (messageOrOptions: string | ToastOptions, type?: ToastType) => {
    if (typeof window !== "undefined") console.info("[toast]", messageOrOptions, type);
  },
};

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    return fallbackCtx;
  }
  return ctx;
}
