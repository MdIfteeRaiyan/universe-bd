import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "UniVerse BD",
  title: "UniVerse BD — Find Your University Fit",
  description: "Compare verified private-university programmes, costs and admission information in Bangladesh, with a separate guide for public universities.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#101827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-BD">
      <body className="antialiased">{children}</body>
    </html>
  );
}
