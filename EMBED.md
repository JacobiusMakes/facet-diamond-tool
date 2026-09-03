# Embed Facet

## One-tag web component

The web component has isolated styles, no runtime dependency, and no background tracking. It can
sit directly inside an article, guide, resource page, or application.

```html
<script src="https://cdn.jsdelivr.net/gh/JacobiusMakes/facet-diamond-tool@v0.4.1/facet-widget.js"></script>
<facet-diamond-size
  publisher="YOUR_PUBLICATION"
  shape="oval"
  carat="1.50"
  commerce="on"
></facet-diamond-size>
```

Optional attributes are `theme="dark"`, `shape`, `carat`, and `commerce`. Set `commerce="off"`
for a neutral calculator with no external link. The element emits a bubbling,
composed `facet-change` event with shape, carat, lengthMm, and widthMm whenever the selection
changes. The placement slug is recorded as `utm_content=web_component_YOUR_PUBLICATION` only
when a reader deliberately opens matching inventory.

Live example: <https://jacobiusmakes.github.io/facet-diamond-tool/widget-demo.html>

ES module delivery is available at
`https://esm.sh/gh/JacobiusMakes/facet-diamond-tool@v0.4.1/facet-widget.js`. The same standalone
file and an npm-ready package archive are attached to the v0.4.1 GitHub Release.

## WordPress

Install the ZIP from
<https://github.com/JacobiusMakes/facet-diamond-tool/releases/tag/wordpress-v0.2.0>, then place the
shortcode in any post, page, or Shortcode block:

```text
[facet_diamond_size publisher="YOUR_PUBLICATION" shape="oval" carat="1.50" theme="light" commerce="off"]
```

If `publisher` is omitted, the plugin derives a public attribution slug from the site's hostname.
The plugin bundles the component and stores no customer data. Its default calculator contains no
external link. A site owner can deliberately add the attributed inventory route with
`commerce="on"`.

## CMS placement recipes

- Webflow: paste the two-tag component snippet into an Embed element.
- Ghost: paste the snippet into an HTML card.
- Squarespace: paste the snippet into a Code block with HTML enabled.
- WordPress: use the bundled plugin and shortcode above. No script tag is needed.
- Any CMS that strips scripts: use the sandboxed iframe below.

## Sandboxed iframe

Publishers can place the private-by-default size checker inside an article without an SDK,
account, cookie, or script running in the parent page.

```html
<iframe
  src="https://jacobiusmakes.github.io/facet-diamond-tool/embed.html?partner=YOUR_PUBLICATION"
  title="Facet diamond size check"
  width="460"
  height="455"
  loading="lazy"
  style="max-width:100%;border:1px solid #d9d1c4;border-radius:6px"
></iframe>
```

Replace `YOUR_PUBLICATION` with a short public slug. It becomes the non-personal attribution value
`utm_content=embed_YOUR_PUBLICATION` only when a reader chooses to browse Stienhardt inventory.
The widget does not collect the parent URL, article text, report number, or reader identity.

Contact: jgalperin@stienhardt.com
