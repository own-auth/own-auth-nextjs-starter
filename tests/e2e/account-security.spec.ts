import { expect, test } from "@playwright/test";

import {
  changedPassword,
  createUser,
  defaultPassword,
  signIn,
  signOut,
  uniqueEmail
} from "../support/auth";

test("password changes validate input, update credentials, and revoke other sessions", async ({
  browser,
  page
}) => {
  const email = uniqueEmail("change-password");
  await createUser(page, email);

  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await signIn(otherPage, email);

  await page.reload();
  await page.getByText("Change password", { exact: true }).click();
  await page
    .getByLabel("Current password", { exact: true })
    .fill(defaultPassword);
  await page.getByLabel("New password", { exact: true }).fill(changedPassword);
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill("different password");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText(
    "The new passwords do not match."
  );

  await page
    .getByLabel("Current password", { exact: true })
    .fill("incorrect password");
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill(changedPassword);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText(
    "Your current password is incorrect."
  );

  await page
    .getByLabel("Current password", { exact: true })
    .fill(defaultPassword);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Your password has been updated."
  );

  await otherPage.goto("/account");
  await expect(otherPage).toHaveURL(/\/sign-in$/u);

  await signOut(page);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(defaultPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText("Invalid email or password.");
  await signIn(page, email, changedPassword);
  await otherContext.close();
});

test("session management confirms revocation and invalidates the selected device", async ({
  browser,
  page
}) => {
  const email = uniqueEmail("sessions");
  await createUser(page, email);
  await expect(page.getByText("Assurance", { exact: true })).toHaveCount(0);

  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await signIn(otherPage, email);
  await page.reload();

  await expect(page.getByRole("button", { name: "Revoke" })).toHaveCount(1);
  await page.getByRole("button", { name: "Revoke" }).click();
  const dialog = page.getByRole("dialog", { name: "Revoke this session?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).not.toBeVisible();

  await page.getByRole("button", { name: "Revoke" }).click();
  await dialog.getByRole("button", { name: "Revoke session" }).click();
  await expect(page.getByRole("button", { name: "Revoke" })).toHaveCount(0);

  await otherPage.goto("/account");
  await expect(otherPage).toHaveURL(/\/sign-in$/u);
  await otherContext.close();
});

test("all account password fields can be revealed independently", async ({
  page
}) => {
  await createUser(page, uniqueEmail("account-password-controls"));
  await page.getByText("Change password", { exact: true }).click();

  for (const label of [
    "Current password",
    "New password",
    "Confirm new password"
  ]) {
    const input = page.getByLabel(label, { exact: true });
    await expect(input).toHaveAttribute("type", "password");
    await page
      .getByRole("button", { name: `Show ${label.toLowerCase()}` })
      .click();
    await expect(input).toHaveAttribute("type", "text");
  }
});
