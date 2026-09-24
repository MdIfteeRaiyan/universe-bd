import type { MetadataRoute } from "next";
import { privateUniversities } from "@/data/private-universities";
import { universityProfilePath } from "@/lib/university-profile";
import { districtDirectory, programmeDirectory } from "@/lib/discovery";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://campuschoice-bd.vercel.app";
  const corePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/public-universities`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/my-decision`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/admission-calendar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...["methodology", "privacy", "terms", "disclaimer"].map((path) => ({ url: `${baseUrl}/${path}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
  const universityPages: MetadataRoute.Sitemap = privateUniversities.map((university) => ({
    url: `${baseUrl}${universityProfilePath(university)}`,
    lastModified: university.verifiedAt ? new Date(university.verifiedAt) : new Date(),
    changeFrequency: "monthly",
    priority: university.status === "Official" ? 0.7 : 0.4,
  }));
  const programmePages: MetadataRoute.Sitemap = programmeDirectory.map(({ slug }) => ({ url: `${baseUrl}/programmes/${slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.65 }));
  const districtPages: MetadataRoute.Sitemap = districtDirectory.map(({ slug }) => ({ url: `${baseUrl}/districts/${slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 }));
  return [...corePages, ...universityPages, ...programmePages, ...districtPages];
}
