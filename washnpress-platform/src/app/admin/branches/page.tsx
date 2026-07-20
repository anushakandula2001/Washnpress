import { redirect } from "next/navigation";

export default function BranchesRedirect() {
  redirect("/admin/societies");
}
