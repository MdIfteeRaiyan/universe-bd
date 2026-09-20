import type { University } from "@/data/models";

export type DataQualityIssue = {
  university: string;
  field: string;
  message: string;
  severity: "error" | "warning";
  code:
    | "duplicate-id"
    | "duplicate-short-name"
    | "duplicate-programme"
    | "duplicate-programme-cost"
    | "invalid-cost"
    | "missing-source"
    | "invalid-source"
    | "duplicate-source"
    | "missing-verification-date"
    | "invalid-verification-date"
    | "future-verification-date"
    | "stale-verification"
    | "invalid-review-date"
    | "review-due"
    | "incomplete-catalogue";
};

export function validateUniversityData(
  universities: University[],
  now = new Date(),
) {
  const issues: DataQualityIssue[] = [];
  const seenIds = new Set<number>();
  const seenShortNames = new Set<string>();
  const addIssue = (
    university: string,
    field: string,
    message: string,
    severity: DataQualityIssue["severity"],
    code: DataQualityIssue["code"],
  ) => issues.push({ university, field, message, severity, code });
  const staleBefore = now.getTime() - 180 * 86_400_000;
  const futureTolerance = now.getTime() + 7 * 86_400_000;

  for (const university of universities) {
    if (seenIds.has(university.id)) {
      addIssue(university.name, "id", "Duplicate university ID", "error", "duplicate-id");
    }
    seenIds.add(university.id);

    if (seenShortNames.has(university.short)) {
      addIssue(university.name, "short", "Duplicate university abbreviation", "error", "duplicate-short-name");
    }
    seenShortNames.add(university.short);

    const listedProgrammeNames = new Set<string>();
    for (const programme of university.programs) {
      const key = programme.trim().toLocaleLowerCase();
      if (listedProgrammeNames.has(key)) {
        addIssue(university.name, programme, "Duplicate programme in catalogue", "error", "duplicate-programme");
      }
      listedProgrammeNames.add(key);
    }

    const programmeNames = new Set<string>();
    for (const programme of university.programCosts ?? []) {
      const key = programme.name.trim().toLocaleLowerCase();
      if (programmeNames.has(key)) {
        addIssue(university.name, programme.name, "Duplicate programme cost record", "error", "duplicate-programme-cost");
      }
      programmeNames.add(key);

      if (programme.pending) {
        if (programme.total !== 0) {
          addIssue(university.name, programme.name, "Pending cost must not contain a payable total", "error", "invalid-cost");
        }
        continue;
      }
      if (programme.total <= 0) {
        addIssue(university.name, programme.name, "Verified cost requires a positive total", "error", "invalid-cost");
      }
      if (programme.credits < 0 || programme.tuitionPerCredit < 0) {
        addIssue(university.name, programme.name, "Credits and tuition rates cannot be negative", "error", "invalid-cost");
      }
      if (!programme.discounted && programme.tuitionPerCredit > 0 && programme.credits > 0 && programme.total < programme.tuitionPerCredit * programme.credits) {
        addIssue(university.name, programme.name, "Total is below published tuition alone", "error", "invalid-cost");
      }
    }

    if (university.status === "Official" && !university.sources?.length) {
      addIssue(university.name, "sources", "Official profile has no source", "error", "missing-source");
    }
    if (university.status === "Official" && !university.verifiedAt) {
      addIssue(university.name, "verifiedAt", "Official profile has no verification date", "error", "missing-verification-date");
    } else if (university.verifiedAt) {
      const checkedAt = Date.parse(university.verifiedAt);
      if (Number.isNaN(checkedAt)) {
        addIssue(university.name, "verifiedAt", "Verification date is invalid", "error", "invalid-verification-date");
      } else if (checkedAt > futureTolerance) {
        addIssue(university.name, "verifiedAt", "Verification date is unexpectedly in the future", "error", "future-verification-date");
      } else if (checkedAt < staleBefore) {
        addIssue(university.name, "verifiedAt", "Official profile is due for source review", "warning", "stale-verification");
      }
    }
    if (university.dataContext?.reviewDue) {
      const reviewDue = Date.parse(`${university.dataContext.reviewDue}T23:59:59Z`);
      if (Number.isNaN(reviewDue)) {
        addIssue(university.name, "dataContext.reviewDue", "Structured review date is invalid", "error", "invalid-review-date");
      } else if (reviewDue < now.getTime()) {
        addIssue(university.name, "dataContext.reviewDue", "Scheduled source review is due", "warning", "review-due");
      }
    }
    if (university.status === "Official" && !university.programCatalogComplete) {
      addIssue(university.name, "programs", "Complete programme catalogue is still pending", "warning", "incomplete-catalogue");
    }
    const seenSources = new Set<string>();
    for (const source of university.sources ?? []) {
      try {
        const url = new URL(source.url);
        if (url.protocol !== "https:") {
          addIssue(university.name, "sources", "Official source must use HTTPS", "error", "invalid-source");
        }
        const normalizedUrl = url.href.replace(/\/$/, "");
        if (seenSources.has(normalizedUrl)) {
          addIssue(university.name, "sources", "Duplicate official source link", "warning", "duplicate-source");
        }
        seenSources.add(normalizedUrl);
      } catch {
        addIssue(university.name, "sources", "Official source URL is invalid", "error", "invalid-source");
      }
    }
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return {
    issues,
    errors,
    warnings,
    releaseReady: errors.length === 0,
    issueCounts: {
      errors: errors.length,
      warnings: warnings.length,
    },
    universityCount: universities.length,
    officialCount: universities.filter((university) => university.status === "Official").length,
    verifiedProgrammeCount: universities.flatMap((university) => university.programCosts ?? []).filter((programme) => !programme.pending && programme.total > 0).length,
  };
}
