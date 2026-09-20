import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps university and grading data outside the interactive page", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const catalogue = await readFile(new URL("../data/private-universities.ts", import.meta.url), "utf8");
  const grades = await readFile(new URL("../data/grade-charts.ts", import.meta.url), "utf8");

  assert.match(page, /import \{ privateUniversities \} from "@\/data\/private-universities"/);
  assert.match(page, /import \{ gradeCharts \} from "@\/data\/grade-charts"/);
  assert.doesNotMatch(page, /const universities: University\[\] = \[/);
  assert.doesNotMatch(page, /const gradeCharts: Record<string, GradeChart>/);
  assert.ok(page.split("\n").length < 5_000, "interactive page should remain below 5,000 lines");
  assert.match(catalogue, /export const privateUniversities = universities/);
  assert.match(grades, /export const gradeCharts/);
});
