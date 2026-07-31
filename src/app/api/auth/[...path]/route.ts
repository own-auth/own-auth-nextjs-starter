import { createOwnAuthHandler } from "own-auth/http";

import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

function handle(request: Request): Promise<Response> {
  const authHandler = createOwnAuthHandler(getAuth());
  return authHandler(request);
}

export const GET = handle;
export const POST = handle;
