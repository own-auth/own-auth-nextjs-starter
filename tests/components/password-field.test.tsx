import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PasswordField } from "@/components/password-field";

describe("PasswordField", () => {
  it("is masked by default and toggles without submitting", async () => {
    const user = userEvent.setup();
    render(
      <PasswordField
        autoComplete="current-password"
        label="Password"
        name="password"
        required
      />
    );

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocomplete", "current-password");
    expect(input).toBeRequired();

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" })
    ).toHaveAttribute("type", "button");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("supports keyboard activation and preserves disabled state", async () => {
    const user = userEvent.setup();
    render(
      <PasswordField disabled label="New password" name="newPassword" />
    );

    const input = screen.getByLabelText("New password");
    expect(input).toBeDisabled();

    await user.tab();
    expect(screen.getByRole("button", { name: "Show new password" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(input).toHaveAttribute("type", "text");
  });
});
