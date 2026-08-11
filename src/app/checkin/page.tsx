import { redirect } from "next/navigation";

export default function CheckInRedirectPage() {
  redirect("/v2/checkin");
}
