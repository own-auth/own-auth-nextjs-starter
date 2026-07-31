import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password"
};

type PasswordResetPageProps = Readonly<{
  searchParams: Promise<{ token?: string | string[] }>;
}>;

export default async function PasswordResetPage({
  searchParams
}: PasswordResetPageProps) {
  const tokenValue = (await searchParams).token;
  const token = typeof tokenValue === "string" ? tokenValue : null;

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <ResetPasswordForm token={token} />
      </section>
    </div>
  );
}
