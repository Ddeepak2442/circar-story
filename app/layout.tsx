import type { Metadata } from "next";
import { siteContent } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  title: `Happy 29th Birthday, ${siteContent.herName}`,
  description: "A little birthday surprise, made with love.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
