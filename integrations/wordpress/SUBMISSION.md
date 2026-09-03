# WordPress.org submission kit

## Package

Upload `facet-diamond-size-wordpress-0.2.0.zip`.

Proposed slug: `facet-diamond-size`

Plugin name: Facet Diamond Size

## Short description

A private diamond face-up size calculator for articles and resource pages.

## What the plugin does

Facet adds a `[facet_diamond_size]` shortcode. A reader selects a diamond shape and carat weight, and the component shows an approximate face-up length and width in millimeters. Supported shapes are round, oval, emerald, and Dutch Marquise.

The plugin bundles its component code. It does not load executable code from another service.

## Privacy answer

Facet sets no cookie, makes no background analytics request, and stores no customer data. By default, it contains no external link. If a site owner explicitly sets `commerce="on"`, the component shows a Stienhardt inventory link containing only a public publisher slug, selected shape, and carat weight.

## External services answer

The default plugin output uses no external service. With the optional `commerce="on"` setting, a reader may deliberately click an ordinary outbound link to Stienhardt & Stones. No data is sent until that click. The destination receives the publisher slug, selected shape, and carat weight in the link query string. No cookie, report number, listing URL, price, seller, or personal information is included.

Service: Stienhardt & Stones inventory pages, <https://stienhardt.com/>

Privacy policy: <https://stienhardt.com/policies/privacy-policy>

## Ownership and originality answer

Stienhardt & Stones owns and maintains the plugin code. Facet is released under the MIT License. The package includes its source code and license.

## Submission sequence

1. Sign in to the WordPress.org account that should own the plugin.
2. Open <https://wordpress.org/plugins/developers/add/>.
3. Upload the release ZIP.
4. Paste the answers above if the review form asks about privacy or external services.
5. After approval, import the approved Subversion repository and publish version 0.2.0.

The WordPress.org account holder must perform the submission because it establishes public ownership of the directory listing.
