import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

import { BottomNav } from "@/components/bottom-nav";
import { ToastHost } from "@/components/ui/toast-host";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"], // wght is the default axis — listing it is an error
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "Coffee Bar",
  description: "Digital menu and ordering for a coffee bar in Honiara, Solomon Islands.",
};

// Without viewportFit: 'cover', iOS never lets the page draw under the
// home-indicator area, which means env(safe-area-inset-bottom) — every
// .safe-bottom element in the app relies on it — resolves to its 0px
// fallback instead of the device's real inset.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children, sheet }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" className={`${bricolage.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        {sheet}
        <BottomNav />
        <ToastHost />
      </body>
    </html>
  );
}
