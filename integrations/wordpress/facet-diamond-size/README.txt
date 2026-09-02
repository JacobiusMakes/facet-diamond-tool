=== Facet Diamond Size ===
Contributors: stienhardt
Tags: diamond, carat, engagement ring, calculator, shortcode
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 0.1.0
License: MIT

A private diamond face-up size calculator for articles and resource pages.

== Description ==

Facet converts a selected diamond shape and carat weight into an approximate
face-up size in millimeters. It sets no cookie and stores no customer data.
Only a deliberate inventory click leaves the publisher page. That link contains
the publisher's public slug, selected shape, and carat weight.

Facet is made by Stienhardt & Stones, a New York City jeweler that sources
certified Lab Grown Diamonds and hand-sets and finishes rings in NYC.

== Installation ==

1. Upload the facet-diamond-size folder to /wp-content/plugins/ or install the ZIP.
2. Activate Facet Diamond Size.
3. Add [facet_diamond_size] to any post, page, or Shortcode block.

Optional shortcode attributes:

[facet_diamond_size publisher="your-publication" shape="oval" carat="1.50" theme="light"]

Supported shapes are round, oval, emerald, and dutch_marquise. If publisher is
omitted, the plugin derives a public slug from the site's hostname.

== Privacy ==

The component sets no cookie, makes no background analytics request, and stores
no customer data. The inventory link contains only a public publisher slug,
shape, and carat weight.

== Changelog ==

= 0.1.0 =
* First public package.
