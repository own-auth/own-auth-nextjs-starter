import { expect, test } from "@playwright/test";

import { defaultPassword, latestEmail, uniqueEmail } from "../support/auth";

const origin = "http://localhost:3100";

test("HTTP auth contract creates, reads, and clears a cookie session", async ({
  request
}) => {
  const email = uniqueEmail("api-session");
  const signUp = await request.post("/api/auth/sign-up/email", {
    data: { email, name: "API User", password: defaultPassword },
    headers: { origin }
  });
  expect(signUp.ok()).toBe(true);
  expect(signUp.headers()["set-cookie"]).toContain("HttpOnly");

  const session = await request.get("/api/auth/session");
  expect(session.ok()).toBe(true);
  const sessionBody = (await session.json()) as {
    session: { user: { email: string } } | null;
  };
  expect(sessionBody.session?.user.email).toBe(email);

  const signOut = await request.post("/api/auth/sign-out", {
    headers: { origin }
  });
  expect(signOut.ok()).toBe(true);
  expect(((await request.get("/api/auth/session")).json())).resolves.toEqual({
    session: null
  });
});

test("HTTP contract validates input, credentials, and request origins", async ({
  request
}) => {
  const malformed = await request.post("/api/auth/sign-up/email", {
    data: { email: "not-an-email" },
    headers: { origin }
  });
  expect(malformed.status()).toBe(400);
  await expect(malformed.json()).resolves.toMatchObject({
    error: { code: "validation_error" }
  });

  const credentials = await request.post("/api/auth/sign-in/email", {
    data: { email: uniqueEmail("unknown"), password: defaultPassword },
    headers: { origin }
  });
  expect(credentials.status()).toBe(401);
  await expect(credentials.json()).resolves.toMatchObject({
    error: { code: "invalid_credentials" }
  });

  const crossSite = await request.post("/api/auth/sign-up/email", {
    data: {
      email: uniqueEmail("cross-site"),
      name: "Cross Site",
      password: defaultPassword
    },
    headers: { origin: "https://attacker.example" }
  });
  expect(crossSite.status()).toBe(403);
});

test("HTTP magic-link tokens are delivered, consumed once, and create a session", async ({
  request
}) => {
  const email = uniqueEmail("api-magic");
  expect(
    (
      await request.post("/api/auth/sign-up/email", {
        data: { email, name: "Magic User", password: defaultPassword },
        headers: { origin }
      })
    ).ok()
  ).toBe(true);
  await request.post("/api/auth/sign-out", { headers: { origin } });

  const requested = await request.post("/api/auth/magic-link/request", {
    data: { email },
    headers: { origin }
  });
  expect(requested.ok()).toBe(true);
  const message = await latestEmail(request, email, "magic_link");

  const verified = await request.post("/api/auth/magic-link/verify", {
    data: { token: message.token },
    headers: { origin }
  });
  expect(verified.ok()).toBe(true);
  expect((await request.get("/api/auth/session")).ok()).toBe(true);

  const replay = await request.post("/api/auth/magic-link/verify", {
    data: { token: message.token },
    headers: { origin }
  });
  expect(replay.status()).toBe(401);
  await expect(replay.json()).resolves.toMatchObject({
    error: { code: "token_already_used" }
  });
});

test("password-reset requests have the same public response for known and unknown users", async ({
  request
}) => {
  const knownEmail = uniqueEmail("api-reset-known");
  await request.post("/api/auth/sign-up/email", {
    data: { email: knownEmail, name: "Reset User", password: defaultPassword },
    headers: { origin }
  });

  const known = await request.post("/api/auth/password-reset/request", {
    data: { email: knownEmail },
    headers: { origin }
  });
  const unknown = await request.post("/api/auth/password-reset/request", {
    data: { email: uniqueEmail("api-reset-unknown") },
    headers: { origin }
  });

  expect(known.status()).toBe(unknown.status());
  const knownBody = (await known.json()) as { expiresAt: string; sent: boolean };
  const unknownBody = (await unknown.json()) as {
    expiresAt: string;
    sent: boolean;
  };
  expect(knownBody.sent).toBe(unknownBody.sent);
  expect(typeof knownBody.expiresAt).toBe(typeof unknownBody.expiresAt);
  await latestEmail(request, knownEmail, "password_reset");
});

