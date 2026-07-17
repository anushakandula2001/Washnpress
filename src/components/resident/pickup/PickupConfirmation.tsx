"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  formatPickupDisplay,
  ResidentPickup,
} from "@/lib/resident-data";

interface PickupConfirmationProps {
  pickup: ResidentPickup;
  mobile: string;
  instructions: string;
  onScheduleAnother: () => void;
}

export default function PickupConfirmation({
  pickup,
  mobile,
  instructions,
  onScheduleAnother,
}: PickupConfirmationProps) {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-10 w-10 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <CardTitle className="text-2xl">
          Pickup Scheduled Successfully
        </CardTitle>

        <p className="text-muted-foreground">
          Your pickup request has been created.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg border p-5">
          <h3 className="mb-4 font-semibold">
            Pickup Details
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Booking ID
              </span>

              <span className="font-medium">
                {pickup.id}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Schedule
              </span>

              <span className="font-medium text-right">
                {formatPickupDisplay(pickup)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Status
              </span>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                Scheduled
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Contact
              </span>

              <span className="font-medium">
                {mobile}
              </span>
            </div>

            <div>
              <p className="mb-2 text-muted-foreground">
                Special Instructions
              </p>

              <div className="rounded-md bg-muted p-3 text-sm">
                {instructions.trim()
                  ? instructions
                  : "No special instructions provided."}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-700">
            What's Next?
          </h4>

          <ul className="mt-2 space-y-2 text-sm text-blue-700">
            <li>• Your pickup request has been received.</li>
            <li>• An operator will be assigned.</li>
            <li>• You'll receive updates as the pickup progresses.</li>
          </ul>
        </div>

        <Button
          className="w-full"
          onClick={onScheduleAnother}
        >
          Schedule Another Pickup
        </Button>
      </CardContent>
    </Card>
  );
}