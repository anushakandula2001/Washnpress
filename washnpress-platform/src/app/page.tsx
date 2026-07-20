import { redirect } from "next/navigation";

/** Default entry: Admin-oriented login (OTP). Role redirect happens after verify. */
export default function Home() {
  redirect("/login");
}
