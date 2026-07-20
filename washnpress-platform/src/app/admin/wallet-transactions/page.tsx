import { redirect } from "next/navigation";

export default function WalletTransactionsRedirect() {
  redirect("/admin/payments");
}
