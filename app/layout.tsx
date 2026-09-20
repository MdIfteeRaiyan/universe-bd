import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://campuschoice-bd.vercel.app"),
  applicationName: "CampusChoice BD",
  title: "CampusChoice BD — Find Your University Fit",
  description: "Compare verified private-university programmes, costs and admission information in Bangladesh, with a separate guide for public universities.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "/",
    siteName: "CampusChoice BD",
    title: "CampusChoice BD — Find Your University Fit",
    description: "Compare source-checked university programmes, costs, scholarships and admission information in Bangladesh.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CampusChoice BD university decision guide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusChoice BD — Find Your University Fit",
    description: "Compare source-checked university programmes, costs, scholarships and admission information in Bangladesh.",
    images: ["/opengraph-image"],
  },
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
