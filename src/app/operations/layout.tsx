import { RoleGuard } from "@/components/portal/role-guard";
import { Sidebar } from "@/components/operations/Sidebar";
import { TopHeader } from "@/components/operations/TopHeader";

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["operator", "admin"]}>
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
