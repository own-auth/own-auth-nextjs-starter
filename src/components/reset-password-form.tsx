"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { passwordResetErrorMessage } from "@/lib/auth-error-messages";
import { PasswordField } from "@/components/password-field";

export function ResetPasswordForm({
  token
}: Readonly<{ token: string | null }>) {
  const [error, setError] = useState<string | null>(
    token ? null : "This password reset link is missing its token."
  );
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");

    if (newPassword !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await authClient.resetPassword({ newPassword, token });
      setIsComplete(true);
    } catch (caught) {
      setError(passwordResetErrorMessage(caught));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <div className="verification-state">
        <span className="delivery-icon" aria-hidden="true">
          ✓
        </span>
        <h1>Password updated</h1>
        <p>Sign in again with your new password.</p>
        <Link className="button button-primary" href="/sign-in">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="auth-heading">
        <p className="eyebrow">Account recovery</p>
        <h1>Choose a new password</h1>
        <p>Your existing sessions will be signed out after the reset.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <PasswordField
          autoComplete="new-password"
          disabled={!token}
          label="New password"
          name="newPassword"
          required
        />
        <PasswordField
          autoComplete="new-password"
          disabled={!token}
          label="Confirm new password"
          name="confirmation"
          required
        />
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="button button-primary form-submit"
          disabled={!token || isSubmitting}
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </>
  );
}
