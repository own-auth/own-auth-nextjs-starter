import { expect, test } from "@playwright/test";

import {
  createUser,
  latestEmail,
  signOut,
  uniqueEmail
} from "../support/auth";

test("magic links sign in once and reject replay", async ({ page, request }) => {
  const email = uniqueEmail("magic");
  await createUser(page, email);
  await signOut(page);

  await page.goto("/magic-link");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Send magic link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();

  const message = await latestEmail(request, email, "magic_link");
  await page.goto(`/auth/magic?token=${message.token}`);
  await expect(page).toHaveURL(/\/account$/u);

  await signOut(page);
  await page.goto(`/auth/magic-link/verify?token=${message.token}`);
  await expect(page.locator('p[role="alert"]')).toContainText("already been used");
  await expect(page).not.toHaveURL(/token=/u);
});

test("magic-link verification explains expired links", async ({ page }) => {
  await page.route("**/api/auth/magic-link/verify", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        error: { code: "expired_token", message: "Expired token" }
      }),
      contentType: "application/json",
      status: 400
    });
  });

  await page.goto("/auth/magic-link/verify?token=expired-test-token");
  await expect(page.locator('p[role="alert"]')).toContainText("expired");
});

test("magic-link requests do not reveal an unknown address", async ({ page }) => {
  await page.goto("/magic-link");
  await page.getByLabel("Email address").fill(uniqueEmail("magic-unknown"));
  await page.getByRole("button", { name: "Send magic link" }).click();
  await expect(page.getByRole("status")).toContainText(
    "If this address can receive a sign-in link, one is on its way."
  );
});
