import { expect, test } from "@playwright/test";

import {
  createUser,
  defaultPassword,
  signIn,
  signOut,
  uniqueEmail
} from "../support/auth";

test("sign-up, duplicate handling, sign-in, sign-out, and route protection", async ({
  page
}) => {
  const email = uniqueEmail("password-auth");
  await createUser(page, email);
  await expect(page.getByRole("heading", { name: "Account details" })).toBeVisible();

  await signOut(page);
  await page.goto("/sign-up");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(defaultPassword);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText(
    "An account with this email already exists."
  );

  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("wrong password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText("Invalid email or password.");

  await signIn(page, email);
  await signOut(page);
  await page.goto("/account");
  await expect(page).toHaveURL(/\/sign-in$/u);
});

test("auth forms expose password-manager metadata and keyboard password reveal", async ({
  page
}) => {
  await page.goto("/sign-in");
  const email = page.getByLabel("Email address");
  const password = page.getByLabel("Password", { exact: true });

  await expect(email).toHaveAttribute("autocomplete", "email");
  await expect(password).toHaveAttribute("autocomplete", "current-password");
  await expect(password).toHaveAttribute("type", "password");
  await expect(password).not.toHaveAttribute("minlength");

  await password.focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Show password" })
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(password).toHaveAttribute("type", "text");
});

test("sign-in remains usable on a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
  const widths = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    viewport: window.innerWidth
  }));
  expect(widths.body).toBeLessThanOrEqual(widths.viewport);
});
