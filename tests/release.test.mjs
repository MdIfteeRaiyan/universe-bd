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
  assert.doesNotMatch(html, /DATA VERIFICATION CENTRE/);
  assert.match(html, /Simple, source-checked information/);
  assert.match(html, /Missing fees or rules stay marked as pending—never guessed/);
  assert.match(pageSource, /UODA's official introduction states that the university was established in 2002/);
  assert.match(pageSource, /Official 2026 undergraduate fee table/);
  assert.match(pageSource, /Golden GPA 5.00: 100% tuition scholarship/);
  assert.match(pageSource, /University-published Summer 2026 CSE total/);
  assert.match(pageSource, /fee-table and academic-page CSE credit counts conflict/);
  assert.match(pageSource, /Feni University publishes this UGC-approved scale/);
  assert.match(html, /ADMISSION READINESS/);
  assert.match(pageSource, /Print checklist/);
  assert.match(html, /MY SHORTLIST/);
  assert.match(pageSource, /universe-bd-shortlist/);
  assert.match(html, /A student-built guide that makes university programmes/);
  assert.match(html, /PRIVATE UNIVERSITY FINDER/);
  assert.match(html, /Start here/);
  assert.match(html, /View eligibility summary/);
  assert.match(html, /Show more ·/);
  assert.match(html, /More location filters/);
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
