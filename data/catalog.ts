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
  sourceCoverage: {
    fees: boolean;
    admissions: boolean;
    scholarships: boolean;
    academics: boolean;
  };
  profileCompleteness: number;
};

const parseVerifiedDate = (value?: string) => {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
};

export function buildUniversityCatalog(
  universities: University[],
  now = new Date(),
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
    const sourceLabels = (university.sources ?? [])
      .map((source) => source.label)
      .join(" ")
      .toLocaleLowerCase();
    const sourceCoverage = {
      fees: /fee|tuition|cost|charge/.test(sourceLabels),
      admissions: /admission|requirement|eligib/.test(sourceLabels),
      scholarships: /scholarship|waiver|financial aid|assistance/.test(
        sourceLabels,
      ),
      academics: /programme|program|catalog|curriculum|credit/.test(sourceLabels),
    };
    const completenessChecks = [
      university.status === "Official" && Boolean(university.sources?.length),
      Boolean(university.verifiedAt),
      Boolean(university.address || university.area),
      Boolean(university.programCatalogComplete),
      verifiedProgrammeCount > 0,
      sourceCoverage.fees,
      sourceCoverage.admissions,
      sourceCoverage.scholarships,
    ];
    const profileCompleteness = Math.round(
      (completenessChecks.filter(Boolean).length / completenessChecks.length) *
        100,
    );
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
      sourceCoverage,
      profileCompleteness,
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
