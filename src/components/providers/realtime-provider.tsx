"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryCount = 0;
    const maxRetries = 5;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      eventSource = new EventSource("/api/events");

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "ping" || data.type === "connected") return;

          // Whenever a legitimate sync event happens, refresh the router
          // This tells Next.js Server Components to re-fetch their data without reloading the page
          router.refresh();

          // Optionally, handle specific toast notifications depending on the event
          if (data.type === "order_delayed" && data.payload?.message) {
             toast(`Order Delayed: ${data.payload.message}`, "error");
          }

        } catch (e) {
          console.error("[realtime] Failed to parse SSE event", e);
        }
      };

      eventSource.onerror = (err) => {
        eventSource?.close();
        if (retryCount < maxRetries) {
          retryCount++;
          reconnectTimeout = setTimeout(connect, Math.min(1000 * Math.pow(2, retryCount), 10000));
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [router, toast]);

  return <>{children}</>;
}
