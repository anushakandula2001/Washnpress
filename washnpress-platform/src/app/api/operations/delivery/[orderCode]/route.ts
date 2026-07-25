import { requireRole } from "@/backend/api/guards";
import { query, queryOne } from "@/backend/db/pool";
import { ok, badRequest, notFound } from "@/backend/api/response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderCode: string }> }
) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const { orderCode } = await params;

  if (!orderCode) {
    return badRequest("Order code is required");
  }

  try {
    const body = await request.json();

    if (body.status !== "Delivered") {
      return badRequest("Invalid status update");
    }

    await query("BEGIN", []);

    const order = await queryOne<{ id: string }>(
      "SELECT id FROM orders WHERE order_code = $1",
      [orderCode]
    );

    if (!order) {
      await query("ROLLBACK", []);
      return notFound("Order not found");
    }

    await query(
      `
      UPDATE orders
      SET
        status = 'Delivered',
        updated_at = NOW()
      WHERE id = $1
      `,
      [order.id]
    );

    await query("COMMIT", []);

    return ok({
      success: true,
      message: "Order marked as delivered",
    });
  } catch (error) {
    await query("ROLLBACK", []);
    console.error("Failed to mark delivered:", error);

    return badRequest("Failed to update delivery status");
  }
}