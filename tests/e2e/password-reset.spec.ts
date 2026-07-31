import { expect, test } from "@playwright/test";

import {
  changedPassword,
  createUser,
  defaultPassword,
  latestEmail,
  signIn,
  signOut,
  uniqueEmail
} from "../support/auth";

test("password-reset requests do not reveal whether an account exists", async ({
  page,
  request
}) => {
  const knownEmail = uniqueEmail("reset-known");
  await createUser(page, knownEmail);
  await signOut(page);

  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill(knownEmail);
  await page.getByRole("button", { name: "Send reset link" }).click();
  const knownMessage = await page.getByRole("status").textContent();
  expect(knownMessage).toContain(
    "If an account exists for that email, a password reset link is on its way."
  );
  await latestEmail(request, knownEmail, "password_reset");

  await page.getByRole("button", { name: "Try another email" }).click();
  await page.getByLabel("Email address").fill(uniqueEmail("reset-unknown"));
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText(
    "If an account exists for that email, a password reset link is on its way."
  );
});

test("a reset token changes the password, revokes sessions, and cannot be replayed", async ({
  page,
  request
}) => {
  const email = uniqueEmail("reset-lifecycle");
  await createUser(page, email);

  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  const message = await latestEmail(request, email, "password_reset");

  await page.goto(`/auth/reset?token=${message.token}`);
  await expect(page).not.toHaveURL(/token=/u);
  await page.getByLabel("New password", { exact: true }).fill(changedPassword);
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill("does not match");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText("The passwords do not match.");

  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill(changedPassword);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible();

  await page.goto("/account");
  await expect(page).toHaveURL(/\/sign-in$/u);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(defaultPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText("Invalid email or password.");
  await signIn(page, email, changedPassword);
  await signOut(page);

  await page.goto(`/auth/password/reset?token=${message.token}`);
  await page.getByLabel("New password", { exact: true }).fill(defaultPassword);
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill(defaultPassword);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator('p[role="alert"]')).toContainText("already been used");
});

test("reset screen handles missing, expired, and weak-password errors", async ({
  page
}) => {
  await page.goto("/auth/password/reset");
  await expect(page.locator('p[role="alert"]')).toContainText("missing its token");
  await expect(
    page.getByLabel("New password", { exact: true })
  ).toBeDisabled();

  await page.route("**/api/auth/password-reset/confirm", async (route) => {
    const requestBody = route.request().postDataJSON() as { newPassword: string };
    const code =
      requestBody.newPassword === "weak"
        ? "weak_password"
        : "expired_token";
    await route.fulfill({
      body: JSON.stringify({ error: { code, message: code } }),
      contentType: "application/json",
      status: 400
    });
  });

  await page.goto("/auth/password/reset?token=test-token");
  await page.getByLabel("New password", { exact: true }).fill("weak");
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill("weak");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator('p[role="alert"]')).toContainText("stronger");

  await page.getByLabel("New password", { exact: true }).fill(changedPassword);
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill(changedPassword);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator('p[role="alert"]')).toContainText("expired");
});
