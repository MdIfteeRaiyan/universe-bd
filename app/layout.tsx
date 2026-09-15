import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniVerse BD — Find Your University Fit",
  description: "Discover, compare and understand private universities in Bangladesh based on your program, budget, location and priorities.",
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
