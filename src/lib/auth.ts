import "server-only";

import {
  createOwnAuth,
  InMemoryAuthStorage,
  OwnAuthManagedEmailProvider,
  type EmailProvider,
  type OwnAuth
} from "own-auth";

import { getServerEnv } from "@/lib/env";
import { getTestEmailProvider } from "@/lib/test-email-provider";

let authInstance: OwnAuth | undefined;
const testAuthKey = Symbol.for("own-auth-nextjs-starter.test-auth");

type TestGlobal = typeof globalThis & {
  [testAuthKey]?: OwnAuth;
};

export function getAuth(): OwnAuth {
  if (authInstance) {
    return authInstance;
  }

  const env = getServerEnv();
  const testGlobal = globalThis as TestGlobal;

  if (env.testMode && testGlobal[testAuthKey]) {
    authInstance = testGlobal[testAuthKey];
    return authInstance;
  }

  // Own Auth's Postgres adapter reads DATABASE_URL. Reading it here first keeps
  // this application's environment contract centralized and validated.
  void env.databaseUrl;

  authInstance = createOwnAuth({
    baseUrl: env.appUrl,
    redirectAllowlist: [env.appUrl],
    tokenPepper: env.tokenPepper,
    emailProvider: env.testMode
      ? getTestEmailProvider()
      : createEmailProvider(env.emailDeliveryKey),
    storage: env.testMode ? new InMemoryAuthStorage() : undefined,
    session: {
      ttlMs: 30 * 24 * 60 * 60 * 1000
    },
    tokenTtlMs: {
      email_verification: 24 * 60 * 60 * 1000,
      magic_link: 15 * 60 * 1000,
      password_reset: 60 * 60 * 1000
    }
  });

  if (env.testMode) {
    testGlobal[testAuthKey] = authInstance;
  }

  return authInstance;
}

function createEmailProvider(deliveryKey: string | undefined): EmailProvider {
  if (deliveryKey) {
    return new OwnAuthManagedEmailProvider({ deliveryKey });
  }

  return {
    async send(): Promise<void> {
      throw new Error(
        "Email delivery is not configured. Set OWN_AUTH_EMAIL_DELIVERY_KEY."
      );
    }
  };
}
