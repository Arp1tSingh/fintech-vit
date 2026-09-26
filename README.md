# Fintech Committee — content & assets

The real committee content and cut-out photography, exported from the site in
`../fintech-new` so it can be read, reused or handed over as plain files.

## What's here

| File | What it is |
| --- | --- |
| `content.md` | Human-readable content sheet — every name, role, line, event, figure, heading and Q&A |
| `content.json` | The same data, machine-readable, mirroring the site's content model |
| `photos/members/` | 11 background-removed cut-outs, 720×960 transparent PNG |
| `photos/events/` | Empty — no event photographs supplied yet |

## Read `content.md` first

It is the whole committee in one file: faculty, the 3-person leadership, the 6
portfolios with all 8 heads, the 3 events with their real numbers, the session
formats, the section headings, the scrolling band, and the Q&As.

## Regenerating

Everything here is **generated**. Do not edit these files by hand — edit the
site's content instead and re-export, or the two will drift:

```bash
cd ../fintech-new
# edit content/site.ts and content/data.ts
npm run export
```

`scripts/export-content.mjs` reads the site's TypeScript content files directly,
so the export cannot disagree with what the site renders.

## Photo specs

The member cut-outs are 3:4 portrait, transparent PNG, all composited onto one
shared canvas so every portrait renders at the same size with the subject
centred. If you replace them, keep them transparent and 3:4, then run
`npm run photos` in the site project to re-normalise, and `npm run export` to
copy them across.

The source photographs had their subjects sitting off-centre inside the frame,
which is why normalisation trims to the alpha bounds before centring. Skipping
that step leaves every person visibly offset from their cell.

## Still to fill in

- **Event dates and venues** — all three events are `TBC` in both files.
- **Contact inbox** — `contact.email` is the institute's public switchboard, a
  placeholder so nothing bounces. Point it at the committee's address.
- **Faculty names** — `Dr. Nayana Mahajan` and `Prof. Manoj Suryavanshi` are
  verbatim as supplied; spellings and titles are unverified.
- **Event photographs** — drop cut-outs in `photos/events/` and re-export.
