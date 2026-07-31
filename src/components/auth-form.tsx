"use client";

import { OwnAuthClientError } from "own-auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { PasswordField } from "@/components/password-field";

type AuthFormProps = Readonly<{
  mode: "sign-in" | "sign-up";
}>;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    try {
      if (isSignUp) {
        const name = String(data.get("name") ?? "").trim();
        await authClient.signUpEmailPassword({
          email,
          password,
          ...(name ? { name } : {})
        });
        void authClient.requestEmailVerification({ email }).catch(() => {
          // The account page provides a resend action when delivery is unavailable.
        });
      } else {
        const result = await authClient.signInEmailPassword({ email, password });

        if (result.status === "mfa_required") {
          setError("This account requires an MFA screen that is not enabled in this starter.");
          return;
        }
      }

      router.push("/account");
      router.refresh();
    } catch (caught) {
      if (caught instanceof OwnAuthClientError) {
        if (caught.code === "email_already_exists") {
          setError("An account with this email already exists.");
        } else if (caught.code === "weak_password") {
          setError("Choose a stronger password.");
        } else if (caught.code === "invalid_credentials") {
          setError("Invalid email or password.");
        } else {
          setError("We could not complete that request. Check your details and try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isSignUp && (
        <label>
          <span>Name</span>
          <input
            autoComplete="name"
            name="name"
            placeholder="Ada Lovelace"
            type="text"
          />
        </label>
      )}
      <label>
        <span>Email address</span>
        <input
          autoCapitalize="none"
          autoComplete="email"
          inputMode="email"
          name="email"
          placeholder="you@example.com"
          required
          spellCheck={false}
          type="email"
        />
      </label>
      <PasswordField
        autoComplete={isSignUp ? "new-password" : "current-password"}
        label="Password"
        name="password"
        required
      />
      {!isSignUp && (
        <Link className="form-help" href="/forgot-password">
          Forgot password?
        </Link>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button className="button button-primary form-submit" disabled={isSubmitting}>
        {isSubmitting
          ? isSignUp
            ? "Creating account…"
            : "Signing in…"
          : isSignUp
            ? "Create account"
            : "Sign in"}
      </button>
    </form>
  );
}
