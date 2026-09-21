import { privateUniversities } from "../data/private-universities.ts";
import { validateUniversityData } from "../lib/data-quality.ts";

const report = validateUniversityData(privateUniversities, new Date());
const programmeCosts = privateUniversities.flatMap(
  (university) => university.programCosts ?? [],
);
const pendingProgrammeCount = programmeCosts.filter(
  (programme) => programme.pending,
).length;
const duplicateSourceIssues = report.issues.filter(
  (issue) => issue.code === "duplicate-source",
);

console.log(
  [
    `Universities: ${report.universityCount}`,
    `Official profiles: ${report.officialCount}`,
    `Verified programme totals: ${report.verifiedProgrammeCount}`,
    `Pending programme totals: ${pendingProgrammeCount}`,
    `Blocking errors: ${report.issueCounts.errors}`,
    `Review warnings: ${report.issueCounts.warnings}`,
  ].join("\n"),
);

const blockingIssues = [...report.errors, ...duplicateSourceIssues];
if (blockingIssues.length) {
  console.error("\nCatalogue release gate failed:");
  for (const issue of blockingIssues) {
    console.error(
      `- ${issue.university} · ${issue.field}: ${issue.message}`,
    );
  }
  process.exitCode = 1;
} else {
  console.log("Catalogue release gate passed.");
}
