import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password"
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <ForgotPasswordForm />
        <p className="form-switch">
          Remembered it? <Link href="/sign-in">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
