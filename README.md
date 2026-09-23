# CampusChoice BD

CampusChoice BD is a responsive university discovery and comparison website for students in Bangladesh. It helps users explore programmes, divisions, districts, budgets, university profiles, costs, and comparison options.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Weekly official-source monitoring

The scheduled GitHub workflow checks official programme, fee, admission and scholarship pages every Monday. It detects page changes, broken sources and overdue university reviews, uploads a review report and creates a GitHub review issue when attention is needed. It never publishes changed financial data automatically.

Run the same audit locally with:

```bash
npm run audit:sources
```

## Production checks

```bash
npm run release:check
```

This runs linting, the catalogue validation gate, a production build and all automated tests. GitHub repeats the same check after every push and pull request.

## Deploy on Vercel

Import this GitHub repository into Vercel. Vercel will detect Next.js automatically.

After deployment:

1. Enable **Web Analytics** and **Speed Insights** in the Vercel project dashboard.
2. Add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` only after Google Search Console provides the verification token.
3. Optionally add `NEXT_PUBLIC_FEEDBACK_EMAIL` to open correction reports in the visitor's email app. Without it, the report is copied locally and nothing is submitted.
4. The optional custom event layer records only fixed event names and non-personal selection categories. It never sends GPA values, budget amounts, correction text or free-form search text.

The scheduled Lighthouse workflow audits the live home, public-university and My Decision pages using mobile emulation. Release targets are Performance 90+, Accessibility 95+, Best Practices 95+ and SEO 95+.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete PowerShell push and Vercel deployment steps.
