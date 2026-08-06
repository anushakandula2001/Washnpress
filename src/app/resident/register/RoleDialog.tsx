"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { type AuthUser } from "@/frontend/api-client";

interface RoleDialogProps {
  open: boolean;
  existingUser: AuthUser | null;
  onCancel: () => void;
  onSignOutAndContinue: () => void;
}

export default function RoleDialog({ open, existingUser, onCancel, onSignOutAndContinue }: RoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-white border-[#D7F5F4] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#163A4A]">Resident Registration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-[#6A7B88] text-sm">
            The "Create Account" page is only for Resident accounts.
          </p>
          <div className="bg-[#F2FFFE] border border-[#D7F5F4] rounded-xl p-4">
            <p className="text-sm font-semibold text-[#163A4A]">You are currently signed in as:</p>
            <p className="text-[#14C8C4] font-bold mt-1 uppercase text-sm">
              Role: {existingUser?.roles.includes("admin") ? "Admin" : existingUser?.roles.includes("operator") ? "Operator" : "Unknown"}
            </p>
          </div>
          <p className="text-[#6A7B88] text-sm font-medium">
            To create a Resident account, you must first sign out.
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-2 sm:space-x-0">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-[#D7F5F4] text-[#163A4A] bg-white rounded-xl font-semibold hover:bg-[#F2FFFE] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSignOutAndContinue}
            className="flex-1 px-4 py-3 bg-[#14C8C4] text-white rounded-xl font-bold hover:bg-[#0FA8A4] transition-colors shadow-sm"
          >
            Sign Out & Continue
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
