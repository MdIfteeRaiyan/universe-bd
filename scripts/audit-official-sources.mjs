import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { privateUniversities } from "../data/private-universities.ts";

const statePath = process.env.SOURCE_MONITOR_STATE ?? ".source-monitor-cache/state.json";
const reportPath = process.env.SOURCE_MONITOR_REPORT ?? "reports/source-monitor.md";
const checkedAt = new Date();
const timeoutMs = 10_000;
const concurrency = 16;
const acceptReviewedChanges = process.env.SOURCE_MONITOR_ACCEPT_CHANGES === "1";
const monitoredLabel = /fee|tuition|cost|admission|eligib|requirement|scholarship|waiver|programme|program/i;

const normalize = (value) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const fingerprint = (value) =>
  createHash("sha256").update(normalize(value)).digest("hex");

const sources = privateUniversities.flatMap((university) =>
  (university.sources ?? [])
    .filter((source) => monitoredLabel.test(source.label))
    .map((source) => ({
      university: university.name,
      short: university.short,
      label: source.label,
      url: source.url,
    })),
);

const uniqueSources = [...new Map(sources.map((source) => [source.url, source])).values()];

async function loadPreviousState() {
  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch {
    return { sources: {} };
  }
}

async function inspect(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(source.url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "CampusChoiceBD-SourceMonitor/1.0 (+https://campuschoice-bd.vercel.app)",
        accept: "text/html,application/pdf;q=0.9,*/*;q=0.8",
      },
    });
    const body = await response.text();
    return {
      ...source,
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      hash: response.ok ? fingerprint(body) : undefined,
      checkedAt: checkedAt.toISOString(),
    };
  } catch (error) {
    return {
      ...source,
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "Unknown fetch error",
      checkedAt: checkedAt.toISOString(),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function inspectAll(items) {
  const results = [];
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await inspect(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

const previous = await loadPreviousState();
const results = await inspectAll(uniqueSources);
const firstRun = Object.keys(previous.sources ?? {}).length === 0;
// Dynamic university pages often rotate view counters, notices or anti-bot text.
// Require the same new fingerprint on two consecutive runs before raising a
// change alert. A maintainer can explicitly accept reviewed pages as the new
// baseline with SOURCE_MONITOR_ACCEPT_CHANGES=1.
const changed = acceptReviewedChanges
  ? []
  : results.filter((result) => {
      const prior = previous.sources?.[result.url];
      return result.ok && prior?.hash && prior.hash !== result.hash && prior.candidateHash === result.hash;
    });
const unavailable = results.filter((result) => !result.ok);
const newlyUnavailable = unavailable.filter((result) => previous.sources?.[result.url]?.status !== result.status);
const today = checkedAt.toISOString().slice(0, 10);
const overdue = privateUniversities.filter(
  (university) => university.dataContext?.reviewDue && university.dataContext.reviewDue < today,
);
const previouslyOverdue = new Set(previous.overdue ?? []);
const newlyOverdue = overdue.filter((university) => !previouslyOverdue.has(university.short));

const nextState = {
  checkedAt: checkedAt.toISOString(),
  overdue: overdue.map((university) => university.short),
  sources: Object.fromEntries(
    results.map((result) => {
      const prior = previous.sources?.[result.url] ?? {};
      const establishBaseline = firstRun || acceptReviewedChanges || !prior.hash;
      const returnedToBaseline = result.ok && result.hash === prior.hash;
      const repeatedCandidate = result.ok && result.hash !== prior.hash && prior.candidateHash === result.hash;
      return [
        result.url,
        {
          hash: establishBaseline && result.hash ? result.hash : (prior.hash ?? result.hash),
          status: result.status,
          checkedAt: result.checkedAt,
          ...(!establishBaseline && !returnedToBaseline && result.hash
            ? {
                candidateHash: result.hash,
                candidateCount: repeatedCandidate ? (prior.candidateCount ?? 1) + 1 : 1,
              }
            : {}),
        },
      ];
    }),
  ),
};

const lines = [
  "# CampusChoice BD official-source monitor",
  "",
  `Checked: ${checkedAt.toISOString()}`,
  `Official sources checked: ${results.length}`,
  `Changed sources requiring review: ${firstRun ? 0 : changed.length}`,
  `Unavailable sources: ${unavailable.length}`,
  `University reviews overdue: ${overdue.length}`,
  "",
];

if (firstRun) lines.push("This was the baseline run. Page-change alerts begin with the next scheduled run.", "");
if (acceptReviewedChanges) lines.push("Reviewed page fingerprints were accepted as the new monitoring baseline.", "");
if (changed.length) {
  lines.push("## Changed official pages", "");
  for (const item of changed) lines.push(`- **${item.short}** — [${item.label}](${item.url})`);
  lines.push("");
}
if (unavailable.length) {
  lines.push("## Unavailable official pages", "");
  for (const item of unavailable) lines.push(`- **${item.short}** — ${item.status || "network error"}: [${item.label}](${item.url})`);
  lines.push("");
}
if (overdue.length) {
  lines.push("## Reviews due", "");
  for (const university of overdue) lines.push(`- **${university.short}** — due ${university.dataContext.reviewDue}`);
  lines.push("");
}
lines.push(
  "## Safety rule",
  "",
  "A detected change is a review signal only. Tuition, admission and scholarship records must be checked against the official source before publication.",
  "",
);

await mkdir(path.dirname(statePath), { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(statePath, `${JSON.stringify(nextState, null, 2)}\n`);
await writeFile(reportPath, `${lines.join("\n")}\n`);

const needsReview = changed.length > 0 || newlyUnavailable.length > 0 || newlyOverdue.length > 0;
if (process.env.GITHUB_OUTPUT) {
  await writeFile(process.env.GITHUB_OUTPUT, `needs_review=${needsReview}\n`, { flag: "a" });
}
console.log(lines.slice(0, 7).join("\n"));
