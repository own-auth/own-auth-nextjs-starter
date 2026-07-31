import type { Metadata } from "next";

import { MagicLinkVerifier } from "@/components/magic-link-verifier";

export const metadata: Metadata = {
  title: "Verifying sign-in"
};

type DirectMagicLinkPageProps = Readonly<{
  searchParams: Promise<{ token?: string | string[] }>;
}>;

export default async function DirectMagicLinkPage({
  searchParams
}: DirectMagicLinkPageProps) {
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
