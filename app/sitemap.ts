import type { MetadataRoute } from "next";
import { privateUniversities } from "@/data/private-universities";
import { universityProfilePath } from "@/lib/university-profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://campuschoice-bd.vercel.app";
  const corePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/public-universities`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];
  const universityPages: MetadataRoute.Sitemap = privateUniversities.map((university) => ({
    url: `${baseUrl}${universityProfilePath(university)}`,
    lastModified: university.verifiedAt ? new Date(university.verifiedAt) : new Date(),
    changeFrequency: "monthly",
    priority: university.status === "Official" ? 0.7 : 0.4,
  }));
  return [...corePages, ...universityPages];
}
