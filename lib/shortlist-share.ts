export type SharedShortlist = {
  ids: number[];
  programme: string;
};

const MAX_SHARED_CHOICES = 3;

export function parseSharedShortlist(
  search: string,
  validUniversityIds: ReadonlySet<number>,
): SharedShortlist | null {
  const params = new URLSearchParams(search);
  const rawChoices = params.get("choices");
  if (!rawChoices) return null;

  const ids = [...new Set(
    rawChoices
      .split(",")
      .map((value) => Number.parseInt(value, 10))
      .filter((id) => Number.isInteger(id) && validUniversityIds.has(id)),
  )].slice(0, MAX_SHARED_CHOICES);

  if (!ids.length) return null;

  return {
    ids,
    programme: (params.get("programme") ?? "").trim().slice(0, 100),
  };
}

export function createSharedShortlistUrl(
  currentUrl: string,
  ids: number[],
  programme: string,
) {
  const url = new URL(currentUrl);
  url.search = "";
  url.hash = "shortlist";
  url.searchParams.set(
    "choices",
    [...new Set(ids)].slice(0, MAX_SHARED_CHOICES).join(","),
  );
  if (programme.trim()) {
    url.searchParams.set("programme", programme.trim().slice(0, 100));
  }
  return url.toString();
}

export function createDecisionReportUrl(
  currentUrl: string,
  ids: number[],
  programme: string,
) {
  const url = new URL(createSharedShortlistUrl(currentUrl, ids, programme));
  url.pathname = "/decision-report";
  url.hash = "";
  return url.toString();
}
