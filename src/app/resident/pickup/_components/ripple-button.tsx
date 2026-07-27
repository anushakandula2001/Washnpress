"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Ripple = { id: number; x: number; y: number };

type RippleButtonProps = ButtonProps & {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
};

export function RippleButton({
  className,
  children,
  loading = false,
  loadingText,
  disabled,
  onClick,
  ...props
}: RippleButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  function spawnRipple(e: MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 520);
  }

  return (
    <Button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        className,
      )}
      onClick={(e) => {
        spawnRipple(e);
        onClick?.(e);
      }}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText ?? "Please wait…"}
            </motion.span>
          ) : (
            <motion.span
              key="label"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/35"
          style={{ left: r.x, top: r.y, width: 8, height: 8, marginLeft: -4, marginTop: -4 }}
          initial={{ scale: 0, opacity: 0.55 }}
          animate={{ scale: 18, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </Button>
  );
}
