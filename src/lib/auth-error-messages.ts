import { OwnAuthClientError } from "own-auth/client";

export function magicLinkErrorMessage(caught: unknown): string {
  if (!(caught instanceof OwnAuthClientError)) {
    return "We could not verify this link. Request a new one and try again.";
  }

  if (caught.code === "expired_token") {
    return "This link has expired. Request a new one to continue.";
  }

  if (caught.code === "token_already_used") {
    return "This link has already been used. Request a new one to continue.";
  }

  if (caught.code === "invalid_token") {
    return "This link is invalid. Request a new one to continue.";
  }

  return "We could not verify this link. Request a new one and try again.";
}

export function emailVerificationErrorMessage(caught: unknown): string {
  if (!(caught instanceof OwnAuthClientError)) {
    return "We could not verify your email. Request a new link and try again.";
  }

  if (caught.code === "expired_token") {
    return "This link has expired. Request a new one from your account.";
  }

  if (caught.code === "token_already_used") {
    return "This link has already been used.";
  }

  return "This verification link is invalid.";
}

export function passwordResetErrorMessage(caught: unknown): string {
  if (!(caught instanceof OwnAuthClientError)) {
    return "We could not reset your password. Please try again.";
  }

  if (caught.code === "expired_token") {
    return "This reset link has expired. Request a new one.";
  }

  if (caught.code === "token_already_used") {
    return "This reset link has already been used.";
  }

  if (caught.code === "weak_password") {
    return "Choose a stronger password.";
  }

  return "This password reset link is invalid.";
}
