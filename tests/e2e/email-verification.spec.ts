import { expect, test } from "@playwright/test";

import { createUser, latestEmail, uniqueEmail } from "../support/auth";

test("email verification supports send, resend, completion, and replay protection", async ({
  page,
  request
}) => {
  const email = uniqueEmail("verification");
  await createUser(page, email);
  await latestEmail(request, email, "email_verification");

  await page.getByRole("button", { name: "Send email" }).click();
  await expect(page.getByRole("button", { name: "Resend email" })).toBeVisible();
  const second = await latestEmail(request, email, "email_verification", 2);

  await page.getByRole("button", { name: "Resend email" }).click();
  await latestEmail(request, email, "email_verification", 3);

  await page.goto(`/auth/verify?token=${second.token}`);
  await expect(page).not.toHaveURL(/token=/u);
  await expect(page.getByRole("heading", { name: "Email verified" })).toBeVisible();
  await page.getByRole("link", { name: "Continue to account" }).click();
  await expect(
    page.locator(".verified-badge").filter({ hasText: "Verified" })
  ).toBeVisible();

  await page.goto(`/auth/email/verify?token=${second.token}`);
  await expect(page.locator('p[role="alert"]')).toContainText("already been used");
});

test("verification explains missing and expired tokens", async ({ page }) => {
  await page.goto("/auth/email/verify");
  await expect(page.locator('p[role="alert"]')).toContainText("missing its token");

  await page.route("**/api/auth/email-verification/verify", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        error: { code: "expired_token", message: "Expired token" }
      }),
      contentType: "application/json",
      status: 400
    });
  });
  await page.goto("/auth/email/verify?token=expired-test-token");
  await expect(page.locator('p[role="alert"]')).toContainText("expired");
});
