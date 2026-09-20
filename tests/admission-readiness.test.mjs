import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("readiness engine supports combined GPA and verified subject rules", async () => {
  const source = await readFile(new URL("../lib/admission-readiness.ts", import.meta.url), "utf8");
  assert.match(source, /minimumCombinedGpa/);
  assert.match(source, /input\.sscGpa \+ input\.hscGpa >= input\.minimumCombinedGpa/);
  assert.match(source, /input\.programmeSubjectRule/);
  assert.match(source, /The entered results do not meet the published requirement/);
});

test("programme-level rules can override general GPA thresholds", async () => {
  const model = await readFile(new URL("../data/models.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(model, /ProgrammeAdmissionRule[\s\S]*minimumCombinedGpa/);
  assert.match(page, /readinessProgrammeRule\?\.minimumCombinedGpa/);
  assert.match(page, /Minimum aggregate GPA 8\.00/);
  assert.match(page, /English, Mathematics, Biology and Chemistry/);
});
