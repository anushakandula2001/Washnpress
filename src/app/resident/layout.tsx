import { ResidentProvider } from "@/components/resident/resident-provider";

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return <ResidentProvider>{children}</ResidentProvider>;
}
