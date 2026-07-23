import { describe, it, expect, beforeEach } from "vitest";
import {
  createSupportTicket,
  getSupportTicketDetails,
  listSupportTickets,
  updateTicketStatus,
  addTicketMessage,
  assignTicket,
  escalateTicket,
  submitCsatRating,
  getSupportDashboardStats,
  resetSupportInMemoryStore,
} from "./support";
import { analyzeTicketWithAI } from "./support-ai";

describe("Enterprise Support & Ticket Management", () => {
  beforeEach(() => {
    resetSupportInMemoryStore();
  });

  describe("Ticket Creation & Auto-Routing", () => {
    it("should create a ticket and generate a valid ticket code", async () => {
      const ticket = await createSupportTicket({
        residentId: "res-1",
        description: "My clothes were not washed properly",
        category: "Quality Concern",
        societyId: "soc-1",
      });
      expect(ticket).toBeDefined();
      expect(ticket.ticket_code).toMatch(/^SUP-\d+$/);
      expect(ticket.status).toBe("Open");
      expect(ticket.resident_id).toBe("res-1");
    });

    it("should calculate SLA correctly based on priority", async () => {
      const criticalTicket = await createSupportTicket({
        residentId: "res-1",
        description: "Delivery executive was very rude",
        category: "Delivery Issue",
        priority: "Critical",
      });
      const lowTicket = await createSupportTicket({
        residentId: "res-1",
        description: "How do I change my password?",
        category: "General Query",
        priority: "Low",
      });

      const criticalSlaHours = (new Date(criticalTicket.sla_resolution_due_at).getTime() - new Date(criticalTicket.created_at).getTime()) / (1000 * 60 * 60);
      const lowSlaHours = (new Date(lowTicket.sla_resolution_due_at).getTime() - new Date(lowTicket.created_at).getTime()) / (1000 * 60 * 60);

      expect(criticalSlaHours).toBe(2);
      expect(lowSlaHours).toBe(24);
    });

    it("should correctly identify team assignment using AI categorization", () => {
      const pickupAnalysis = analyzeTicketWithAI("Pickup person didn't come", "Pickup Issue");
      expect(pickupAnalysis.assignedTeam).toBe("Pickup Manager");
      expect(pickupAnalysis.priority).toBe("High");

      const financeAnalysis = analyzeTicketWithAI("I got charged twice for the same order", "Payment Issue");
      expect(financeAnalysis.assignedTeam).toBe("Finance");
      expect(financeAnalysis.priority).toBe("High");
    });
  });

  describe("Ticket Messaging & Channels", () => {
    it("should isolate internal notes from customer channel", async () => {
      const ticket = await createSupportTicket({
        residentId: "res-1",
        description: "App keeps crashing",
        category: "Bug",
      });

      // Resident sends message
      await addTicketMessage({
        ticketId: ticket.id,
        senderUserId: "res-1",
        senderName: "Resident",
        senderType: "resident",
        channel: "customer",
        message: "It crashes on login screen",
      });

      // Staff sends internal note
      await addTicketMessage({
        ticketId: ticket.id,
        senderUserId: "staff-1",
        senderName: "Dev Team",
        senderType: "support",
        channel: "internal",
        message: "Looks like an iOS specific bug, investigating.",
      });

      // Staff replies to resident
      await addTicketMessage({
        ticketId: ticket.id,
        senderUserId: "staff-2",
        senderName: "Support Agent",
        senderType: "support",
        channel: "customer",
        message: "We are looking into this issue.",
      });

      const customerView = await getSupportTicketDetails(ticket.id, "customer");
      const staffView = await getSupportTicketDetails(ticket.id, "all");

      expect(customerView?.messages).toHaveLength(2);
      expect(staffView?.messages).toHaveLength(3);
      
      const hasInternalInCustomer = customerView?.messages.some(m => m.channel === "internal");
      expect(hasInternalInCustomer).toBe(false);
    });
  });

  describe("Ticket Lifecycle & Audit History", () => {
    it("should track state changes in history", async () => {
      const ticket = await createSupportTicket({
        residentId: "res-1",
        description: "Issue",
        category: "Other",
      });

      await assignTicket(ticket.id, "Technical Team", "dev-1", "Developer", "Manager");
      await updateTicketStatus(ticket.id, "In Progress", "Developer");
      
      const details = await getSupportTicketDetails(ticket.id);
      expect(details?.history).toBeDefined();
      
      // Initial creation + assignment + status update
      expect(details?.history.length).toBeGreaterThanOrEqual(3);
      
      const assignLog = details?.history.find(h => h.field_changed === "assigned_team");
      expect(assignLog).toBeDefined();
      expect(assignLog?.new_value).toBe("Technical Team");
    });

    it("should calculate CSAT correctly", async () => {
      const ticket = await createSupportTicket({
        residentId: "res-1",
        description: "Refund missing",
        category: "Finance",
      });

      await updateTicketStatus(ticket.id, "Resolved", "Agent");
      await submitCsatRating(ticket.id, 5, "Great help!");

      const details = await getSupportTicketDetails(ticket.id);
      expect(details?.csat_rating).toBe(5);
      expect(details?.csat_feedback).toBe("Great help!");
    });
  });

  describe("Dashboard & Reporting", () => {
    it("should aggregate dashboard stats correctly", async () => {
      await createSupportTicket({
        residentId: "res-1",
        description: "1",
        category: "Bug",
        priority: "Low"
      });
      await createSupportTicket({
        residentId: "res-2",
        description: "2",
        category: "Payment Issue",
        priority: "High"
      });
      
      const t3 = await createSupportTicket({
        residentId: "res-3",
        description: "3",
        category: "Payment Issue",
        priority: "Critical"
      });
      
      await escalateTicket(t3.id, "SLA approaching", "System");

      const stats = await getSupportDashboardStats();
      
      expect(stats.totalOpen).toBeGreaterThanOrEqual(3);
      
      const paymentCat = stats.byCategory.find(c => c.category === "Payment Issue");
      expect(paymentCat?.count).toBeGreaterThanOrEqual(2);
      
      const escalatedCount = stats.byPriority.find(p => p.priority === "Critical");
      expect(escalatedCount?.count).toBeGreaterThanOrEqual(1);
    });
  });
});
