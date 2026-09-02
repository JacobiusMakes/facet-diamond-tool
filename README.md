# Facet: a diamond listing decoder

A quiet diamond-shopping companion. On any listing, anywhere: how big the stone really is in
millimeters (the number carat weight hides), a one-click scan of the page for the carat and
shape, a reusable comparison brief, and the grading labs' own verification pages.

Facet is usable now in four forms:

1. The public calculator at <https://jacobiusmakes.github.io/facet-diamond-tool/>.
2. An installable web app offered directly by the calculator on supported browsers.
3. A zero-install bookmarklet, available on that page, that scans the visible listing locally.
4. A browser extension, available from GitHub Releases while store review is pending.

The extension never names or targets a competitor, never sends page text, and never tracks in
the background. It runs only when clicked (`activeTab`) and stores nothing. The bookmarklet sends
the calculator only a detected shape and carat weight, never the page URL, seller, or report
number. Every Stienhardt click carries `utm_source=facet` plus shape and carat intent, so visits
and orders can be attributed without collecting browsing history.

The public tool can also create a shareable shape-and-carat check for a shopper's partner. A compact
iframe version is documented in [EMBED.md](EMBED.md) for publishers that want to place the tool in
an article. Shared briefs and each publisher slug remain separate in `utm_content`.

Same math and data as diamond-mcp (facts.json anchors: round 6.5, oval 8.0x5.5, emerald 7.0x5.0,
Dutch Marquise 9.0x5.0 at 1 carat; cube-root scaling), same honesty note.

## Load the extension locally
1. chrome://extensions, turn on Developer mode, "Load unpacked", pick this folder.
2. Open any diamond listing, click the Facet icon, "Scan this page".

## Browser store submission

- Upload the release ZIP at the Chrome Web Store developer dashboard, category Shopping,
  single purpose: "shows diamond face-up size and lab verification links". Privacy: no data
  collected. Justify `activeTab` + `scripting`: user-initiated page scan.
- Store listing copy is in `LISTING.md`. Same package works for Edge Add-ons (free) and
  Firefox (manifest v3 supported) with no code changes.

## Test

```powershell
npm test
```

The tool intentionally supports only shapes with vetted one-carat anchors: round, oval, emerald,
and Dutch Marquise. More shapes belong only after their anchors are reviewed.

New and materially updated public pages are submitted through IndexNow using the repository's
path-scoped verification key. IndexNow acceptance means the update was received, not that a search
engine promises to crawl or rank it.
