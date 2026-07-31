import { describe, expect, it } from "vitest";

import {
  formatLastActive,
  formatSessionLabel
} from "@/lib/session-display";

describe("session display helpers", () => {
  it.each([
    ["Mozilla/5.0 (Macintosh) Chrome/140.0", "Chrome on Mac"],
    ["Mozilla/5.0 (Windows) Edg/140.0", "Edge on Windows"],
    ["Mozilla/5.0 (iPhone) Version/18 Safari/605.1", "Safari on iPhone"],
    ["Mozilla/5.0 (Android) Firefox/141.0", "Firefox on Android"],
    ["Custom client", "Browser on device"]
  ])("formats %s", (userAgent, expected) => {
    expect(formatSessionLabel(userAgent)).toBe(expected);
  });

  it("handles a missing user agent", () => {
    expect(formatSessionLabel(null)).toBe("Unknown device");
  });

  it("formats recent, hourly, and older activity", () => {
    const now = Date.UTC(2026, 6, 31, 12);

    expect(formatLastActive(new Date(now - 30_000).toISOString(), now)).toBe(
      "1m ago"
    );
    expect(formatLastActive(new Date(now - 3_600_000).toISOString(), now)).toBe(
      "1h ago"
    );
    expect(formatLastActive("2026-07-29T12:00:00.000Z", now)).toBe("29 Jul");
  });
});
