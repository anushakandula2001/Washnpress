import { RoleGuard } from "@/components/portal/role-guard";
import { ToastProvider } from "@/components/ui/toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["admin"]}>
      <ToastProvider>{children}</ToastProvider>
    </RoleGuard>
  );
}
