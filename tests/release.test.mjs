import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const htmlPath = new URL("../.next/server/app/index.html", import.meta.url);
const pageSourcePath = new URL("../app/page.tsx", import.meta.url);

test("renders the verified catalogue and complete financial planner", async () => {
  const html = await readFile(htmlPath, "utf8");
  const pageSource = await readFile(pageSourcePath, "utf8");
  assert.match(html, /Add living costs to the study plan/);
  assert.match(html, /TOTAL STUDENT BUDGET/);
  assert.match(html, /Possible annual fee increase/);
  assert.match(html, /Expected tuition scholarship/);
  assert.match(html, /Safety allowance/);
  assert.match(pageSource, /Year-by-year planning schedule/);
  assert.match(html, /DATA VERIFICATION CENTRE/);
  assert.match(pageSource, /Official source register/);
  assert.match(html, /ADMISSION READINESS/);
  assert.match(pageSource, /Print checklist/);
  assert.match(html, /0<!-- --> automated data flags/);
});

test("keeps uncertainty and verification disclosures visible", async () => {
  const html = await readFile(htmlPath, "utf8");
  assert.match(html, /Hall availability and seat allocation must be confirmed/);
  assert.match(html, /Tuition split required/);
  assert.match(html, /Official sources linked/);
});
