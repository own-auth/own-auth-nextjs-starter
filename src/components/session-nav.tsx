"use client";

import Link from "next/link";

import { authClient } from "@/lib/auth-client";

export function SessionNav() {
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="nav-skeleton" aria-label="Loading account navigation" />;
  }

  return (
    <nav aria-label="Account">
      {data ? (
        <Link className="nav-link" href="/account">
          Account
        </Link>
      ) : (
        <div className="nav-actions">
          <Link className="nav-link" href="/sign-in">
            Sign in
          </Link>
          <Link className="button button-small button-primary" href="/sign-up">
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}
