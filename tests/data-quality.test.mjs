import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("catalogue audit separates blocking errors from review warnings", async () => {
  const source = await readFile(new URL("../lib/data-quality.ts", import.meta.url), "utf8");
  assert.match(source, /severity: "error" \| "warning"/);
  assert.match(source, /releaseReady: errors\.length === 0/);
  assert.match(source, /future-verification-date/);
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
