import { RoleGuard } from "@/components/portal/role-guard";

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow={["operator", "admin"]}>{children}</RoleGuard>;
}
