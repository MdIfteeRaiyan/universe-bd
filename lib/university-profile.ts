import type { University } from "@/data/models";

export function universityProfileSlug(university: University) {
  const shortSlug = university.short
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${university.id}-${shortSlug}`;
}

export function universityProfilePath(university: University) {
  return `/universities/${universityProfileSlug(university)}`;
}

export function universityFromProfileSlug(
  universities: University[],
  slug: string,
) {
  return universities.find(
    (university) => universityProfileSlug(university) === slug,
  );
}
