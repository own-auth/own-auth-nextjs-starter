"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { emailVerificationErrorMessage } from "@/lib/auth-error-messages";

type VerificationState =
  | { status: "pending" }
  | { status: "complete" }
  | { status: "error"; message: string };

export function EmailVerifier({ token }: Readonly<{ token: string | null }>) {
  const started = useRef(false);
  const [state, setState] = useState<VerificationState>(
    token
      ? { status: "pending" }
      : { status: "error", message: "This verification link is missing its token." }
  );

  useEffect(() => {
    if (!token || started.current) {
      return;
    }

    started.current = true;
    window.history.replaceState(null, "", window.location.pathname);

    void authClient
      .verifyEmail({ token })
      .then(() => setState({ status: "complete" }))
      .catch((caught: unknown) => {
        setState({
          status: "error",
          message: emailVerificationErrorMessage(caught)
        });
      });
  }, [token]);

  if (state.status === "pending") {
    return (
      <div className="verification-state" aria-live="polite">
        <span className="verification-spinner" aria-hidden="true" />
        <h1>Verifying your email</h1>
        <p>We are securely checking this one-time link.</p>
      </div>
    );
  }

  if (state.status === "complete") {
    return (
      <div className="verification-state">
        <span className="delivery-icon" aria-hidden="true">
          ✓
        </span>
        <h1>Email verified</h1>
        <p>Your email address has been confirmed.</p>
        <Link className="button button-primary" href="/account">
          Continue to account
        </Link>
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
      <Link className="button button-primary" href="/account">
        Return to account
      </Link>
    </div>
  );
}
