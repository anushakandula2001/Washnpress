import { redirect } from "next/navigation";

export default function ExecutivesRedirect() {
  redirect("/admin/operators");
}
