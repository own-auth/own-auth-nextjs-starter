import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Create account"
};

export default function SignUpPage() {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-heading">
          <p className="eyebrow">Get started</p>
          <h1>Create your account</h1>
          <p>Your password is hashed by Own Auth before it reaches storage.</p>
        </div>
        <AuthForm mode="sign-up" />
        <p className="form-switch">
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
