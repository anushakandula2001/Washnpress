"use server";

import { pool } from "@/backend/db/pool";
import { format } from "date-fns";

export async function getDashboardMetrics() {
  const today = format(new Date(), "yyyy-MM-dd");

  try {
    const { rows: todayPickupsRows } = await pool.query(
      `SELECT COUNT(*) as count FROM orders WHERE status = 'SCHEDULED' AND DATE(scheduled_for) = $1`,
      [today]
    );

    const { rows: pendingPickupsRows } = await pool.query(
      `SELECT COUNT(*) as count FROM orders WHERE status = 'PENDING_PICKUP' OR status = 'SCHEDULED'`
    );

    const { rows: processingRows } = await pool.query(
      `SELECT COUNT(*) as count FROM orders WHERE status IN ('RECEIVING', 'SORTING', 'WASHING', 'DRY_CLEANING', 'DRYING', 'IRONING', 'QUALITY_CHECK', 'PACKING')`
    );

    const { rows: readyDeliveryRows } = await pool.query(
      `SELECT COUNT(*) as count FROM orders WHERE status = 'READY_FOR_DELIVERY' OR status = 'OUT_FOR_DELIVERY'`
    );

    const { rows: deliveredTodayRows } = await pool.query(
      `SELECT COUNT(*) as count FROM orders WHERE status = 'DELIVERED' AND DATE(updated_at) = $1`,
      [today]
    );

    // Assuming we have billing_invoices or we can sum total_amount from orders. If table doesn't exist, this might fail, so we'll wrap in another try-catch
    let revenueToday = 0;
    try {
      const { rows: revenueRows } = await pool.query(
        `SELECT SUM(CAST(amount_inr AS NUMERIC)) as total FROM billing_invoices WHERE status = 'PAID' AND DATE(billed_on) = $1`,
        [today]
      );
      revenueToday = revenueRows[0]?.total ? parseFloat(revenueRows[0].total) : 0;
    } catch (e) {
      console.warn("Could not fetch revenue from billing_invoices", e);
    }

    return {
      todayPickups: parseInt(todayPickupsRows[0]?.count || "0", 10),
      pendingPickups: parseInt(pendingPickupsRows[0]?.count || "0", 10),
      processing: parseInt(processingRows[0]?.count || "0", 10),
      readyForDelivery: parseInt(readyDeliveryRows[0]?.count || "0", 10),
      deliveredToday: parseInt(deliveredTodayRows[0]?.count || "0", 10),
      revenueToday,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return {
      todayPickups: 0,
      pendingPickups: 0,
      processing: 0,
      readyForDelivery: 0,
      deliveredToday: 0,
      revenueToday: 0,
    };
  }
}

export async function getProcessingPipeline() {
  try {
    const { rows } = await pool.query(
      `SELECT status, COUNT(*) as count FROM orders WHERE status IN ('RECEIVING', 'SORTING', 'WASHING', 'DRY_CLEANING', 'DRYING', 'IRONING', 'QUALITY_CHECK', 'PACKING', 'READY_FOR_DELIVERY', 'DELIVERED') GROUP BY status`
    );
    
    const statusMap = rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    return {
      RECEIVING: statusMap['RECEIVING'] || 0,
      SORTING: statusMap['SORTING'] || 0,
      WASHING: statusMap['WASHING'] || 0,
      DRY_CLEANING: statusMap['DRY_CLEANING'] || 0,
      DRYING: statusMap['DRYING'] || 0,
      IRONING: statusMap['IRONING'] || 0,
      QUALITY_CHECK: statusMap['QUALITY_CHECK'] || 0,
      PACKING: statusMap['PACKING'] || 0,
      READY_FOR_DELIVERY: statusMap['READY_FOR_DELIVERY'] || 0,
      DELIVERED: statusMap['DELIVERED'] || 0,
    };
  } catch (error) {
    console.error("Error fetching processing pipeline:", error);
    return null;
  }
}

export async function getPickupStats() {
  const today = format(new Date(), "yyyy-MM-dd");
  
  try {
    const { rows: statusRows } = await pool.query(
      `SELECT status, COUNT(*) as count FROM orders WHERE DATE(scheduled_for) = $1 GROUP BY status`,
      [today]
    );

    const statusMap = statusRows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    const scheduled = statusMap['SCHEDULED'] || 0;
    const pickedUp = (statusMap['RECEIVING'] || 0) + (statusMap['SORTING'] || 0) + (statusMap['WASHING'] || 0) + (statusMap['DRY_CLEANING'] || 0) + (statusMap['DRYING'] || 0) + (statusMap['IRONING'] || 0) + (statusMap['QUALITY_CHECK'] || 0) + (statusMap['PACKING'] || 0) + (statusMap['READY_FOR_DELIVERY'] || 0) + (statusMap['OUT_FOR_DELIVERY'] || 0) + (statusMap['DELIVERED'] || 0);
    const cancelled = statusMap['CANCELLED'] || 0;
    const pending = scheduled; // simplifcation

    // Mocking slot utilization for now, as joining with actual pickup_slots might be complex if they are not seeded today
    let capacityTotal = 100;
    let capacityBooked = scheduled + pickedUp;

    try {
      const { rows: slotRows } = await pool.query(
        `SELECT SUM(capacity_total) as total, SUM(capacity_remaining) as remaining FROM pickup_slots WHERE slot_date = $1`,
        [today]
      );
      if (slotRows.length > 0 && slotRows[0].total) {
        capacityTotal = parseInt(slotRows[0].total, 10);
        capacityBooked = capacityTotal - parseInt(slotRows[0].remaining, 10);
      }
    } catch(e) {
      console.warn("Could not fetch pickup slots", e);
    }

    return {
      donut: {
        scheduled,
        pickedUp,
        pending,
        cancelled
      },
      gauge: {
        capacityTotal,
        capacityBooked,
        available: capacityTotal - capacityBooked
      }
    };
  } catch (error) {
    console.error("Error fetching pickup stats:", error);
    return null;
  }
}

export async function getRecentActivity() {
  try {
    // We can use order updates or support tickets for activity
    const { rows } = await pool.query(`
      SELECT 'order' as type, id as reference_id, status as action, updated_at as timestamp 
      FROM orders 
      ORDER BY updated_at DESC LIMIT 5
    `);

    return rows.map(r => ({
      id: r.reference_id,
      action: r.action,
      timestamp: r.timestamp,
    }));
  } catch (error) {
    console.error("Error fetching recent activity", error);
    return [];
  }
}
