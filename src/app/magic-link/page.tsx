import type { Metadata } from "next";
import Link from "next/link";

import { MagicLinkForm } from "@/components/magic-link-form";
import { getServerEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Email sign-in link"
};

export default function MagicLinkPage() {
  const env = getServerEnv();
  const isDeliveryConfigured = Boolean(env.emailDeliveryKey) || env.testMode;

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <MagicLinkForm isDeliveryConfigured={isDeliveryConfigured} />
        <p className="form-switch">
          Prefer a password? <Link href="/sign-in">Sign in normally</Link>
        </p>
      </section>
    </div>
  );
}
