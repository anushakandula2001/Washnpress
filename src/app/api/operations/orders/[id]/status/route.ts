import { NextResponse } from "next/server";
import { withErrorHandling } from "@/backend/api/response";
import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { updateOrderStatus } from "@/backend/repositories/orders-ext";
import { ok, badRequest, notFound } from "@/backend/api/response";
import { findOrderByCode, listOrderEvents } from "@/backend/repositories/orders";

const schema = z.object({ status: z.string().min(1) });

const PIPELINE_STAGES = [
  { label: "Receiving", statuses: ["Picked Up"] },
  { label: "Washing", statuses: ["In Wash"] },
  { label: "Drying", statuses: ["Dry"] },
  { label: "Ironing", statuses: ["Iron"] },
  { label: "QC Hold", statuses: ["QC Hold"] },
  { label: "Stain Removal", statuses: ["Stain Removal"] },
  { label: "Alteration", statuses: ["Alteration"] },
  { label: "Folding", statuses: ["Folding"] },
  { label: "Packing", statuses: ["Packing"] },
  { label: "Ready for Dispatch", statuses: ["Out for Delivery"] },
  { label: "Delivered", statuses: ["Delivered"] }
];

async function _GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(request, "operator");
    if ("error" in auth) return auth.error;

    const { id: orderCode } = await params;
    const order = await findOrderByCode(orderCode);

    if (!order) {
      return NextResponse.json({
        orderId: orderCode,
        currentStage: null,
        startedAt: null,
        eta: null,
        elapsedMinutes: 0,
        operator: null,
        timeline: []
      }, { status: 200 });
    }

    const events = await listOrderEvents(order.id);
    const statusEvents = events.filter(e => e.event_type === "status_change");

    let currentStage = order.status;
    let activeStageObj = null;
    
    for (const stage of PIPELINE_STAGES) {
      if (stage.statuses.includes(order.status)) {
        currentStage = stage.label;
        activeStageObj = stage;
        break;
      }
    }

    let activeStartedRaw = order.updated_at ? new Date(order.updated_at) : null;
    let startedAt = activeStartedRaw && !isNaN(activeStartedRaw.getTime()) ? activeStartedRaw.toISOString() : null;

    const timeline: { stage: string; startedAt?: string; completedAt?: string }[] = [];
    
    for (const stage of PIPELINE_STAGES) {
      const event = statusEvents.find(e => {
        const payload = e.event_payload as { status?: string };
        return payload?.status && stage.statuses.includes(payload.status);
      });

      if (event) {
        if (activeStageObj && stage.label === activeStageObj.label) {
          activeStartedRaw = new Date(event.created_at);
          startedAt = activeStartedRaw.toISOString();
          timeline.push({
            stage: stage.label,
            startedAt: startedAt
          });
        } else {
          timeline.push({
            stage: stage.label,
            completedAt: new Date(event.created_at).toISOString()
          });
        }
      }
    }

    let eta = null;
    let elapsedMinutes = 0;
    if (activeStartedRaw && !isNaN(activeStartedRaw.getTime())) {
      const diffMs = Math.max(0, new Date().getTime() - activeStartedRaw.getTime());
      elapsedMinutes = Math.floor(diffMs / 60000);
      eta = new Date(activeStartedRaw.getTime() + 4 * 60 * 60 * 1000).toISOString();
    }

    return NextResponse.json({
      orderId: order.order_code,
      currentStage,
      startedAt,
      eta,
      elapsedMinutes,
      operator: null,
      timeline
    }, { status: 200 });

  } catch (err) {
    console.error("Error in GET order status:", err);
    return NextResponse.json({
      success: false,
      message: "Unable to load processing status"
    }, { status: 500 });
  }
}

async function _PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("status required");
  const order = await updateOrderStatus(id, parsed.data.status, auth.session.userId);
  if (!order) return notFound("Order not found");
  return ok({ order });
}

export const GET = _GET; // Do not wrap in withErrorHandling if we handle it directly
export const PATCH = withErrorHandling(_PATCH);
