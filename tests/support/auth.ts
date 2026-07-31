import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const defaultPassword = "correct horse battery staple";
export const changedPassword = "new correct horse battery staple";

let emailSequence = 0;

export function uniqueEmail(prefix: string): string {
  emailSequence += 1;
  return `${prefix}-${Date.now()}-${emailSequence}@example.com`;
}

export async function createUser(
  page: Page,
  email: string,
  password = defaultPassword
): Promise<void> {
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/account$/u);
}

export async function signIn(
  page: Page,
  email: string,
  password = defaultPassword
): Promise<void> {
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/u);
}

export async function signOut(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/u);
}

type TestEmail = Readonly<{
  expiresAt: string;
  to: string;
  token: string;
  type: "email_verification" | "magic_link" | "password_reset";
  url: string;
}>;

export async function latestEmail(
  request: APIRequestContext,
  email: string,
  type: TestEmail["type"],
  minimumCount = 1
): Promise<TestEmail> {
  let latest: TestEmail | null = null;
  await expect
    .poll(
      async () => {
        const response = await request.get(
          `/api/test/emails?to=${encodeURIComponent(email)}&type=${type}`
        );
        expect(response.ok()).toBe(true);
        const body = (await response.json()) as {
          count: number;
          latest: TestEmail | null;
        };
        latest = body.latest;
        return body.count;
      },
      { message: `wait for ${type} email to ${email}` }
    )
    .toBeGreaterThanOrEqual(minimumCount);

  expect(latest).not.toBeNull();
  return latest as unknown as TestEmail;
}
