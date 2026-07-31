"use client";

import { OwnAuthClientError } from "own-auth/client";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { PasswordField } from "@/components/password-field";

export function ChangePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");

    if (newPassword !== confirmation) {
      setError("The new passwords do not match.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await authClient.changePassword({ currentPassword, newPassword });
      formElement.reset();
      setMessage("Your password has been updated.");
      router.refresh();
    } catch (caught) {
      if (
        caught instanceof OwnAuthClientError &&
        caught.code === "invalid_credentials"
      ) {
        setError("Your current password is incorrect.");
      } else if (
        caught instanceof OwnAuthClientError &&
        caught.code === "weak_password"
      ) {
        setError("Choose a stronger password.");
      } else {
        setError("We could not update your password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <details className="settings-card">
      <summary className="settings-summary">
        <div>
          <p className="overline">Password</p>
          <h2 id="password-heading">Change password</h2>
        </div>
        <span aria-hidden="true">›</span>
      </summary>
      <form className="settings-form" onSubmit={handleSubmit}>
        <PasswordField
          autoComplete="current-password"
          label="Current password"
          name="currentPassword"
          required
        />
        <PasswordField
          autoComplete="new-password"
          label="New password"
          name="newPassword"
          required
        />
        <PasswordField
          autoComplete="new-password"
          label="Confirm new password"
          name="confirmation"
          required
        />
        {error && (
          <p className="settings-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="settings-success" role="status">
            {message}
          </p>
        )}
        <button className="button button-secondary" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </details>
  );
}
