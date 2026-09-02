# Embed Facet

## One-tag web component

The web component has isolated styles, no runtime dependency, and no background tracking. It can
sit directly inside an article, guide, resource page, or application.

```html
<script src="https://cdn.jsdelivr.net/gh/JacobiusMakes/facet-diamond-tool@v0.3.1/facet-widget.js"></script>
<facet-diamond-size
  publisher="YOUR_PUBLICATION"
  shape="oval"
  carat="1.50"
></facet-diamond-size>
```

Optional attributes are `theme="dark"`, `shape`, and `carat`. The element emits a bubbling,
composed `facet-change` event with shape, carat, lengthMm, and widthMm whenever the selection
changes. The placement slug is recorded as `utm_content=web_component_YOUR_PUBLICATION` only
when a reader deliberately opens matching inventory.

Live example: <https://jacobiusmakes.github.io/facet-diamond-tool/widget-demo.html>

ES module delivery is available at
`https://esm.sh/gh/JacobiusMakes/facet-diamond-tool@v0.3.1/facet-widget.js`. The same standalone
file and an npm-ready package archive are attached to the v0.3.1 GitHub Release.

## WordPress

Install the ZIP from
<https://github.com/JacobiusMakes/facet-diamond-tool/releases/tag/wordpress-v0.1.1>, then place the
shortcode in any post, page, or Shortcode block:

```text
[facet_diamond_size publisher="YOUR_PUBLICATION" shape="oval" carat="1.50" theme="light"]
```

If `publisher` is omitted, the plugin derives a public attribution slug from the site's hostname.
The plugin loads the same versioned jsDelivr component and stores no customer data.

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
