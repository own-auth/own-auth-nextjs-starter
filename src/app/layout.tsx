import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { SessionNav } from "@/components/session-nav";

import "./globals.css";
import "./auth-flows.css";
import "./account.css";

export const metadata: Metadata = {
  title: {
    default: "Own Auth starter",
    template: "%s · Own Auth starter"
  },
  description: "A secure Next.js starter powered by Own Auth."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="shell header-inner">
            <Link className="brand" href="/">
              <span className="brand-mark" aria-hidden="true">
                oa
              </span>
              <span>Own Auth</span>
            </Link>
            <SessionNav />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
