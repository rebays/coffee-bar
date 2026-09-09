import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

import { CartBar } from "@/components/cart/cart-bar";
import { RecentOrdersLauncher } from "@/components/order/recent-orders-launcher";
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

export default function RootLayout({ children, sheet }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" className={`${bricolage.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        {sheet}
        <CartBar />
        <RecentOrdersLauncher />
        <ToastHost />
      </body>
    </html>
  );
}
