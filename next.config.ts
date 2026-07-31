import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir:
    process.env.OWN_AUTH_TEST_MODE === "1" ? ".next-test" : ".next",
  poweredByHeader: false
};

export default nextConfig;