test("HTTP email-verification tokens update the user and reject replay", async ({
  request
}) => {
  const email = uniqueEmail("api-verification");
  await request.post("/api/auth/sign-up/email", {
    data: { email, name: "Verify User", password: defaultPassword },
    headers: { origin }
  });
  await request.post("/api/auth/email-verification/request", {
    data: { email },
    headers: { origin }
  });
  const message = await latestEmail(request, email, "email_verification");

  const verified = await request.post("/api/auth/email-verification/verify", {
    data: { token: message.token },
    headers: { origin }
  });
  expect(verified.ok()).toBe(true);
  await expect(verified.json()).resolves.toMatchObject({
    user: { email, emailVerifiedAt: expect.any(String) }
  });

  const replay = await request.post("/api/auth/email-verification/verify", {
    data: { token: message.token },
    headers: { origin }
  });
  expect(replay.status()).toBe(401);
  await expect(replay.json()).resolves.toMatchObject({
    error: { code: "token_already_used" }
  });
});

test("HTTP password reset consumes its token, revokes the session, and replaces credentials", async ({
  request
}) => {
  const email = uniqueEmail("api-reset-lifecycle");
  await request.post("/api/auth/sign-up/email", {
    data: { email, name: "Reset User", password: defaultPassword },
    headers: { origin }
  });
  await request.post("/api/auth/password-reset/request", {
    data: { email },
    headers: { origin }
  });
  const message = await latestEmail(request, email, "password_reset");

  const reset = await request.post("/api/auth/password-reset/confirm", {
    data: {
      newPassword: "replacement password suitable for testing",
      token: message.token
    },
    headers: { origin }
  });
  expect(reset.ok()).toBe(true);
  await expect((await request.get("/api/auth/session")).json()).resolves.toEqual({
    session: null
  });

  const oldCredentials = await request.post("/api/auth/sign-in/email", {
    data: { email, password: defaultPassword },
    headers: { origin }
  });
  expect(oldCredentials.status()).toBe(401);

  const newCredentials = await request.post("/api/auth/sign-in/email", {
    data: {
      email,
      password: "replacement password suitable for testing"
    },
    headers: { origin }
  });
  expect(newCredentials.ok()).toBe(true);

  const replay = await request.post("/api/auth/password-reset/confirm", {
    data: { newPassword: defaultPassword, token: message.token },
    headers: { origin }
  });
  expect(replay.status()).toBe(401);
  await expect(replay.json()).resolves.toMatchObject({
    error: { code: "token_already_used" }
  });
});

test("HTTP password change requires the current password and keeps only the current session", async ({
  request
}) => {
  const email = uniqueEmail("api-change-password");
  await request.post("/api/auth/sign-up/email", {
    data: { email, name: "Change User", password: defaultPassword },
    headers: { origin }
  });

  const rejected = await request.post("/api/auth/password/change", {
    data: {
      currentPassword: "incorrect password",
      newPassword: "new API password suitable for testing"
    },
    headers: { origin }
  });
  expect(rejected.status()).toBe(401);
  await expect(rejected.json()).resolves.toMatchObject({
    error: { code: "invalid_credentials" }
  });

  const changed = await request.post("/api/auth/password/change", {
    data: {
      currentPassword: defaultPassword,
      newPassword: "new API password suitable for testing"
    },
    headers: { origin }
  });
  expect(changed.ok()).toBe(true);
  const current = await request.get("/api/auth/session");
  await expect(current.json()).resolves.toMatchObject({
    session: { user: { email } }
  });
});
