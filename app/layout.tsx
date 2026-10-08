import type { Metadata, Viewport } from "next";
import { Roboto_Flex, Urbanist } from "next/font/google";
import "./globals.css";

import { BottomNav } from "@/components/bottom-nav";
import { ToastHost } from "@/components/ui/toast-host";

// Headings and item names.
const urbanist = Urbanist({
  subsets: ["latin"],
  style: ["normal"],
  variable: "--font-urbanist",
});

// Everything else. opsz is driven by font-optical-sizing in globals.css;
// wght is the default axis — listing it is an error.
const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-roboto-flex",
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
  themeColor: "#eeebe5",
};

// Runs before first paint: a saved "dark" choice (components/theme-toggle.tsx)
// switches the page before anything draws; otherwise it stays light — the
// default — which the server already renders. Kept tiny and
// dependency-free — it's inlined into every page.
const THEME_INIT = `(function(){try{if(localStorage.getItem('theme')==='dark'){document.documentElement.dataset.theme='dark'}}catch(e){}})()`;

export default function RootLayout({ children, sheet }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: THEME_INIT sets data-theme before React
    // hydrates, so the attribute legitimately differs from the server's.
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${urbanist.variable} ${robotoFlex.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <div aria-hidden="true" className="page-texture" />
        {children}
        {sheet}
        <BottomNav />
        <ToastHost />
      </body>
    </html>
  );
}
