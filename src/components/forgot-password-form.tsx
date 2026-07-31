"use client";

import { type FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await authClient.requestPasswordReset({ email });
    } catch {
      // Keep the response identical so this screen never reveals account existence.
    } finally {
      setIsSent(true);
      setIsSubmitting(false);
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
          If an account exists for that email, a password reset link is on its
          way.
        </p>
        <button
          className="text-button"
          onClick={() => setIsSent(false)}
          type="button"
        >
          Try another email
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="auth-heading">
        <p className="eyebrow">Account recovery</p>
        <h1>Reset your password</h1>
        <p>Enter your email and we will send you a secure reset link.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>Email address</span>
          <input
            autoCapitalize="none"
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            spellCheck={false}
            type="email"
            value={email}
          />
        </label>
        <button
          className="button button-primary form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </>
  );
}
