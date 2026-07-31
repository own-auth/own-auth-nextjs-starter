"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { magicLinkErrorMessage } from "@/lib/auth-error-messages";

type VerificationState =
  | { status: "pending" }
  | { status: "error"; message: string };

export function MagicLinkVerifier({ token }: Readonly<{ token: string | null }>) {
  const router = useRouter();
  const started = useRef(false);
  const [state, setState] = useState<VerificationState>(
    token
      ? { status: "pending" }
      : { status: "error", message: "This sign-in link is missing its token." }
  );

  useEffect(() => {
    if (!token || started.current) {
      return;
    }

    started.current = true;
    window.history.replaceState(null, "", window.location.pathname);

    void authClient
      .verifyMagicLink({ token })
      .then((result) => {
        if (result.status === "mfa_required") {
          setState({
            status: "error",
            message: "This account requires an MFA screen that is not enabled in this starter."
          });
          return;
        }

        router.replace("/account");
        router.refresh();
      })
      .catch((caught: unknown) => {
        setState({ status: "error", message: magicLinkErrorMessage(caught) });
      });
  }, [router, token]);

  if (state.status === "pending") {
    return (
      <div className="verification-state" aria-live="polite">
        <span className="verification-spinner" aria-hidden="true" />
        <h1>Signing you in</h1>
        <p>We are securely verifying this one-time link.</p>
      </div>
    );
  }

  return (
    <div className="verification-state">
      <span className="verification-error-icon" aria-hidden="true">
        !
      </span>
      <h1>Link not accepted</h1>
      <p role="alert">{state.message}</p>
      <Link className="button button-primary" href="/magic-link">
        Request a new link
      </Link>
    </div>
  );
}
