import type { University } from "./models";

export type VerificationState =
  | "verified"
  | "partially-verified"
  | "pending"
  | "needs-refresh";

export type CatalogRecord = University & {
  normalizedName: string;
  verificationState: VerificationState;
  verifiedProgrammeCount: number;
  pendingProgrammeCount: number;
};

const parseVerifiedDate = (value?: string) => {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
};

export function buildUniversityCatalog(
  universities: University[],
  now = new Date("2026-09-15T00:00:00Z"),
) {
  const refreshAfterDays = 180;
  const refreshThreshold = now.getTime() - refreshAfterDays * 86_400_000;

  const records: CatalogRecord[] = universities.map((university) => {
    const costs = university.programCosts ?? [];
    const verifiedProgrammeCount = costs.filter(
      (programme) => !programme.pending && programme.total > 0,
    ).length;
    const pendingProgrammeCount = costs.filter(
      (programme) => programme.pending,
    ).length;
    const checkedAt = parseVerifiedDate(university.verifiedAt);
    const needsRefresh = checkedAt !== undefined && checkedAt < refreshThreshold;
    const verificationState: VerificationState =
      university.status !== "Official"
        ? "pending"
        : needsRefresh
          ? "needs-refresh"
          : verifiedProgrammeCount > 0 && pendingProgrammeCount === 0
            ? "verified"
            : verifiedProgrammeCount > 0 || university.sources?.length
              ? "partially-verified"
              : "pending";

    return {
      ...university,
      normalizedName: `${university.name} ${university.short}`
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim(),
      verificationState,
      verifiedProgrammeCount,
      pendingProgrammeCount,
    };
  });

  return {
    records,
    byId: new Map(records.map((university) => [university.id, university])),
    byShortName: new Map(
      records.map((university) => [university.short, university]),
    ),
    stats: {
      total: records.length,
      verified: records.filter(
        (university) => university.verificationState === "verified",
      ).length,
      partial: records.filter(
        (university) => university.verificationState === "partially-verified",
      ).length,
      pending: records.filter(
        (university) => university.verificationState === "pending",
      ).length,
      needsRefresh: records.filter(
        (university) => university.verificationState === "needs-refresh",
      ).length,
    },
  };
}

