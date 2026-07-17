"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PickupDetailsFormProps {
  mobile: string;
  instructions: string;
  onInstructionsChange: (value: string) => void;
  loading: boolean;
  error: string;
  disabled: boolean;
  onConfirm: () => void;
}

export default function PickupDetailsForm({
  mobile,
  instructions,
  onInstructionsChange,
  loading,
  error,
  disabled,
  onConfirm,
}: PickupDetailsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pickup Details</CardTitle>
        <CardDescription>
          Verify your contact details before confirming.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Special Instructions
          </label>

          <Input
            placeholder="e.g. Ring the doorbell twice, leave at security, call before arrival"
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
          />

          <p className="mt-2 text-xs text-muted-foreground">
            These instructions will be visible to the pickup operator.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Contact Number
          </label>

          <Input
            value={mobile}
            readOnly
          />

          <p className="mt-2 text-xs text-muted-foreground">
            We'll use this number to contact you if required.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        <Button
          className="w-full"
          disabled={disabled || loading}
          onClick={onConfirm}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  opacity="0.25"
                />
                <path
                  fill="currentColor"
                  d="M22 12a10 10 0 00-10-10v4a6 6 0 016 6h4z"
                />
              </svg>

              Confirming Pickup...
            </div>
          ) : (
            "Confirm Pickup"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}