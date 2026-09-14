import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone reach dev-only resources (HMR, fonts) when testing over the
  // LAN via this machine's IP instead of localhost — see docs/CLAUDE.md's
  // note on scanning a table QR from another device. Dev-only; irrelevant
  // to a production build.
  allowedDevOrigins: ["192.168.68.117"],
};

export default nextConfig;
