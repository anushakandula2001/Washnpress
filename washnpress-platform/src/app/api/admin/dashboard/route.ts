import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { queryOne } from "@/backend/db/pool";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  const row = await queryOne<{
    residents: string;
    operators: string;
    orders: string;
    revenue: string;
    subscriptions: string;
    wallet: string;
    tickets: string;
    societies: string;
    today_pickups: string;
    in_progress: string;
    completed: string;
  }>(
    `SELECT
       (SELECT COUNT(*)::text FROM residents) AS residents,
       (SELECT COUNT(*)::text FROM operators) AS operators,
       (SELECT COUNT(*)::text FROM orders) AS orders,
       (SELECT COALESCE(SUM(amount_inr), 0)::text FROM billing_invoices WHERE status = 'paid') AS revenue,
       (SELECT COUNT(*)::text FROM subscriptions WHERE status = 'active') AS subscriptions,
       (SELECT COALESCE(SUM(balance_inr), 0)::text FROM wallets) AS wallet,
       (SELECT COUNT(*)::text FROM support_tickets WHERE status IN ('open','in_progress')) AS tickets,
       (SELECT COUNT(*)::text FROM societies) AS societies,
       (SELECT COUNT(*)::text FROM pickups WHERE scheduled_for::date = CURRENT_DATE) AS today_pickups,
       (SELECT COUNT(*)::text FROM orders WHERE status NOT IN ('Delivered','Cancelled','Scheduled')) AS in_progress,
       (SELECT COUNT(*)::text FROM orders WHERE status = 'Delivered') AS completed`,
  );

  return ok({
    kpis: {
      residents: parseInt(row?.residents ?? "0", 10),
      operators: parseInt(row?.operators ?? "0", 10),
      orders: parseInt(row?.orders ?? "0", 10),
      revenue: parseFloat(row?.revenue ?? "0"),
      subscriptions: parseInt(row?.subscriptions ?? "0", 10),
      walletBalance: parseFloat(row?.wallet ?? "0"),
      supportTickets: parseInt(row?.tickets ?? "0", 10),
      societies: parseInt(row?.societies ?? "0", 10),
      todayPickups: parseInt(row?.today_pickups ?? "0", 10),
      ordersInProgress: parseInt(row?.in_progress ?? "0", 10),
      completedOrders: parseInt(row?.completed ?? "0", 10),
    },
  });
}
