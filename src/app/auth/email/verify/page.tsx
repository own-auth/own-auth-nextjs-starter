import type { Metadata } from "next";

import { EmailVerifier } from "@/components/email-verifier";

export const metadata: Metadata = {
  title: "Verify email"
};

type EmailVerificationPageProps = Readonly<{
  searchParams: Promise<{ token?: string | string[] }>;
}>;

export default async function EmailVerificationPage({
  searchParams
}: EmailVerificationPageProps) {
  const tokenValue = (await searchParams).token;
  const token = typeof tokenValue === "string" ? tokenValue : null;

  return (
    <div className="auth-shell">
      <section className="auth-card verification-card">
        <EmailVerifier token={token} />
      </section>
    </div>
  );
}
