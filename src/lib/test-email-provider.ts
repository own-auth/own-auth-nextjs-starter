import "server-only";

import type { EmailMessage, EmailProvider } from "own-auth";

const inboxKey = Symbol.for("own-auth-nextjs-starter.test-inbox");

type TestGlobal = typeof globalThis & {
  [inboxKey]?: EmailMessage[];
};

function getInbox(): EmailMessage[] {
  const testGlobal = globalThis as TestGlobal;
  testGlobal[inboxKey] ??= [];
  return testGlobal[inboxKey];
}

export function getTestEmailProvider(): EmailProvider {
  return {
    async send(message): Promise<void> {
      getInbox().push({ ...message });
    }
  };
}

export function listTestEmails(): readonly EmailMessage[] {
  return getInbox();
}
