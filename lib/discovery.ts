import { privateUniversities } from "@/data/private-universities";

export const discoverySlug = (value: string) =>
  value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const programmeDirectory = [
  ...new Map(
    privateUniversities
      .flatMap((university) => university.programs)
      .map((programme) => [discoverySlug(programme), programme]),
  ).entries(),
]
  .map(([slug, name]) => ({ slug, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const districtDirectory = [
  ...new Map(
    privateUniversities.map((university) => [
      discoverySlug(university.district),
      university.district,
    ]),
  ).entries(),
]
  .map(([slug, name]) => ({ slug, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const programmeFromSlug = (slug: string) =>
  programmeDirectory.find((item) => item.slug === slug);

export const districtFromSlug = (slug: string) =>
  districtDirectory.find((item) => item.slug === slug);
