import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const htmlPath = new URL("../.next/server/app/index.html", import.meta.url);
const pageSourcePath = new URL("../app/page.tsx", import.meta.url);
const privateDataPath = new URL("../data/private-universities.ts", import.meta.url);
const gradeDataPath = new URL("../data/grade-charts.ts", import.meta.url);
const publicHtmlPath = new URL("../.next/server/app/public-universities.html", import.meta.url);
const reportHtmlPath = new URL("../.next/server/app/decision-report.html", import.meta.url);

test("renders the verified catalogue and complete financial planner", async () => {
  const html = await readFile(htmlPath, "utf8");
  const pageSource = await readFile(pageSourcePath, "utf8");
  const privateData = await readFile(privateDataPath, "utf8");
  const gradeData = await readFile(gradeDataPath, "utf8");
  const projectSource = `${pageSource}\n${privateData}`;
  assert.match(html, /Add living costs to the study plan/);
  assert.match(html, /TOTAL STUDENT BUDGET/);
  assert.match(html, /Possible annual fee increase/);
  assert.match(html, /Expected tuition scholarship/);
  assert.match(html, /Safety allowance/);
  assert.match(pageSource, /Year-by-year planning schedule/);
  assert.doesNotMatch(html, /DATA VERIFICATION CENTRE/);
  assert.match(html, /Simple, source-checked information/);
  assert.match(html, /blocking data issues/);
  assert.match(html, /Missing fees or rules stay marked as pending—never guessed/);
  assert.match(privateData, /UODA's official introduction states that the university was established in 2002/);
  assert.match(privateData, /Official 2026 undergraduate fee table/);
  assert.match(privateData, /Golden GPA 5.00: 100% tuition scholarship/);
  assert.match(privateData, /University-published Summer 2026 CSE total/);
  assert.match(privateData, /fee-table and academic-page CSE credit counts conflict/);
  assert.match(privateData, /official bachelor catalogue lists eight current undergraduate programmes/);
  assert.match(privateData, /Readable official pages confirm undergraduate degree routes in business, English, law and agriculture/);
  assert.match(privateData, /official website identifies six undergraduate routes across computing, business, law and social sciences/);
  assert.match(privateData, /AI and Data Science, Digital Marketing, Hospitality and Tourism, and English are labelled proposed/);
  assert.match(privateData, /Victoria University labels its table total as excluding admission/);
  assert.match(privateData, /Published CSE \/ CSIT programme total/);
  assert.match(privateData, /RMU was established in 2015 and began its academic journey in 2017/);
  assert.match(privateData, /every programme cost remains pending rather than estimated/);
  assert.match(privateData, /Khulna Khan Bahadur Ahsanullah University/);
  assert.match(privateData, /Official CSE fee-table total: ৳3,71,750/);
  assert.match(privateData, /Golden GPA 5\.00 in both SSC and HSC: 100% tuition waiver/);
  assert.match(privateData, /combined GPA must be at least 6\.00/);
  assert.match(privateData, /HSC GPA 3\.50 or above and combined SSC\+HSC GPA 8\.00 or above/);
  assert.match(privateData, /Official Fall 2026 engineering admission qualifications/);
  assert.match(projectSource, /Admission test:.*confirm on the official page/);
  assert.match(pageSource, /Official admission rules/);
  assert.match(privateData, /Combined SSC\+HSC GPA 8\.00 or above, with at least GPA 3\.50 in each examination/);
  assert.match(privateData, /HSC\/equivalent requires B grade in Physics and Mathematics/);
  assert.match(privateData, /Minimum aggregate GPA 8\.00, no GPA below 3\.50 in SSC and HSC/);
  assert.match(privateData, /Microbiology is additionally listed on the current admission page with its cost kept pending/);
  assert.match(privateData, /Science applicants need combined GPA 8\.00, GPA 3\.50 in each examination/);
  assert.match(privateData, /Mathematics and Physics are required at HSC\/equivalent level/);
  assert.match(privateData, /At least GPA 2\.00 in each and combined GPA 6\.00/);
  assert.match(privateData, /All ten undergraduate department routes linked by Green University's current official admission page are searchable/);
  assert.match(privateData, /English, General Knowledge, Mathematics, Physics and Chemistry/);
  assert.match(privateData, /SAT Math plus Critical Reading score 1100 or above/);
  assert.match(privateData, /Freedom-fighter children have a separate published combined-GPA route/);
  assert.match(gradeData, /Feni University publishes this UGC-approved scale/);
  assert.match(html, /ADMISSION READINESS/);
  assert.match(pageSource, /Print checklist/);
  assert.match(html, /MY SHORTLIST/);
  assert.match(pageSource, /campuschoice-bd-shortlist/);
  assert.match(pageSource, /Share shortlist/);
  assert.match(pageSource, /Application stages stay private/);
  assert.match(pageSource, /parseSharedShortlist/);
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
  assert.match(privateData, /Bangladesh University of Engineering and Technology/);
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
  assert.match(sitemapSource, /universityProfilePath/);
  assert.match(socialImageSource, /Choose your university with clearer facts/);
});

test("generates permanent source-rich university profiles", async () => {
  const profileSource = await readFile(new URL("../app/universities/[slug]/page.tsx", import.meta.url), "utf8");
  const profileHelpers = await readFile(new URL("../lib/university-profile.ts", import.meta.url), "utf8");
  assert.match(profileSource, /generateStaticParams/);
  assert.match(profileSource, /generateMetadata/);
  assert.match(profileSource, /Published programme costs/);
  assert.match(profileSource, /Official sources/);
  assert.match(profileSource, /CampusChoice BD does not estimate it/);
  assert.match(profileHelpers, /universityProfileSlug/);
});

test("keeps public universities in a separate admission experience", async () => {
  const publicHtml = await readFile(publicHtmlPath, "utf8");
  const publicSource = await readFile(new URL("../app/public-universities/public-directory.tsx", import.meta.url), "utf8");
  assert.match(publicHtml, /PUBLIC UNIVERSITY GUIDE/);
  assert.match(publicHtml, /Bangladesh University of Engineering and Technology/);
  assert.match(publicHtml, /Current-session costs, deadlines, seats and eligibility remain pending/);
  assert.match(publicSource, /Search university or programme/);
  assert.match(publicSource, /Search division\.\.\./);
  assert.match(publicSource, /aria-live="polite"/);
  assert.match(publicSource, /View all \{university\.programs\.length\} programmes/);
});

test("ships baseline production security headers", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /poweredByHeader: false/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /X-Frame-Options/);
  assert.match(config, /Permissions-Policy/);
  assert.match(config, /Referrer-Policy/);
});

test("keeps uncertainty and verification disclosures visible", async () => {
  const html = await readFile(htmlPath, "utf8");
  assert.match(html, /Hall availability and seat allocation must be confirmed/);
  assert.match(html, /Tuition split required/);
  assert.match(html, /Official sources linked/);
});

test("ships a private, printable shortlist decision report", async () => {
  const html = await readFile(reportHtmlPath, "utf8");
  const source = await readFile(new URL("../app/decision-report/report.tsx", import.meta.url), "utf8");
  const metadata = await readFile(new URL("../app/decision-report/page.tsx", import.meta.url), "utf8");
  assert.match(html, /Preparing report/);
  assert.match(source, /Print or save PDF/);
  assert.match(source, /Pending information is never estimated/);
  assert.match(source, /parseSharedShortlist/);
  assert.match(metadata, /index: false, follow: false/);
});
