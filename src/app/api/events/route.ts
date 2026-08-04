import { requireSession } from "@/backend/api/guards";
import { realtimeEmitter } from "@/backend/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireSession(req);
  if ("error" in auth) {
    return new Response("Unauthorized", { status: 401 });
  }

  const session = auth.session;
  const roles = session.roles ?? [];

  const channels: string[] = [];

  if (roles.includes("admin") || roles.includes("finance_admin")) {
    channels.push("sync:admin");
  }
  if (roles.includes("operator")) {
    channels.push("sync:operations");
  }
  if (roles.includes("resident") && session.residentId) {
    channels.push(`sync:resident:${session.residentId}`);
    channels.push("sync:resident");
  }

  if (channels.length === 0) {
    return new Response("No roles for sync", { status: 403 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // Stream might be closed
        }
      };

      // Initial connection established
      sendEvent({ type: "connected", timestamp: Date.now() });

      // Heartbeat to keep connection alive
      const pingInterval = setInterval(() => {
        sendEvent({ type: "ping", timestamp: Date.now() });
      }, 30000);

      const messageHandler = (message: string) => {
        sendEvent(JSON.parse(message));
      };

      // Listen to designated channels via our global EventEmitter
      channels.forEach((channel) => {
        realtimeEmitter.on(channel, messageHandler);
      });

      req.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        channels.forEach((channel) => {
          realtimeEmitter.off(channel, messageHandler);
        });
        try {
          controller.close();
        } catch (err) {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
