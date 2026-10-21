# CampusChoice BD — app release audit

Audited 21 October 2026.

## Completed

- Prevented page-level horizontal overflow and tightened mobile wrapping.
- Added one accessible mobile menu across every route; removed the redundant mobile dock.
- Verified the favicon, added 192px/512px install icons and completed the standalone web-app manifest.
- Added consistent page-title templates, descriptions and canonical URLs.
- Replaced duplicate footers with one short shared footer and automatic copyright year.
- Corrected stale finder links and retained the custom 404/error recovery pages.
- Kept the logo linked to the homepage across shared navigation.
- Added optional clickable email and phone links through Vercel environment variables.
- Added accessible shortlist success/error announcements.
- Hid expired admission dates by default; historical dates remain available on request.
- Confirmed there are no dummy Lorem Ipsum/TODO placeholders. Search-field hints remain because they improve usability.
- Existing visual assets are compact SVGs; the two generated PNG app icons are optimized and under 120 KB combined.

## Verification

- 40/40 automated release tests passed.
- 346 generated pages audited.
- 7,606 internal links audited.
- 913 rendered image references audited.
- 88 university profiles, 751 verified programme totals, 0 blocking data errors.

## Data still requiring official review

The app intentionally keeps 163 programme totals pending rather than estimating them. The generated `reports/data-review-queue.md` records 38 high-priority and 84 medium-priority review tasks. Expired admission dates and three due source-review dates are also flagged. These are content-maintenance items, not broken application functionality.

## Optional Vercel settings

Set these only with verified public contact details:

- `NEXT_PUBLIC_FEEDBACK_EMAIL`
- `NEXT_PUBLIC_CONTACT_PHONE`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
