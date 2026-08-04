import { RoleGuard } from "@/components/portal/role-guard";
import { ToastProvider } from "@/components/ui/toast";
import { RealtimeProvider } from "@/components/providers/realtime-provider";

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["resident"]}>
      <RealtimeProvider>
        <ToastProvider>{children}</ToastProvider>
      </RealtimeProvider>
    </RoleGuard>
  );
}
