"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuth } from "@/lib/auth";
import { getSessionToken } from "@/lib/current-session";

export async function revokeSessionAction(sessionId: string): Promise<void> {
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    redirect("/sign-in");
  }

  await getAuth().revokeSession({ sessionId, sessionToken });
  revalidatePath("/account");
}
