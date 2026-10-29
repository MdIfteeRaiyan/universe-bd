# CampusChoice BD — app release audit

Audited 29 October 2026.

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
- Replaced expired admission-calendar entries with official Spring 2027 dates for NSU, BRACU, EWU and VU.
- Applied BRAC University's current Spring 2027 fee schedule across all structured programme records.
- Reconciled six current Sonargaon University programme totals and marked seven unreconciled routes pending instead of retaining stale figures.
- Rechecked VU, NUBTK and ADUST records and cleared every overdue source-review warning.
- Reviewed all 20 official pages flagged by the source monitor; corrected Pundra's Civil diploma-entry total and refreshed BUFT's current waiver illustrations.

## Verification

- 40/40 automated release tests passed.
- 346 generated pages audited.
- 7,606 internal links audited.
- 913 rendered image references audited.
- 88 university profiles, 744 verified programme totals, 170 intentionally pending totals, 0 blocking data errors and 0 review warnings.
- 315 official source URLs checked; 42 university-hosted pages rejected or timed out during the final automated pass and remain queued for human checking.

## Data still requiring official review

The app intentionally keeps 170 programme totals pending rather than estimating them. The generated `reports/data-review-queue.md` is the current private maintenance queue. Official pages that reject automated checks are reported as unavailable and are never treated as evidence that a published fact has disappeared.

## Optional Vercel settings

Set these only with verified public contact details:

- `NEXT_PUBLIC_FEEDBACK_EMAIL`
- `NEXT_PUBLIC_CONTACT_PHONE`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
