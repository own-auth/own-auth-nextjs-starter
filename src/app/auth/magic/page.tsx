import type { Metadata } from "next";

import { MagicLinkVerifier } from "@/components/magic-link-verifier";

export const metadata: Metadata = {
  title: "Verifying sign-in"
};

type HostedMagicLinkPageProps = Readonly<{
  searchParams: Promise<{ token?: string | string[] }>;
}>;

export default async function HostedMagicLinkPage({
  searchParams
}: HostedMagicLinkPageProps) {
  const tokenValue = (await searchParams).token;
  const token = typeof tokenValue === "string" ? tokenValue : null;

  return (
    <div className="auth-shell">
      <section className="auth-card verification-card">
        <MagicLinkVerifier token={token} />
      </section>
    </div>
  );
}
