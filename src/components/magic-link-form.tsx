"use client";

import { OwnAuthClientError } from "own-auth/client";
import { type FormEvent, type ReactNode, useState } from "react";

import { authClient } from "@/lib/auth-client";

type MagicLinkFormProps = Readonly<{
  isDeliveryConfigured: boolean;
}>;

function MagicLinkHeading() {
  return (
    <div className="auth-heading">
      <p className="eyebrow">Passwordless sign in</p>
      <h1>Email me a secure link</h1>
      <p>
        We will send a single-use link through{" "}
        <a href="https://own-auth.com" rel="noreferrer" target="_blank">
          Own Auth Delivery
        </a>
        . The link expires after 15 minutes.
      </p>
    </div>
  );
}

export function MagicLinkForm({
  isDeliveryConfigured
}: MagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<ReactNode>(null);
  const [isSent, setIsSent] = useState(false);

  if (!isDeliveryConfigured) {
    return (
      <>
        <MagicLinkHeading />
        <div className="configuration-warning" role="status">
          <strong>OWN_AUTH_EMAIL_DELIVERY_KEY is missing from .env.</strong>
          <p>
            Create an Own Auth Delivery key and add it to <code>.env</code> to
            enable magic-link sign in.
          </p>
          <a href="https://own-auth.com" rel="noreferrer" target="_blank">
            Open Own Auth Delivery
          </a>
        </div>
      </>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSent(true);

    try {
      await authClient.requestMagicLink({ email });
    } catch (caught) {
      setIsSent(false);

      if (caught instanceof OwnAuthClientError && caught.code === "rate_limited") {
        setError("Too many requests. Wait a moment before trying again.");
      } else if (
        caught instanceof OwnAuthClientError &&
        caught.code === "internal_error"
      ) {
        setError(
          <>
            Add this app URL to the{" "}
            <a
              href="https://own-auth.com/dashboard/settings"
              rel="noreferrer"
              target="_blank"
            >
              Own Auth Delivery app&apos;s allowed URLs
            </a>
            .
          </>
        );
      } else {
        setError("We could not send the link. Please try again.");
      }
    }
  }

  if (isSent) {
    return (
      <div className="delivery-confirmation" role="status">
        <span className="delivery-icon" aria-hidden="true">
          ✓
        </span>
        <h2>Check your inbox</h2>
        <p>
          If this address can receive a sign-in link, one is on its way. It expires
          in 15 minutes and can only be used once.
        </p>
        <button
          className="text-button"
          onClick={() => {
            setEmail("");
            setIsSent(false);
          }}
          type="button"
        >
          Use another email
        </button>
      </div>
    );
  }

  return (
    <>
      <MagicLinkHeading />
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>Email address</span>
          <input
            autoCapitalize="none"
            autoComplete="email"
            inputMode="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            spellCheck={false}
            type="email"
            value={email}
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="button button-primary form-submit">
          Send magic link
        </button>
      </form>
    </>
  );
}
