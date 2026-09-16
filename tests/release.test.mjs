import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const htmlPath = new URL("../.next/server/app/index.html", import.meta.url);
const pageSourcePath = new URL("../app/page.tsx", import.meta.url);
const publicHtmlPath = new URL("../.next/server/app/public-universities.html", import.meta.url);

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
  assert.match(html, /Private verification progress/);
  assert.match(html, /Still awaiting readable official publications:/);
  assert.match(html, /Britannia University/);
  assert.match(pageSource, /UODA's official introduction states that the university was established in 2002/);
  assert.match(pageSource, /Official source register/);
  assert.match(html, /ADMISSION READINESS/);
  assert.match(pageSource, /Print checklist/);
  assert.match(html, /Automated data flags/);
  assert.match(html, /MY SHORTLIST/);
  assert.match(pageSource, /universe-bd-shortlist/);
  assert.match(html, /A student-built guide for comparing university programmes/);
  assert.match(html, /PRIVATE UNIVERSITY FINDER/);
  assert.match(html, /Jump to what you need/);
  assert.match(html, /More location filters/);
  assert.match(html, /directory-only profiles/);
  assert.match(html, /Institution type/);
  assert.match(pageSource, /Bangladesh University of Engineering and Technology/);
});

test("keeps public universities in a separate admission experience", async () => {
  const publicHtml = await readFile(publicHtmlPath, "utf8");
  assert.match(publicHtml, /PUBLIC UNIVERSITY GUIDE/);
  assert.match(publicHtml, /Bangladesh University of Engineering and Technology/);
  assert.match(publicHtml, /No academic cost, deadline, seat count or eligibility rule/);
});

test("keeps uncertainty and verification disclosures visible", async () => {
  const html = await readFile(htmlPath, "utf8");
  assert.match(html, /Hall availability and seat allocation must be confirmed/);
  assert.match(html, /Tuition split required/);
  assert.match(html, /Official sources linked/);
});
