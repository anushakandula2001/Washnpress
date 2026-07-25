"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useMotionPrefs } from "./motion-primitives";

const COLORS = ["#10B5B8", "#00c9c9", "#00e5cc", "#34d399", "#67e8f9", "#fbbf24"];

function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function ConfettiBurst({ count = 36 }: { count?: number }) {
  const { reduce } = useMotionPrefs();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = seeded(i + 1);
        const b = seeded(i + 17);
        const c = seeded(i + 41);
        const d = seeded(i + 73);
        const e = seeded(i + 101);
        return {
          id: i,
          x: (a - 0.5) * 320,
          y: 40 + b * 180,
          rotate: c * 360,
          color: COLORS[i % COLORS.length],
          delay: d * 0.25,
          size: 6 + e * 8,
        };
      }),
    [count],
  );

  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-16 rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.55,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: p.x,
            y: p.y,
            rotate: p.rotate,
            scale: 1,
          }}
          transition={{ duration: 1.35, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
