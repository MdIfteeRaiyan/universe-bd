import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("shared shortlist links are capped, validated and privacy-safe", async () => {
  const source = await readFile(
    new URL("../lib/shortlist-share.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /MAX_SHARED_CHOICES = 3/);
  assert.match(source, /validUniversityIds\.has\(id\)/);
  assert.match(source, /url\.search = ""/);
  assert.match(source, /url\.searchParams\.set\(\s*"choices"/);
  assert.match(source, /createDecisionReportUrl/);
  assert.match(source, /url\.pathname = "\/decision-report"/);
  assert.doesNotMatch(source, /stage|ssc|hsc|gpa/i);
});
