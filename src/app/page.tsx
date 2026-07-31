import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/current-session";

export default async function HomePage() {
  const current = await getCurrentSession();

  redirect(current ? "/account" : "/sign-in");
}
