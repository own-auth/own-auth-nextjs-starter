# Own Auth + Next.js starter

A small, production-minded starting point for using
[Own Auth](https://own-auth.com) with the Next.js App Router.

The starter includes:

- email and password sign-up and sign-in
- forgot-password and single-use password-reset flows
- authenticated password changes
- passwordless magic-link sign-in
- email verification with resend support
- active-session listing and session revocation
- managed email delivery through Own Auth Delivery
- Own Auth hosted-link support for web or app destinations
- an `HttpOnly` cookie session managed by Own Auth
- a protected account page validated on the server
- a thin App Router route that delegates to the framework-neutral handler
- centralized, server-only environment validation
- accessible forms with password-manager and autofill support

## Requirements

- Node.js 20.9 or later
- a Postgres database

## Start locally

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Generate a token pepper and put it in `.env`:

```bash
openssl rand -base64 32
```

Set `DATABASE_URL` to a Postgres database you control. Set
`OWN_AUTH_APP_URL` to this application's public origin and add the server-only
delivery key created in the Own Auth dashboard as
`OWN_AUTH_EMAIL_DELIVERY_KEY`.

Then create the Own Auth tables:

```bash
npm run auth:migrate
npm run auth:status
```

Start Next.js:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configure managed delivery and hosted links

In the Own Auth dashboard:

1. Create or select a Delivery app.
2. Create a delivery key and save it as `OWN_AUTH_EMAIL_DELIVERY_KEY`.
3. Under **Link mode**, select **Own Auth hosted**.
4. Set **Destination URL** to `http://localhost:3000/auth` for local
   development, or `https://your-app.example.com/auth` in production.
5. Add the application origin to the Delivery app's allowed URLs.

Delivery converts a generated application link into an Own Auth hosted link.
For magic-link sign-in, its hosted page forwards the browser to:

```text
https://your-app.example.com/auth/magic?token=one-time-token
```

The hosted page is only a bridge. It does not verify the token, access users, or
create sessions. This starter sends the token to its own `/api/auth` handler,
where Own Auth consumes it and creates the `HttpOnly` session.

The starter also handles Own Auth's direct web link at
`/auth/magic-link/verify`. This means switching the Delivery app between
**Own Auth hosted** and **My URLs** does not require an application code change.

Email verification and password reset support both delivery modes as well:

- direct links use `/auth/email/verify` and `/auth/password/reset`
- hosted links continue through `/auth/verify` and `/auth/reset`

## How the integration is layered

```text
Next.js route
  -> Own Auth Web handler
  -> Own Auth service
  -> Own Auth repository
  -> Postgres
```

`src/app/api/auth/[...path]/route.ts` is deliberately thin. It passes the
standard Web `Request` to Own Auth and returns its `Response`. Password
hashing, session creation, cookie security, CSRF checks, and database access
stay in Own Auth.

The browser client never receives the raw session token. Own Auth stores it in
an `HttpOnly` cookie. Server components read and verify that cookie through
`src/lib/current-session.ts` before rendering protected content.

## Important production notes

- Never expose `DATABASE_URL` or `OWN_AUTH_TOKEN_PEPPER` through a
  `NEXT_PUBLIC_` variable.
- Never expose `OWN_AUTH_EMAIL_DELIVERY_KEY` or log complete email links.
- Run migrations as a release step, not during application startup.
- Use HTTPS in production. Own Auth adds the `Secure` cookie attribute over
  HTTPS.
- Resolve client IP addresses only through infrastructure you trust. Do not
  pass arbitrary forwarding headers to the auth handler.
- Add optional OAuth, email, SMS, and other providers through Own Auth provider
  interfaces rather than calling vendors from route handlers.

## Useful paths

- `/` sends signed-out users to `/sign-in` and signed-in users to `/account`.
- `/sign-up` creates an account and a session.
- `/sign-in` starts a session for an existing account.
- `/forgot-password` requests a non-enumerating password-reset email.
- `/magic-link` requests a generic, non-enumerating email sign-in response.
- `/auth/magic` receives Own Auth hosted-link redirects.
- `/auth/magic-link/verify` receives direct application-owned email links.
- `/auth/verify` and `/auth/email/verify` verify email ownership.
- `/auth/reset` and `/auth/password/reset` set a new password.
- `/account` is server-protected and redirects anonymous requests.
- `/api/auth/*` exposes the Own Auth HTTP contract.

See the [Own Auth documentation](https://own-auth.com/docs) for migrations,
providers, organizations, MFA, and deployment guidance.

## Tests

The starter includes three layers of automated coverage:

- Vitest unit tests for auth error mapping and session/device presentation
- Testing Library component tests for accessible password controls
- Playwright API integration and browser tests covering sign-up, sign-in,
  sign-out, protected routes, magic links, password recovery, email
  verification, password changes, session revocation, loading/error states,
  password-manager metadata, keyboard interaction, and narrow viewports

The browser and API suites start the app with an isolated in-memory Own Auth
storage adapter and a test-only email inbox. They do not use `DATABASE_URL` and
do not send real email. The inbox endpoint returns one-time tokens only while
`OWN_AUTH_TEST_MODE=1` in a non-production process; it returns `404` otherwise.
Never enable that variable in production.

Install the Chromium test browser once:

```bash
npx playwright install chromium
```

Run individual layers:

```bash
npm run test:unit
npm run test:components
npm run test:integration
npm run test:e2e
```

Run the complete suite:

```bash
npm run test:all
```
