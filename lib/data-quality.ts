import type { University } from "@/data/models";

export type DataQualityIssue = {
  university: string;
  field: string;
  message: string;
};

export function validateUniversityData(universities: University[]) {
  const issues: DataQualityIssue[] = [];
  const seenIds = new Set<number>();
  const seenShortNames = new Set<string>();

  for (const university of universities) {
    if (seenIds.has(university.id)) {
      issues.push({ university: university.name, field: "id", message: "Duplicate university ID" });
    }
    seenIds.add(university.id);

    if (seenShortNames.has(university.short)) {
      issues.push({ university: university.name, field: "short", message: "Duplicate university abbreviation" });
    }
    seenShortNames.add(university.short);

    const programmeNames = new Set<string>();
    for (const programme of university.programCosts ?? []) {
      const key = programme.name.trim().toLocaleLowerCase();
      if (programmeNames.has(key)) {
        issues.push({ university: university.name, field: programme.name, message: "Duplicate programme cost record" });
      }
      programmeNames.add(key);

      if (programme.pending) {
        if (programme.total !== 0) {
          issues.push({ university: university.name, field: programme.name, message: "Pending cost must not contain a payable total" });
        }
        continue;
      }
      if (programme.total <= 0) {
        issues.push({ university: university.name, field: programme.name, message: "Verified cost requires a positive total" });
      }
      if (!programme.discounted && programme.tuitionPerCredit > 0 && programme.credits > 0 && programme.total < programme.tuitionPerCredit * programme.credits) {
        issues.push({ university: university.name, field: programme.name, message: "Total is below published tuition alone" });
      }
    }

    if (university.status === "Official" && !university.sources?.length) {
      issues.push({ university: university.name, field: "sources", message: "Official profile has no source" });
    }
    if (university.status === "Official" && !university.verifiedAt) {
      issues.push({ university: university.name, field: "verifiedAt", message: "Official profile has no verification date" });
    }
    for (const source of university.sources ?? []) {
      try {
        const url = new URL(source.url);
        if (url.protocol !== "https:") {
          issues.push({ university: university.name, field: "sources", message: "Official source must use HTTPS" });
        }
      } catch {
        issues.push({ university: university.name, field: "sources", message: "Official source URL is invalid" });
      }
    }
  }

  return {
    issues,
    universityCount: universities.length,
    officialCount: universities.filter((university) => university.status === "Official").length,
    verifiedProgrammeCount: universities.flatMap((university) => university.programCosts ?? []).filter((programme) => !programme.pending && programme.total > 0).length,
  };
}
