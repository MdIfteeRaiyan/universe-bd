# CampusChoice BD

CampusChoice BD is a responsive university discovery and comparison website for students in Bangladesh. It helps users explore programmes, divisions, districts, budgets, university profiles, costs, and comparison options.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Daily official-source monitoring

The scheduled GitHub workflow checks official programme, fee, admission and scholarship pages every day. It detects page changes, broken sources and overdue university reviews, then creates a GitHub review issue. It never publishes changed financial data automatically.

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

Import this GitHub repository into Vercel. Vercel will detect Next.js automatically; no environment variables or custom build settings are required for the current release.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete PowerShell push and Vercel deployment steps.
