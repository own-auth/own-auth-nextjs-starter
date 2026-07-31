import { NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { listTestEmails } from "@/lib/test-email-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request): Response {
  if (!getServerEnv().testMode) {
    return new Response(null, { status: 404 });
  }

  const url = new URL(request.url);
  const recipient = url.searchParams.get("to")?.toLowerCase();
  const type = url.searchParams.get("type");
  const matching = listTestEmails().filter(
    (message) =>
      (!recipient || message.to.toLowerCase() === recipient) &&
      (!type || message.type === type)
  );
  const latest = matching.at(-1);

  return NextResponse.json({
    count: matching.length,
    latest: latest
      ? {
          expiresAt: latest.expiresAt.toISOString(),
          to: latest.to,
          token: latest.token,
          type: latest.type,
          url: latest.url
        }
      : null
  });
}
