import "server-only";

import { cookies } from "next/headers";

import { getAuth } from "@/lib/auth";

const SESSION_COOKIE_NAME = "own_auth_session";

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentSession() {
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    return null;
  }

  return getAuth().getCurrentSession(sessionToken);
}
