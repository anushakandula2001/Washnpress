"use client";

import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { NotificationItem } from "./types";

type Props = {
  notifications: NotificationItem[];
  onView: (notification: NotificationItem) => void;
};

function getPriorityVariant(priority: string) {
  switch (priority) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case "read":
      return "default";
    case "delivered":
      return "secondary";
    case "scheduled":
      return "outline";
    case "draft":
      return "outline";
    default:
      return "secondary";
  }
}

export function NotificationTable({
  notifications,
  onView,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Title
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Category
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Audience
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Priority
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Status
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Sent By
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Created
              </th>

              <th className="px-4 py-3 text-center font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-muted-foreground"
                >
                  No notifications found.
                </td>
              </tr>
            ) : (
              notifications.map((notification) => (
                <tr
                  key={notification.id}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium">
                        {notification.title}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {notification.body}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <Badge variant="secondary">
                      {notification.category}
                    </Badge>
                  </td>

                  <td className="px-4 py-4">
                    {notification.audience.replaceAll("_", " ")}
                  </td>

                  <td className="px-4 py-4">
                    <Badge
                      variant={getPriorityVariant(notification.priority)}
                    >
                      {notification.priority}
                    </Badge>
                  </td>

                  <td className="px-4 py-4">
                    <Badge
                      variant={getStatusVariant(notification.status)}
                    >
                      {notification.status}
                    </Badge>
                  </td>

                  <td className="px-4 py-4">
                    {notification.creator_name ?? "Admin"}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onView(notification)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}