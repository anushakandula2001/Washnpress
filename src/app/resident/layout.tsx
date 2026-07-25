import { ResidentAuthGuard } from "@/components/auth/resident-auth-guard";
import { ResidentProvider } from "@/components/resident/resident-provider";

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResidentAuthGuard>
      <ResidentProvider>{children}</ResidentProvider>
    </ResidentAuthGuard>
  );
}
