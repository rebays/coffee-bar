import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

import { BottomNav } from "@/components/bottom-nav";
import { ToastHost } from "@/components/ui/toast-host";
import { getCurrentCustomer } from "@/lib/customers/auth";

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

export default async function RootLayout({ children, sheet }: LayoutProps<"/">) {
  const customer = await getCurrentCustomer();
  // First name only — BottomNav has three actions sharing one line now, and
  // a full name is the one field here with no length limit of its own.
  const customerName = customer?.fullName.trim().split(/\s+/)[0] ?? null;

  return (
    <html lang="en" data-theme="light" className={`${bricolage.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        {sheet}
        <BottomNav customerName={customerName} />
        <ToastHost />
      </body>
    </html>
  );
}
