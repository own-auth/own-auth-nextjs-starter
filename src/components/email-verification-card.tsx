"use client";

import { OwnAuthClientError } from "own-auth/client";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function EmailVerificationCard({
  email,
  isVerified
}: Readonly<{ email: string; isVerified: boolean }>) {
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function sendVerification() {
    setError(null);
    setIsSending(true);

    try {
      await authClient.requestEmailVerification({ email });
      setIsSent(true);
    } catch (caught) {
      if (
        caught instanceof OwnAuthClientError &&
        caught.code === "rate_limited"
      ) {
        setError("Too many requests. Wait a moment before trying again.");
      } else {
        setError("We could not send the verification email. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="settings-card" aria-labelledby="verification-heading">
      <div className="settings-row">
        <div>
          <p className="overline">Email</p>
          <h2 id="verification-heading">
            {isVerified ? "Email verified" : "Verify your email"}
          </h2>
          <p>
            {isVerified
              ? email
              : isSent
                ? `A verification link was sent to ${email}.`
                : `Confirm that ${email} belongs to you.`}
          </p>
        </div>
        {isVerified ? (
          <span className="verified-badge">
            <span aria-hidden="true">✓</span> Verified
          </span>
        ) : (
          <button
            className="button button-secondary button-small"
            disabled={isSending}
            onClick={sendVerification}
            type="button"
          >
            {isSending
              ? "Sending…"
              : isSent
                ? "Resend email"
                : "Send email"}
          </button>
        )}
      </div>
      {error && (
        <p className="settings-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
