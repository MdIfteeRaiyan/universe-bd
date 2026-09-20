export type AdmissionReadinessInput = {
  universityName: string;
  programmeName: string;
  programmeAvailable: boolean;
  programmeCatalogComplete: boolean;
  minimumGpa?: number;
  minimumSscGpa?: number;
  minimumHscGpa?: number;
  minimumCombinedGpa?: number;
  generalGpaRule?: string;
  gpaPaths?: Array<{
    label: string;
    minimumSscGpa?: number;
    minimumHscGpa?: number;
    minimumCombinedGpa?: number;
  }>;
  sscGpa: number;
  hscGpa: number;
  hasVerifiedCost: boolean;
  hasAdmissionSource: boolean;
  hasScholarshipSource: boolean;
  requiresScienceReview: boolean;
  programmeSubjectRule?: string;
};

export type ReadinessStatus = "ready-to-review" | "needs-attention" | "not-listed";

export function evaluateAdmissionReadiness(input: AdmissionReadinessInput) {
  const minimumSscGpa = input.minimumSscGpa ?? input.minimumGpa;
  const minimumHscGpa = input.minimumHscGpa ?? input.minimumGpa;
  const meetsThresholds = (rule: {
    minimumSscGpa?: number;
    minimumHscGpa?: number;
    minimumCombinedGpa?: number;
  }) =>
    (rule.minimumSscGpa === undefined || input.sscGpa >= rule.minimumSscGpa) &&
    (rule.minimumHscGpa === undefined || input.hscGpa >= rule.minimumHscGpa) &&
    (rule.minimumCombinedGpa === undefined ||
      input.sscGpa + input.hscGpa >= rule.minimumCombinedGpa);
  const gpaKnown =
    Boolean(input.gpaPaths?.length) ||
    minimumSscGpa !== undefined ||
    minimumHscGpa !== undefined ||
    input.minimumCombinedGpa !== undefined;
  const generalGpaMet = gpaKnown &&
    (input.gpaPaths?.length
      ? input.gpaPaths.some((path) => meetsThresholds(path))
      : meetsThresholds({
          minimumSscGpa,
          minimumHscGpa,
          minimumCombinedGpa: input.minimumCombinedGpa,
        }));

  const status: ReadinessStatus =
    !input.programmeAvailable && input.programmeCatalogComplete
      ? "not-listed"
      : gpaKnown && !generalGpaMet
        ? "needs-attention"
        : "ready-to-review";

  const checks = [
    {
      label: "Programme listed in the current catalogue",
      state: input.programmeAvailable ? "complete" : "attention",
      note: input.programmeAvailable
        ? `${input.programmeName} is listed for ${input.universityName}.`
        : input.programmeCatalogComplete
          ? `${input.programmeName} is not in the verified catalogue.`
          : "The complete programme catalogue is still being verified.",
    },
    {
      label: "General GPA reference",
      state: !gpaKnown ? "review" : generalGpaMet ? "complete" : "attention",
      note: !gpaKnown
        ? "A general minimum GPA has not been verified."
        : generalGpaMet
          ? input.generalGpaRule ?? "The entered results meet the published GPA reference."
          : `The entered results do not meet the published requirement: ${input.generalGpaRule ?? "review the official GPA rule"}`,
    },
    {
      label: "Programme-specific subject rules",
      state: input.programmeSubjectRule
        ? "complete"
        : input.requiresScienceReview
          ? "review"
          : "complete",
      note: input.programmeSubjectRule
        ? input.programmeSubjectRule
        : input.requiresScienceReview
          ? "Confirm Mathematics, Physics, Chemistry or Biology grade requirements on the official admission page."
        : "No additional science-subject warning is inferred for this programme.",
    },
    {
      label: "Complete programme cost",
      state: input.hasVerifiedCost ? "complete" : "review",
      note: input.hasVerifiedCost
        ? "A published programme total is available for financial planning."
        : "The complete programme total is still pending verification.",
    },
    {
      label: "Official admission source",
      state: input.hasAdmissionSource ? "complete" : "review",
      note: input.hasAdmissionSource
        ? "An official admission or eligibility source is linked."
        : "The official admission source is still pending.",
    },
    {
      label: "Scholarship source",
      state: input.hasScholarshipSource ? "complete" : "review",
      note: input.hasScholarshipSource
        ? "Published scholarship or waiver information is linked."
        : "Do not assume a waiver until an official policy is verified.",
    },
  ] as const;

  return {
    status,
    generalGpaMet: gpaKnown ? generalGpaMet : undefined,
    checks,
    completedChecks: checks.filter((check) => check.state === "complete").length,
  };
}
