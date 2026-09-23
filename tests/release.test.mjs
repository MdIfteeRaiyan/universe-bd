import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const htmlPath = new URL("../.next/server/app/index.html", import.meta.url);
const pageSourcePath = new URL("../app/page.tsx", import.meta.url);
const globalStylesPath = new URL("../app/globals.css", import.meta.url);
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
  assert.match(html, /Built by/);
  assert.match(html, /Md Iftee Raiyan/);
  assert.match(html, /github\.com\/MdIfteeRaiyan/);
  assert.match(html, /Confirm final details with the university/);
  assert.match(privateData, /UODA's official introduction states that the university was established in 2002/);
  assert.match(privateData, /Official 2026 undergraduate fee table/);
  assert.match(privateData, /Golden GPA 5.00: 100% tuition scholarship/);
  assert.match(privateData, /University-published Summer 2026 CSE total/);
  assert.match(privateData, /Official Fall 2026 CSE total/);
  assert.match(privateData, /visible component columns do not fully reconcile/);
  assert.match(privateData, /reviewDue: "2026-10-15"/);
  assert.match(privateData, /Fall 2026 CSE published minimum/);
  assert.match(privateData, /Transparent CSE minimum from the current official table: ৳3,48,500/);
  assert.match(privateData, /minimum GPA follows university policy without publishing a numerical threshold/);
  assert.match(privateData, /Current official CSE total/);
  assert.match(privateData, /promotional after-waiver figures are not treated as guaranteed payable costs/);
  assert.match(privateData, /Applicants must have passed Physics and Mathematics at HSC or A-Level/);
  assert.match(privateData, /name: "Brahmaputra International University"/);
  assert.match(privateData, /Official CSE total: ৳2,64,000 for 160 credits/);
  assert.match(privateData, /formerly listed as Sheikh Fazilatunnesa Mujib University/);
  assert.match(privateData, /Global University Bangladesh is separate from the University of Global Village/);
  assert.match(privateData, /CSE applicants must have studied Physics, Chemistry and Mathematics/);
  assert.match(privateData, /Current officially linked CSE programme total/);
  assert.match(privateData, /Golden GPA 5\.00 in both SSC and HSC: 70% tuition waiver/);
  assert.match(privateData, /does not invent a label for the unitemized balance/);
  assert.match(privateData, /Transparent CSE minimum: ৳4,04,800/);
  assert.match(privateData, /Combined SSC and HSC GPA 10\.00: 50% tuition waiver/);
  assert.match(privateData, /The current official catalogue contains six undergraduate routes: BBA, regular CSE/);
  assert.match(privateData, /CSE applicants need an HSC Science background with Mathematics/);
  assert.match(privateData, /Official regular CSE total: ৳4,70,100 for 160 credits/);
  assert.match(privateData, /all seventeen programme totals are now recorded without using promotional estimates/);
  assert.match(privateData, /Diploma-entry engineering routes publish a ৳3,90,000 total/);
  assert.match(privateData, /Official CSE tuition schedule: ৳4,50,000 for 160 credits/);
  assert.match(privateData, /Agriculture is recorded at ৳4,00,000 because the official footnote/);
  assert.match(privateData, /With at least 90% attendance and A\+ in every subject/);
  assert.match(privateData, /Combined GPA 8\.00 with at least 3\.50 in each examination/);
  assert.match(privateData, /Fourteen routes now have a standard published tuition band/);
  assert.match(privateData, /Every programme total in the finder adds the standard ৳14,000 admission payment/);
  assert.match(privateData, /temporary 55% Fall 2026 waiver/);
  assert.match(privateData, /only CSE diploma-entry fees remain pending/);
  assert.match(privateData, /Official Fall 2026 standard CSE total/);
  assert.match(privateData, /All twelve bachelor routes have official standard totals in the Fall 2026 admission brochure/);
  assert.match(privateData, /Top five admission-test scorers with at least 75%: 25% first-semester tuition waiver/);
  assert.match(privateData, /Combined SSC and HSC GPA 6\.50 with at least GPA 3\.00 in each/);
  assert.match(privateData, /Credits are source-linked, but local-student totals and waiver bands remain pending/);
  assert.match(privateData, /One of two concurrently admitted siblings or spouses may receive a 25% waiver/);
  assert.match(privateData, /Average SSC and HSC GPA 2\.50; if either result is GPA 2\.00/);
  assert.match(privateData, /Official Fall 2026 CSE standard total/);
  assert.match(privateData, /Ten of eleven standard undergraduate routes have complete official totals; only Physics remains pending/);
  assert.match(privateData, /CSE components reconcile exactly: admission ৳12,500/);
  assert.match(projectSource, /Your simple decision path/);
  assert.match(projectSource, /Use the Save button on a university card/);
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
  assert.match(privateData, /Published Pharmacy programme total: ৳6,21,950/);
  assert.match(privateData, /English applicants with GPA 5\.00 in both SSC and HSC without the fourth subject/);
  assert.match(privateData, /Pharmacy applicants need a combined SSC and HSC GPA of at least 6\.50/);
  assert.match(privateData, /Poor and meritorious rural students with at least CGPA 3\.00/);
  assert.match(privateData, /Pharmacy applicants need combined SSC and HSC GPA 8\.00/);
  assert.match(privateData, /Nine current undergraduate routes are reconciled across BUBT/);
  assert.match(privateData, /Civil Engineering requires GPA 3\.00 in both SSC and HSC/);
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
  assert.match(pageSource, /Remove one university before saving another/);
  assert.match(html, /Source-checked guidance/);
  assert.match(html, /PRIVATE UNIVERSITY FINDER/);
  assert.match(html, /Your simple decision path/);
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

test("ships a responsive accessible decision trail", async () => {
  const pageSource = await readFile(pageSourcePath, "utf8");
  const styles = await readFile(globalStylesPath, "utf8");
  assert.match(pageSource, /Decision trail/);
  assert.match(pageSource, /options in view/);
  assert.match(pageSource, /aria-label="Your university decision path"/);
  assert.match(styles, /@media\(min-width:640px\)\{\.decision-rail\{display:block\}\}/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(styles, /animation:none!important/);
});

test("ships shared smooth interface motion across public pages", async () => {
  const layout = await readFile(
    new URL("../app/layout.tsx", import.meta.url),
    "utf8",
  );
  const motion = await readFile(
    new URL("../components/interface-motion.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(globalStylesPath, "utf8");
  assert.match(layout, /<InterfaceMotion \/>/);
  assert.match(motion, /IntersectionObserver/);
  assert.match(motion, /requestAnimationFrame/);
  assert.match(motion, /prefers-reduced-motion/);
  assert.match(motion, /\.motion-cluster > \*/);
  assert.match(motion, /--reveal-delay/);
  assert.match(styles, /\.page-progress/);
  assert.match(styles, /\.interface-reveal\.is-visible/);
  assert.match(styles, /@media\(hover:hover\) and \(pointer:fine\)/);
  assert.match(styles, /\.site-shell/);
  assert.match(styles, /\.premium-header/);
  assert.match(styles, /\.content-defer/);
  assert.match(styles, /prefers-contrast:more/);
  assert.match(styles, /forced-colors:active/);
});

test("ships consistent keyboard skip navigation on secondary pages", async () => {
  const profile = await readFile(new URL("../app/universities/[slug]/page.tsx", import.meta.url), "utf8");
  const publicDirectory = await readFile(new URL("../app/public-universities/public-directory.tsx", import.meta.url), "utf8");
  const report = await readFile(new URL("../app/decision-report/report.tsx", import.meta.url), "utf8");
  assert.match(profile, /className="skip-link"/);
  assert.match(publicDirectory, /className="skip-link"/);
  assert.match(report, /className="skip-link"/);
  assert.match(profile, /id="profile-content" tabIndex={-1}/);
  assert.match(report, /id="decision-report-content" tabIndex={-1}/);
});

test("ships graceful loading and error recovery", async () => {
  const loading = await readFile(new URL("../app/loading.tsx", import.meta.url), "utf8");
  const error = await readFile(new URL("../app/error.tsx", import.meta.url), "utf8");
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /Preparing your university guide/);
  assert.match(error, /onClick={reset}/);
  assert.match(error, /Your saved choices are still safe/);
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

test("ships a branded recovery page for broken links", async () => {
  const source = await readFile(
    new URL("../app/not-found.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /This university link may have changed/);
  assert.match(source, /href="\/"/);
  assert.match(source, /href="\/public-universities"/);
  assert.match(source, /saved shortlist.*remain available/);
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

test("ships a safe daily official-source monitor", async () => {
  const workflow = await readFile(new URL("../.github/workflows/daily-source-monitor.yml", import.meta.url), "utf8");
  const monitor = await readFile(new URL("../scripts/audit-official-sources.mjs", import.meta.url), "utf8");
  assert.match(workflow, /cron: "20 1 \* \* \*"/);
  assert.match(workflow, /Official university sources need review/);
  assert.match(monitor, /A detected change is a review signal only/);
  assert.match(monitor, /privateUniversities/);
});
