import { ResidentAuthGuard } from "@/components/auth/resident-auth-guard";
import { ResidentProvider } from "@/components/resident/resident-provider";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { CatalogProvider } from "./catalog-provider";

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResidentAuthGuard>
      <ResidentProvider>
        <CatalogProvider>
          <RealtimeProvider>
            {children}
          </RealtimeProvider>
        </CatalogProvider>
      </ResidentProvider>
    </ResidentAuthGuard>
  );
}
