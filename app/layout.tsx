import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniVerse BD — Find Your University Fit",
  description: "Compare verified private-university programmes, costs and admission information in Bangladesh, with a separate guide for public universities.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
