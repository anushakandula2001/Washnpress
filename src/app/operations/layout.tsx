import { RoleGuard } from "@/components/portal/role-guard";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { OperationsShell } from "@/components/operations/OperationsShell";

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["operator", "admin"]}>
      <RealtimeProvider>
        {children}
      </RealtimeProvider>
    </RoleGuard>
  );
}
