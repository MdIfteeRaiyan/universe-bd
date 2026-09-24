import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("catalogue audit separates blocking errors from review warnings", async () => {
  const source = await readFile(new URL("../lib/data-quality.ts", import.meta.url), "utf8");
  assert.match(source, /severity: "error" \| "warning"/);
  assert.match(source, /releaseReady: errors\.length === 0/);
  assert.match(source, /future-verification-date/);
  assert.match(source, /missing-programme-cost-state/);
  assert.match(source, /orphan-programme-cost/);
  assert.match(source, /stale-verification/);
  assert.match(source, /duplicate-programme/);
  assert.match(source, /Duplicate official source link/);
  assert.match(source, /invalid-review-date/);
  assert.match(source, /review-due/);
  assert.match(source, /Credits and tuition rates cannot be negative/);
});

test("catalogue refresh checks use the actual build date", async () => {
  const source = await readFile(new URL("../data/catalog.ts", import.meta.url), "utf8");
  assert.match(source, /now = new Date\(\)/);
  assert.doesNotMatch(source, /2026-09-16T00:00:00Z/);
});

test("release tests execute the catalogue validation gate", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  const gate = await readFile(
    new URL("../scripts/validate-catalogue.mjs", import.meta.url),
    "utf8",
  );
  assert.match(packageJson.scripts.test, /npm run validate:data/);
  assert.match(gate, /validateUniversityData/);
  assert.match(gate, /duplicate-source/);
  assert.match(gate, /process\.exitCode = 1/);
});

test("newly completed catalogues retain explicit review context", async () => {
  const source = await readFile(
    new URL("../data/private-universities.ts", import.meta.url),
    "utf8",
  );
  for (const short of ["SMUCT", "IIUB", "TUB-F", "RMU"]) {
    const start = source.indexOf(`u.short === "${short}"`);
    assert.notEqual(start, -1, `${short} profile should exist`);
    const profile = source.slice(start, source.indexOf("Object.assign(", start + 20));
    assert.match(profile, /programCatalogComplete: true/);
    assert.match(profile, /reviewDue: "2026-12-15"/);
  }
});

test("all private programme catalogues are now explicitly complete", async () => {
  const gate = await import("../lib/data-quality.ts");
  const data = await import("../data/private-universities.ts");
  const report = gate.validateUniversityData(data.privateUniversities, new Date());
  assert.equal(
    report.warnings.filter((issue) => issue.code === "incomplete-catalogue").length,
    0,
  );
});

test("AIUB health-science minimums use current official credits and rates", async () => {
  const { privateUniversities } = await import("../data/private-universities.ts");
  const aiub = privateUniversities.find((university) => university.short === "AIUB");
  assert.ok(aiub);
  const bmb = aiub.programCosts?.find((programme) => programme.name === "Biochemistry & Molecular Biology");
  const microbiology = aiub.programCosts?.find((programme) => programme.name === "Microbiology");
  assert.deepEqual(
    { credits: bmb?.credits, tuitionPerCredit: bmb?.tuitionPerCredit, total: bmb?.total, minimum: bmb?.minimum, pending: bmb?.pending },
    { credits: 140, tuitionPerCredit: 7000, total: 1107000, minimum: true, pending: undefined },
  );
  assert.deepEqual(
    { credits: microbiology?.credits, tuitionPerCredit: microbiology?.tuitionPerCredit, total: microbiology?.total, minimum: microbiology?.minimum, pending: microbiology?.pending },
    { credits: 140, tuitionPerCredit: 5500, total: 897000, minimum: true, pending: undefined },
  );
});

test("BRAC Architecture uses a transparent official-source lower bound", async () => {
  const { privateUniversities } = await import("../data/private-universities.ts");
  const bracu = privateUniversities.find((university) => university.short === "BRACU");
  const architecture = bracu?.programCosts.find((programme) => programme.name === "Architecture");

  assert.equal(architecture?.credits, 207);
  assert.equal(architecture?.semesters, 15);
  assert.equal(architecture?.tuitionPerCredit, 8250);
  assert.equal(architecture?.total, 2065700);
  assert.equal(architecture?.minimum, true);
  assert.equal(architecture?.pending, undefined);
  assert.match(bracu?.feeBreakdown.join(" ") ?? "", /ten required Design studios \(81 credits\)/);
});
