import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in"
};

export default function SignInPage() {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-heading">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to your account</h1>
          <p>Use the email and password associated with your account.</p>
        </div>
        <AuthForm mode="sign-in" />
        <div className="auth-alternative">
          <span>or</span>
        </div>
        <Link className="button button-secondary magic-link-option" href="/magic-link">
          Sign in with magic link
        </Link>
        <p className="form-switch">
          New here? <Link href="/sign-up">Create an account</Link>
        </p>
      </section>
    </div>
  );
}
