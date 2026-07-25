import { redirect } from "next/navigation";

export default function Page() {
  redirect("/operations/processing-center?stage=washing");
}
