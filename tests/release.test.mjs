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
  assert.match(pageSource, /official bachelor catalogue lists eight current undergraduate programmes/);
  assert.match(pageSource, /Readable official pages confirm undergraduate degree routes in business, English, law and agriculture/);
  assert.match(pageSource, /official website identifies six undergraduate routes across computing, business, law and social sciences/);
  assert.match(pageSource, /AI and Data Science, Digital Marketing, Hospitality and Tourism, and English are labelled proposed/);
  assert.match(pageSource, /Victoria University labels its table total as excluding admission/);
  assert.match(pageSource, /Published CSE \/ CSIT programme total/);
  assert.match(pageSource, /RMU was established in 2015 and began its academic journey in 2017/);
  assert.match(pageSource, /every programme cost remains pending rather than estimated/);
  assert.match(pageSource, /Khulna Khan Bahadur Ahsanullah University/);
  assert.match(pageSource, /Official CSE fee-table total: ৳3,71,750/);
  assert.match(pageSource, /Golden GPA 5\.00 in both SSC and HSC: 100% tuition waiver/);
  assert.match(pageSource, /combined GPA must be at least 6\.00/);
  assert.match(pageSource, /Feni University publishes this UGC-approved scale/);
  assert.match(html, /ADMISSION READINESS/);
  assert.match(pageSource, /Print checklist/);
  assert.match(html, /MY SHORTLIST/);
  assert.match(pageSource, /campuschoice-bd-shortlist/);
  assert.match(pageSource, /Compare the same programme and scan only the facts that matter/);
  assert.match(pageSource, /Lowest verified/);
  assert.match(pageSource, /Remove one saved university before adding another/);
  assert.match(html, /A student-built guide that makes university programmes/);
  assert.match(html, /PRIVATE UNIVERSITY FINDER/);
  assert.match(html, /Start here/);
  assert.match(html, /View eligibility summary/);
  assert.match(html, /Show more ·/);
  assert.match(html, /Refine by GPA or exact location/);
  assert.match(html, /Check my GPA eligibility/);
  assert.match(html, /no hidden GPA filter is applied/);
  assert.match(html, /Looking for public universities\? Open the separate guide/);
  assert.doesNotMatch(html, /Search institution type/);
  assert.match(pageSource, /Bangladesh University of Engineering and Technology/);
});

test("ships the CampusChoice BD browser and header identity", async () => {
  const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const pageSource = await readFile(pageSourcePath, "utf8");
  const favicon = await readFile(new URL("../public/favicon.svg", import.meta.url), "utf8");
  const logo = await readFile(new URL("../public/logo-mark.svg", import.meta.url), "utf8");
  const manifest = await readFile(new URL("../public/site.webmanifest", import.meta.url), "utf8");
  assert.match(layoutSource, /applicationName: "CampusChoice BD"/);
  assert.match(layoutSource, /manifest: "\/site.webmanifest"/);
  assert.match(pageSource, /src="\/logo-mark.svg"/);
  assert.match(favicon, /aria-label="CampusChoice BD"/);
  assert.match(logo, /aria-label="CampusChoice BD logo"/);
  assert.equal(JSON.parse(manifest).name, "CampusChoice BD");
});

test("ships public-launch discovery metadata", async () => {
  const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const robotsSource = await readFile(new URL("../app/robots.ts", import.meta.url), "utf8");
  const sitemapSource = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  const socialImageSource = await readFile(new URL("../app/opengraph-image.tsx", import.meta.url), "utf8");
  assert.match(layoutSource, /metadataBase: new URL\("https:\/\/campuschoice-bd\.vercel\.app"\)/);
  assert.match(layoutSource, /summary_large_image/);
  assert.match(robotsSource, /sitemap\.xml/);
  assert.match(sitemapSource, /public-universities/);
  assert.match(socialImageSource, /Choose your university with clearer facts/);
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
