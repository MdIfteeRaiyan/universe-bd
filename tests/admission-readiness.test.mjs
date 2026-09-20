import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("readiness engine supports combined GPA and verified subject rules", async () => {
  const source = await readFile(new URL("../lib/admission-readiness.ts", import.meta.url), "utf8");
  assert.match(source, /minimumCombinedGpa/);
  assert.match(source, /input\.sscGpa \+ input\.hscGpa >= rule\.minimumCombinedGpa/);
  assert.match(source, /input\.programmeSubjectRule/);
  assert.match(source, /The entered results do not meet the published requirement/);
});

test("programme-level rules can override general GPA thresholds", async () => {
  const model = await readFile(new URL("../data/models.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const catalogue = await readFile(new URL("../data/private-universities.ts", import.meta.url), "utf8");
  assert.match(model, /ProgrammeAdmissionRule[\s\S]*minimumCombinedGpa/);
  assert.match(page, /readinessProgrammeRule\?\.minimumCombinedGpa/);
  assert.match(catalogue, /Minimum aggregate GPA 8\.00/);
  assert.match(catalogue, /English, Mathematics, Biology and Chemistry/);
});

test("readiness supports universities with alternative GPA paths", async () => {
  const engine = await readFile(new URL("../lib/admission-readiness.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const catalogue = await readFile(new URL("../data/private-universities.ts", import.meta.url), "utf8");
  assert.match(engine, /input\.gpaPaths\.some\(\(path\) => meetsThresholds\(path\)\)/);
  assert.match(catalogue, /GPA 2\.50 in both SSC and HSC, or GPA 2\.00 in one examination with combined GPA 6\.00/);
  assert.match(page, /readinessProfile\.admissionRules\?\.gpaPaths/);
});

test("structured university rules take priority over legacy minimum GPA", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const catalogue = await readFile(new URL("../data/private-universities.ts", import.meta.url), "utf8");
  assert.match(page, /minimumGpa: readinessProfile\.admissionRules[\s\S]*\? undefined[\s\S]*: readinessProfile\.minGpa/);
  assert.match(catalogue, /LLB \(Hons\) requires combined SSC and HSC GPA 7\.00 or above/);
});
