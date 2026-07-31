import { expect, test } from "@playwright/test";

import { defaultPassword, uniqueEmail } from "../support/auth";

test("magic-link submission moves optimistically to the inbox state", async ({
  page
}) => {
  await page.route("**/api/auth/magic-link/request", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      body: JSON.stringify({
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        sent: true
      }),
      contentType: "application/json",
      status: 200
    });
  });
  await page.goto("/magic-link");
  await page.getByLabel("Email address").fill(uniqueEmail("optimistic"));
  await page.getByRole("button", { name: "Send magic link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
});

test("primary auth actions expose disabled, state-specific loading controls", async ({
  page
}) => {
  await page.route("**/api/auth/sign-in/email", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      body: JSON.stringify({
        error: { code: "invalid_credentials", message: "Invalid credentials" }
      }),
      contentType: "application/json",
      status: 401
    });
  });
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(uniqueEmail("loading"));
  await page.getByLabel("Password", { exact: true }).fill(defaultPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  const loadingButton = page.getByRole("button", { name: "Signing in…" });
  await expect(loadingButton).toBeDisabled();
  await expect(page.locator('p[role="alert"]')).toHaveText("Invalid email or password.");
});

test("reset and change-password forms use new/current password autocomplete values", async ({
  page
}) => {
  await page.goto("/auth/password/reset?token=metadata-token");
  for (const label of ["New password", "Confirm new password"]) {
    const field = page.getByLabel(label, { exact: true });
    await expect(field).toHaveAttribute("autocomplete", "new-password");
    await expect(field).toHaveAttribute("type", "password");
    await page
      .getByRole("button", { name: `Show ${label.toLowerCase()}` })
      .click();
    await expect(field).toHaveAttribute("type", "text");
  }
});
