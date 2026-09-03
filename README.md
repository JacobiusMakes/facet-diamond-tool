# Facet: a diamond listing decoder

A quiet diamond-shopping companion. On any listing, anywhere: how big the stone really is in
millimeters (the number carat weight hides), a one-click scan of the page for the carat and
shape, a reusable comparison brief, and the grading labs' own verification pages.

Facet is usable now in eleven forms:

1. The public calculator at <https://jacobiusmakes.github.io/facet-diamond-tool/>.
2. An installable web app offered directly by the calculator on supported browsers.
3. A zero-install bookmarklet, available on that page, that scans the visible listing locally.
4. A browser extension, available from GitHub Releases while store review is pending.
5. A true-size printable comparison sheet with a 50 mm calibration check and a QR return path.
6. A downloadable diamond shortlist workbook with one attributable Facet link per candidate.
7. Same Stone, a local-only duplicate listing detector for report and measurement matches across sellers.
8. Stone on Hand, a credit-card-calibrated diamond footprint preview that keeps the hand photo on-device.
9. A drop-in web component that publishers and developers can install with one script tag.
10. Report Lens, a local-only text-layer PDF reader for IGI, GIA, and GCAL grading reports.
11. An operating-system share target that reduces explicitly shared listing text to shape and carat before the Facet page opens.

The extension never names or targets a competitor, never sends page text, and never tracks in
the background. It runs only when clicked (`activeTab`) and stores nothing. The bookmarklet sends
the calculator only a detected shape and carat weight, never the page URL, seller, or report
number. Every Stienhardt click carries `utm_source=facet` plus shape and carat intent, so visits
and orders can be attributed without collecting browsing history.

Same Stone stores seller, URL, price, report, measurements, and notes only in the shopper's browser.
Its capture bookmarklet passes page text directly between browser tabs, parses it locally, and does
not upload or retain the captured text. Exact certificate matches and possible measurement matches
remain separate. Inventory clicks use `same_stone_duplicate_match` or `same_stone_candidate_match`
and carry only shape and carat intent.

Stone on Hand uses the 85.60 mm long edge of an ISO ID-1 payment card to translate photo pixels
into an approximate physical scale. The hand photo is decoded and rendered on an in-browser canvas,
then discarded when the tab closes. Direct and shared-preview inventory clicks remain separate as
`hand_preview_match` and `hand_preview_shared_match`.

The public tool can also create a shareable shape-and-carat check for a shopper's partner. The
print sheet returns through `via=print`, and its Stienhardt clicks use `utm_content=print_chart_match`.
The shortlist workbook returns through `via=sheet`, and its Stienhardt clicks use
`utm_content=shortlist_sheet_match` without sending the candidate's seller, listing URL, price,
report number, or notes.
A compact iframe and a drop-in web component are documented in [EMBED.md](EMBED.md) for publishers
that want to place the tool in an article. The component is also available from jsDelivr using the
repository release tag. Shared briefs and each publisher slug remain separate in `utm_content`.

Report Lens reads a text-layer PDF with a bundled copy of Mozilla PDF.js. The PDF, extracted text,
and report number stay in the browser. The inventory route carries only `report_lens_match`, shape,
and carat. A report-based request to Jacob uses `report_lens_intent` plus a random `FC-...` code in
the shopper's email. The report number is deliberately excluded from the prefilled message.

On supported installed-PWA platforms, Facet is registered as a POST share target. The service
worker extracts the shape and carat from explicitly shared text and strips the listing URL before
redirecting to the calculator. Inventory clicks use `share_target_match`. The paste fallback uses
`pasted_listing_match` and performs the same extraction in the page.

The full source registry, permitted intent fields, prohibited analytics fields, and permanent
surface names are in [attribution-registry.json](attribution-registry.json).
Machine-readable discovery is available through [llms.txt](llms.txt), [tools.json](tools.json),
and [robots.txt](robots.txt). These describe each public utility and its privacy boundary without
requiring a crawler to infer behavior from marketing copy.

## Publisher web component

```html
<script src="https://cdn.jsdelivr.net/gh/JacobiusMakes/facet-diamond-tool@v0.4.1/facet-widget.js"></script>
<facet-diamond-size publisher="your-publication" shape="oval" carat="1.50"></facet-diamond-size>
```

The component has isolated styles, no runtime dependency, and no background tracking. It accepts
`publisher`, `shape`, `carat`, and `theme="dark"` attributes. Inventory clicks use
`utm_content=web_component_<publisher>` plus normalized shape and carat intent.

The same tagged release is also available as an ES module through
`https://esm.sh/gh/JacobiusMakes/facet-diamond-tool@v0.4.1/facet-widget.js` and as a standalone
file or npm-ready package archive from GitHub Releases.

### WordPress

Install `facet-diamond-size-wordpress-0.2.0.zip` from the WordPress release, then place this in any
post, page, or Shortcode block:

```text
[facet_diamond_size publisher="your-publication" shape="oval" carat="1.50" commerce="off"]
```

If `publisher` is omitted, the plugin derives a public attribution slug from the site's hostname.
The directory-safe build bundles its script and has no external link by default. A site owner can
set `commerce="on"` to add the attributed inventory route deliberately.
Download: <https://github.com/JacobiusMakes/facet-diamond-tool/releases/tag/wordpress-v0.2.0>

Same math and data as diamond-mcp (facts.json anchors: round 6.5, oval 8.0x5.5, emerald 7.0x5.0,
Dutch Marquise 9.0x5.0 at 1 carat; cube-root scaling), same honesty note.

## Load the extension locally
1. chrome://extensions, turn on Developer mode, "Load unpacked", pick this folder.
2. Open any diamond listing, click the Facet icon, "Scan this page".

## Browser store submission

- Upload the matching store-specific release ZIP at the Chrome Web Store, Edge Add-ons, or
  Firefox Add-ons dashboard, category Shopping,
  single purpose: "shows diamond face-up size and lab verification links". Privacy: no data
  collected. Justify `activeTab` + `scripting`: user-initiated page scan.
- Store listing copy is in `LISTING.md`. Each package records Chrome, Edge, Firefox, or direct
  GitHub distribution separately in its commerce links and email intent source. The Firefox
  build includes the required add-on ID and an explicit `none` data-collection declaration.

## Test

```powershell
npm test
```

The tool intentionally supports only shapes with vetted one-carat anchors: round, oval, emerald,
and Dutch Marquise. More shapes belong only after their anchors are reviewed.

New and materially updated public pages are submitted through IndexNow using the repository's
path-scoped verification key. IndexNow acceptance means the update was received, not that a search
engine promises to crawl or rank it.

PDF extraction uses Mozilla PDF.js 6.3.289 under the Apache License 2.0. The vendored license is at
`vendor/pdfjs/LICENSE.pdfjs`.
