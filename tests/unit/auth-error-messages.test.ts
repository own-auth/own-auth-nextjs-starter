import { OwnAuthClientError } from "own-auth/client";
import { describe, expect, it } from "vitest";

import {
  emailVerificationErrorMessage,
  magicLinkErrorMessage,
  passwordResetErrorMessage
} from "@/lib/auth-error-messages";

function authError(code: ConstructorParameters<typeof OwnAuthClientError>[0]) {
  return new OwnAuthClientError(code, code, 400);
}

describe("auth error messages", () => {
  it("distinguishes expired, used, invalid, and unknown magic links", () => {
    expect(magicLinkErrorMessage(authError("expired_token"))).toContain("expired");
    expect(magicLinkErrorMessage(authError("token_already_used"))).toContain(
      "already been used"
    );
    expect(magicLinkErrorMessage(authError("invalid_token"))).toContain("invalid");
    expect(magicLinkErrorMessage(new Error("network"))).toContain(
      "could not verify"
    );
  });

  it("distinguishes expired, used, and invalid verification links", () => {
    expect(emailVerificationErrorMessage(authError("expired_token"))).toContain(
      "expired"
    );
    expect(
      emailVerificationErrorMessage(authError("token_already_used"))
    ).toContain("already been used");
    expect(emailVerificationErrorMessage(authError("invalid_token"))).toContain(
      "invalid"
    );
  });

  it("distinguishes reset token and password failures", () => {
    expect(passwordResetErrorMessage(authError("expired_token"))).toContain(
      "expired"
    );
    expect(passwordResetErrorMessage(authError("token_already_used"))).toContain(
      "already been used"
    );
    expect(passwordResetErrorMessage(authError("weak_password"))).toContain(
      "stronger"
    );
    expect(passwordResetErrorMessage(authError("invalid_token"))).toContain(
      "invalid"
    );
  });
});
