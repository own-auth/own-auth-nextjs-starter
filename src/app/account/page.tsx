import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/change-password-form";
import { EmailVerificationCard } from "@/components/email-verification-card";
import {
  type AccountSession,
  SessionManager
} from "@/components/session-manager";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuth } from "@/lib/auth";
import { getCurrentSession } from "@/lib/current-session";
import { formatSessionLabel } from "@/lib/session-display";

export const metadata: Metadata = {
  title: "Account"
};

export default async function AccountPage() {
  const current = await getCurrentSession();

  if (!current) {
    redirect("/sign-in");
  }

  const { session, user } = current;
  const now = new Date();
  const sessions: AccountSession[] = (await getAuth().listSessions({
    actorUserId: user.id
  }))
    .filter(
      (candidate) =>
        !candidate.revokedAt &&
        candidate.expiresAt > now &&
        candidate.idleExpiresAt > now
    )
    .map((candidate) => ({
      id: candidate.id,
      isCurrent: candidate.id === session.id,
      label: formatSessionLabel(candidate.userAgent),
      lastActiveAt: candidate.lastActiveAt.toISOString()
    }))
    .sort((left, right) => Number(right.isCurrent) - Number(left.isCurrent));

  return (
    <div className="shell account-layout">
      <header className="account-heading">
        <p className="eyebrow">Account</p>
        <h1>{user.name ? `Welcome, ${user.name}` : "Your account"}</h1>
        <p>Your sign-in session is active.</p>
      </header>

      <section className="account-card" aria-labelledby="account-details">
        <div className="card-header">
          <h2 id="account-details">Account details</h2>
          <span className="verified-badge">
            <span aria-hidden="true">✓</span> Active
          </span>
        </div>
        <dl className="detail-list">
          <div>
            <dt>Email</dt>
            <dd>{user.email ?? "Not set"}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd className="mono">{user.id}</dd>
          </div>
          <div>
            <dt>Session expires</dt>
            <dd>{new Date(session.expiresAt).toLocaleString("en-GB")}</dd>
          </div>
        </dl>
        <div className="card-footer">
          <p>Sign out of this device.</p>
          <SignOutButton />
        </div>
      </section>

      {user.email && (
        <EmailVerificationCard
          email={user.email}
          isVerified={Boolean(user.emailVerifiedAt)}
        />
      )}
      <SessionManager sessions={sessions} />
      <ChangePasswordForm />
    </div>
  );
}
