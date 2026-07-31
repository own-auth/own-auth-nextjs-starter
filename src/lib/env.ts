import "server-only";

type ServerEnv = Readonly<{
  appUrl: string;
  databaseUrl: string;
  emailDeliveryKey?: string;
  testMode: boolean;
  tokenPepper: string;
}>;

let cachedEnv: ServerEnv | undefined;

type ServerEnvName =
  | "DATABASE_URL"
  | "OWN_AUTH_APP_URL"
  | "OWN_AUTH_TOKEN_PEPPER";

function requireValue(name: ServerEnvName): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and provide a server-only value.`
    );
  }

  return value;
}

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const databaseUrl = requireValue("DATABASE_URL");
  const appUrl = requireValue("OWN_AUTH_APP_URL");

  if (!/^postgres(ql)?:\/\//u.test(databaseUrl)) {
    throw new Error("DATABASE_URL must use a postgres:// or postgresql:// URL.");
  }

  const parsedAppUrl = new URL(appUrl);
  const testMode =
    process.env.NODE_ENV !== "production" &&
    process.env.OWN_AUTH_TEST_MODE === "1";

  if (
    parsedAppUrl.username ||
    parsedAppUrl.password ||
    parsedAppUrl.pathname !== "/" ||
    parsedAppUrl.search ||
    parsedAppUrl.hash ||
    (parsedAppUrl.protocol !== "https:" &&
      !(
        parsedAppUrl.protocol === "http:" &&
        ["localhost", "127.0.0.1", "::1"].includes(parsedAppUrl.hostname)
      ))
  ) {
    throw new Error(
      "OWN_AUTH_APP_URL must be an HTTPS origin or a local HTTP development origin."
    );
  }

  cachedEnv = Object.freeze({
    appUrl: parsedAppUrl.origin,
    databaseUrl,
    emailDeliveryKey: process.env.OWN_AUTH_EMAIL_DELIVERY_KEY?.trim() || undefined,
    testMode,
    tokenPepper: requireValue("OWN_AUTH_TOKEN_PEPPER")
  });

  return cachedEnv;
}
