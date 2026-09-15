export type AdmissionReadinessInput = {
  universityName: string;
  programmeName: string;
  programmeAvailable: boolean;
  programmeCatalogComplete: boolean;
  minimumGpa?: number;
  sscGpa: number;
  hscGpa: number;
  hasVerifiedCost: boolean;
  hasAdmissionSource: boolean;
  hasScholarshipSource: boolean;
  requiresScienceReview: boolean;
};

export type ReadinessStatus = "ready-to-review" | "needs-attention" | "not-listed";

export function evaluateAdmissionReadiness(input: AdmissionReadinessInput) {
  const gpaKnown = input.minimumGpa !== undefined;
  const generalGpaMet =
    gpaKnown &&
    input.sscGpa >= input.minimumGpa! &&
    input.hscGpa >= input.minimumGpa!;

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
          ? `Both results meet the published ${input.minimumGpa!.toFixed(2)} reference.`
          : `At least one result is below the published ${input.minimumGpa!.toFixed(2)} reference.`,
    },
    {
      label: "Programme-specific subject rules",
      state: input.requiresScienceReview ? "review" : "complete",
      note: input.requiresScienceReview
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
