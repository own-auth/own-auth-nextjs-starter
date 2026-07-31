import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MagicLinkForm } from "@/components/magic-link-form";

describe("MagicLinkForm", () => {
  it("explains the exact missing configuration and links to Delivery", () => {
    render(<MagicLinkForm isDeliveryConfigured={false} />);

    expect(
      screen.getByText("OWN_AUTH_EMAIL_DELIVERY_KEY is missing from .env.")
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Open Own Auth Delivery" })
    ).toHaveAttribute("href", "https://own-auth.com");
    expect(
      screen.queryByRole("button", { name: "Send magic link" })
    ).not.toBeInTheDocument();
  });

  it("renders the request form when delivery is configured", () => {
    render(<MagicLinkForm isDeliveryConfigured />);

    expect(screen.getByLabelText("Email address")).toHaveAttribute(
      "autocomplete",
      "email"
    );
    expect(
      screen.getByRole("button", { name: "Send magic link" })
    ).toBeVisible();
  });
});
