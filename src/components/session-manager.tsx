"use client";

import { useState, useTransition } from "react";

import { revokeSessionAction } from "@/app/account/actions";
import { formatLastActive } from "@/lib/session-display";

export type AccountSession = Readonly<{
  id: string;
  isCurrent: boolean;
  lastActiveAt: string;
  label: string;
}>;

export function SessionManager({
  sessions
}: Readonly<{ sessions: AccountSession[] }>) {
  const [sessionToRevoke, setSessionToRevoke] = useState<AccountSession | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function revokeSelectedSession() {
    if (!sessionToRevoke) {
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await revokeSessionAction(sessionToRevoke.id);
        setSessionToRevoke(null);
      } catch {
        setError("We could not revoke that session. Please try again.");
      }
    });
  }

  return (
    <section className="settings-card" aria-labelledby="sessions-heading">
      <div className="settings-card-header">
        <div>
          <p className="overline">Security</p>
          <h2 id="sessions-heading">Active sessions</h2>
        </div>
      </div>

      <ul className="settings-list">
        {sessions.map((session) => (
          <li key={session.id}>
            <div>
              <strong>{session.label}</strong>
              <span>
                {session.isCurrent
                  ? "This device"
                  : `Active ${formatLastActive(session.lastActiveAt)}`}
              </span>
            </div>
            {session.isCurrent ? (
              <span className="current-label">Current</span>
            ) : (
              <button
                className="text-button danger-button"
                onClick={() => setSessionToRevoke(session)}
                type="button"
              >
                Revoke
              </button>
            )}
          </li>
        ))}
      </ul>

      {error && (
        <p className="settings-error" role="alert">
          {error}
        </p>
      )}

      {sessionToRevoke && (
        <div className="modal-backdrop" role="presentation">
          <div
            aria-labelledby="revoke-session-title"
            aria-modal="true"
            className="confirmation-dialog"
            role="dialog"
          >
            <h2 id="revoke-session-title">Revoke this session?</h2>
            <p>
              {sessionToRevoke.label} will need to sign in again.
            </p>
            <div className="dialog-actions">
              <button
                className="button button-secondary"
                disabled={isPending}
                onClick={() => setSessionToRevoke(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="button button-danger"
                disabled={isPending}
                onClick={revokeSelectedSession}
                type="button"
              >
                {isPending ? "Revoking…" : "Revoke session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
