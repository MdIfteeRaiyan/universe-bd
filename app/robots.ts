import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://campuschoice-bd.vercel.app/sitemap.xml",
    host: "https://campuschoice-bd.vercel.app",
  };
}
