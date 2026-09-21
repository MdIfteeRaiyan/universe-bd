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
