import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone reach dev-only resources (HMR, fonts) when testing over the
  // LAN via this machine's IP instead of localhost — see docs/CLAUDE.md's
  // note on scanning a table QR from another device. Dev-only; irrelevant
  // to a production build.
  // The machine's Wi-Fi address changes when the router hands out a new
  // lease — add the current one here if a phone loads the page but nothing
  // on it responds.
  allowedDevOrigins: ["192.168.68.117", "192.168.68.129", "192.168.68.101"],
};

export default nextConfig;
